package com.clinicappoint.clinic.Service;

import com.clinicappoint.clinic.Entity.MemberCard;
import com.clinicappoint.clinic.Entity.MemberList;
import com.clinicappoint.clinic.Entity.VisitRecords;
import com.clinicappoint.clinic.Repository.MemberCardRepository;
import com.clinicappoint.clinic.Repository.MemberListRepository;
import com.clinicappoint.clinic.Repository.VisitRecordsRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Member;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    MemberCardRepository memberCardRepository;
    @Autowired
    private VisitRecordsRepository visitRecordsRepository;
    @Autowired
    private MemberListRepository memberListRepository;


    public List<MemberList> findAllMembers() {
        List<MemberList> members = memberListRepository.findAll();
        if(members != null & !members.isEmpty()){
            System.out.println("Member found: " + members.size());
            for(MemberList m : members){
                System.out.println(m);
            }
        }
        else {
            System.out.println("No member found");
        }
        return members;
    }

    public Optional<MemberList> findMemberById(int id) {
        return memberListRepository.findById(id);
    }

    @Transactional
    public boolean adjustBalance(String phonenum,int cost){
        MemberCard memberCard=new MemberCard();
        memberCard=memberCardRepository.findByMemberPhone(phonenum);
        if(memberCard.getCardBalance()-cost<0){
            return false;
        }
        if(cost>0){
            if(memberCard.getCardDiscount().equals("十折")){
                memberCard.setCardBalance(memberCard.getCardBalance()-cost);
            }
            if(memberCard.getCardDiscount().equals("九折")){
                memberCard.setCardBalance(memberCard.getCardBalance()-(int) Math.round(cost*0.9));
            }
            if(memberCard.getCardDiscount().equals("八折")){
                memberCard.setCardBalance(memberCard.getCardBalance()-(int) Math.round(cost*0.8));
            }
            if(memberCard.getCardDiscount().equals("七五折")){
                memberCard.setCardBalance(memberCard.getCardBalance()-(int) Math.round(cost*0.75));
            }
        }
        if(cost<0){
            if(memberCard.getCardBalance()-cost==0){
                memberCard.setCardName("无卡");
                memberCard.setCardDiscount("十折");
            }
            else if(memberCard.getCardBalance()-cost<2500){
                memberCard.setCardName("银卡");
                memberCard.setCardDiscount("九折");
            }
            else if(memberCard.getCardBalance()-cost<5000){
                memberCard.setCardName("金卡");
                memberCard.setCardDiscount("八折");
            }
            else{
                memberCard.setCardName("砖石卡");
                memberCard.setCardDiscount("七五折");
            }
        }
        memberCard.setCardBalance(memberCard.getCardBalance()-cost);
        memberCardRepository.save(memberCard);
        return true;
    }


    @Transactional
    public MemberList addMember(MemberList member) {
        MemberList newMember = new MemberList();
        newMember.setMemberAge(member.getMemberAge());
        newMember.setMemberAddress(member.getMemberAddress());
        newMember.setMemberName(member.getMemberName());
        newMember.setMemberEmail(member.getMemberEmail());
        newMember.setMemberPhone(member.getMemberPhone());
        newMember.setMemberGender(member.getMemberGender());
        newMember.setCashIn(member.getCashIn());
        MemberCard mc = new MemberCard();
        if(member.getCashIn()==0){
            mc.setCardName("无卡");
            mc.setCardDiscount("十折");
        }
        else if(member.getCashIn()<2500){
            mc.setCardName("银卡");
            mc.setCardDiscount("九折");
        }
        else if(member.getCashIn()<5000){
            mc.setCardName("金卡");
            mc.setCardDiscount("八折");
        }
        else{
            mc.setCardName("砖石卡");
            mc.setCardDiscount("七五折");
        }
        mc.setCardBalance(member.getCashIn());
        mc.setMemberPhone(member.getMemberPhone());
        mc.setMemberName(member.getMemberName());
        mc.setMemberKey(12345342);
        mc.setCardNumber(345);
        memberCardRepository.save(mc);
        memberListRepository.save(newMember);
        System.out.println("Adding member: " + newMember);
        return newMember;
    }

    @Transactional
    public MemberList updateMember(MemberList member) {
        MemberList existingMember = memberListRepository.findById(member.getMemberKey())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        existingMember.setMemberName(member.getMemberName());
        existingMember.setMemberAge(member.getMemberAge());
        existingMember.setMemberPhone(member.getMemberPhone());
//        existingMember.setMemberAddress(member.getMemberAddress());
//        existingMember.setMemberEmail(member.getMemberEmail());
//        existingMember.setMemberGender(member.getMemberGender());

        return memberListRepository.save(existingMember);
    }

    public MemberList saveMember(MemberList member) {
        MemberList newMember = new MemberList();
        newMember.setMemberAge(member.getMemberAge());
        newMember.setMemberAddress(member.getMemberAddress());
        newMember.setMemberName(member.getMemberName());
        newMember.setMemberEmail(member.getMemberEmail());
        newMember.setMemberPhone(member.getMemberPhone());
        newMember.setMemberGender(member.getMemberGender());
        MemberList savedMember = memberListRepository.save(newMember);
        System.out.println("Saved Member: " + savedMember);
        return savedMember;
    }

    @Transactional
    public void addVisitRecordAndDeductFees(String memberPhone, VisitRecords visitRecords, int cost) {
        //find member
        MemberList member = memberListRepository.findByMemberPhone(memberPhone);
        if(member == null) {
            throw new RuntimeException("No member found");
        }
        int memberKey = member.getMemberKey();

        visitRecords.setMemberKey(memberKey);
        visitRecordsRepository.save(visitRecords);

        MemberCard memberCard = memberCardRepository.findByMemberKey(memberKey);
        if(memberCard == null) {
            throw new RuntimeException("No member card found");
        }

        int newBalance = memberCard.getCardBalance() - cost;
        if(newBalance < 0) {
            throw new RuntimeException("Insufficient balance!");
        }
        memberCard.setCardBalance(newBalance);
        memberCardRepository.save(memberCard);
    }

}
