package com.clinicappoint.clinic.ServiceImp;
import com.clinicappoint.clinic.Entity.MemberCard;
import com.clinicappoint.clinic.Entity.MemberList;
import com.clinicappoint.clinic.Entity.UserAuth;
import com.clinicappoint.clinic.Repository.MemberCardRepository;
import com.clinicappoint.clinic.Repository.MemberListRepository;
import com.clinicappoint.clinic.Repository.UserAuthRepository;
import com.clinicappoint.clinic.Service.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class UserAuthServiceImp implements UserAuthService{
    @Autowired
    UserAuthRepository userAuthRepository;
@Autowired
    MemberListRepository memberListRepository;

@Autowired
    MemberCardRepository memberCardRepository;
    @Override
    public UserAuth getLogininformation(String username, String password) {
        if(userAuthRepository.findByUsernameAndPassword(username,password)!=null){
            UserAuth userAuth=userAuthRepository.findByUsernameAndPassword(username,password);
            return userAuth;
        }
        else{
            UserAuth userAuth=new UserAuth();
            userAuth.setPassword(password);
            userAuth.setUsername(username);
            userAuth.setTitle("invalid");
            return userAuth;
        }
    }
    @Override
    public boolean Signup(String username,String password,String email,String phoneNumber){
        UserAuth userAuth=new UserAuth();
        MemberList memberList=new MemberList();
        MemberCard memberCard = new MemberCard();
        if(userAuthRepository.findUserAuthByUsername(username)==null){
            userAuth.setUsername(username);
            userAuth.setPassword(password);
            userAuth.setEmail(email);
            userAuth.setTitle("manager");
            Date newDate=new Date();
            userAuth.setJoinedDate(newDate);
            userAuthRepository.save(userAuth);

            memberList.setMemberName(username);
            memberList.setMemberEmail(email);
            memberList.setMemberPhone(phoneNumber);

            memberCard.setCardDiscount("十折");
            memberCard.setCardBalance(0);
            memberCard.setMemberKey(memberList.getMemberKey());
            memberCard.setCardName("无卡");
            memberCard.setMemberPhone(phoneNumber);
            memberCardRepository.save(memberCard);
            memberListRepository.save(memberList);
            return true;
        }else{
            return false;
        }
    }

    @Override
    public  boolean updateAccountName(int id,String username){
        if(userAuthRepository.findUserAuthByUsername(username)!=null){
            return false;
        }
        else{
            UserAuth userAuth=userAuthRepository.getUserAuthById(id);
            userAuth.setUsername(username);
            userAuthRepository.save(userAuth);
            return true;
        }
    }

    @Override
    public void delaccount(int delid){
        UserAuth userAuth=userAuthRepository.getUserAuthById(delid);
        userAuthRepository.delete(userAuth);
    }
}
