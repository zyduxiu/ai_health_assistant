package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.MemberCard;
import com.clinicappoint.clinic.Entity.MemberList;
import com.clinicappoint.clinic.Repository.MemberCardRepository;
import com.clinicappoint.clinic.Repository.MemberListRepository;
import com.clinicappoint.clinic.Service.MemberService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MemberCardController {

    @Autowired
    private MemberListRepository memberListRepository;

    @Autowired
    private MemberCardRepository memberCardRepository;

    @Autowired
    private MemberService memberService;

    @GetMapping("/getMemberInfo")
    public ResponseEntity<MemberCard> getMemberInfo(@RequestParam String phoneNumber) {
        MemberList member = memberListRepository.findByMemberPhone(phoneNumber);
        System.out.println(member);
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        MemberCard memberCard = memberCardRepository.findByMemberPhone(phoneNumber);
        if (memberCard == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(memberCard);
    }

    @PostMapping("/adjustbalance")
    public ResponseEntity<String> adjustBalance(@RequestBody adjust pd){
        if(memberService.adjustBalance(pd.getMemberPhone(),pd.getCost())){
            return ResponseEntity.ok("success");
        }
        else{
            return ResponseEntity.badRequest().body("fu");
        }
    }


    @Data
    static class adjust{
        String memberPhone;
        int cost;
    }
}
