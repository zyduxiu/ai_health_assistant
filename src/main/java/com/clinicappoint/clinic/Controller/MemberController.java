package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.MemberCard;
import com.clinicappoint.clinic.Entity.VisitRecords;
import com.clinicappoint.clinic.Repository.MemberCardRepository;
import com.clinicappoint.clinic.Repository.MemberListRepository;
import com.clinicappoint.clinic.Util.SessionUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.clinicappoint.clinic.Entity.MemberList;
import com.clinicappoint.clinic.Service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Data
@RestController
@RequestMapping("/api/members")
@CrossOrigin
public class MemberController {

    private static final Logger logger = LoggerFactory.getLogger(MemberController.class);

    @Autowired
    MemberService memberService;

    @Autowired
    private MemberListRepository memberListRepository;

    @Autowired
    private MemberCardRepository memberCardRepository;

    private MemberList memberList;

    @GetMapping
    public List<MemberList> getAllMembers() {
        return memberService.findAllMembers();
    }

    @GetMapping("/member")
    public List<MemberList> getAllMember(HttpServletRequest request) {
        HttpSession session=request.getSession(false);
        Object userName=session.getAttribute("userName");
        String username=userName.toString();
        return memberService.findMembers(username);
    }


    @PostMapping("/changeMember")
    public ResponseEntity<String> changeMember(@RequestBody changeMember pd){
        memberService.adjustMember(pd.username,pd.email,pd.phonenumber);
        return ResponseEntity.ok("YES");
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberList> getMemberById(@PathVariable Integer id) {
        return memberService.findMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/hey")
    public ResponseEntity<List<MemberList>> getMemberByName(@RequestParam String name) {
        List<MemberList> members = memberListRepository.findByMemberName(name);
        if (members.isEmpty()) {
            System.out.println("No Members Found with name" + name);
            return ResponseEntity.notFound().build();
        }
        System.out.println("Members Found with name" + name);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/getallmembers")
    public ResponseEntity<List<MemberList>> getAllmembers() {
        List<MemberList> members = memberListRepository.findAll();
        if (members == null || members.isEmpty()) {
            System.out.println("No members found");
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(Collections.emptyList());
        }
        System.out.println("Members found: " + members.size());
        return ResponseEntity.ok(members);
    }

    @GetMapping("/getAllCards")
    public List<MemberCard> getAllcards(){
        List<MemberCard> memberCards = memberCardRepository.findAll();
        return memberCards;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addMember(@RequestBody MemberList memberList) {
        try {
            MemberList savedMember = memberService.addMember(memberList);
            if (savedMember == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("error", "Member not saved");
                            put("status", "error");
                        }});
            }
            return ResponseEntity.ok(savedMember);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("error", e.getMessage());
                        put("status", "error");
                    }});
        }
    }

    @PostMapping("/update")
    public ResponseEntity<MemberList> editMember(@RequestBody MemberList member) {
        try {
            MemberList updatedMember = memberService.updateMember(member);
            return ResponseEntity.ok(updatedMember);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }


    @GetMapping("/checkClientExists")
    public ResponseEntity<Boolean> checkClientExists(@RequestParam String memberPhone) {
        MemberList member = memberListRepository.findByMemberPhone(memberPhone);
        return ResponseEntity.ok(member != null);
    }

    @PostMapping("/memberPay")
    public String addVisitRecordAndDeductFees(@RequestParam String phoneNumber, @RequestBody VisitRecords visitRecord, @RequestParam int cost) {
        try {
            memberService.addVisitRecordAndDeductFees(phoneNumber, visitRecord, cost);
            return "Success";
        } catch (RuntimeException e) {
            return "Error: " + e.getMessage();
        }
    }

    public MemberList save(MemberList member) {
        return memberListRepository.save(member);
    }

    @Data
    static class changeMember{
        private String username;
        private String email;
        private String phonenumber;
    }


}
