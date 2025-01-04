package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.UserAuth;
import com.clinicappoint.clinic.Repository.UserAuthRepository;
import com.clinicappoint.clinic.Service.UserAuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class getAccount {

    @Autowired
    UserAuthRepository userAuthRepository;

    @Autowired
    UserAuthService userAuthService;

    @GetMapping("/getAccount")
    public List<UserAuth> getAllAccount(){
        return userAuthRepository.findAll();
    }

    @PostMapping("/updateaccount")
    public ResponseEntity<String> updateAccount(@RequestBody updateaccount pd){
        int id=pd.getId();
        String name=pd.getName();
        if(userAuthService.updateAccountName(id,name)){
            return ResponseEntity.ok("ok");
        }
        else{
            return ResponseEntity.badRequest().body("np");
        }
    }

    @Data
    static class updateaccount{
            private int id;
            private String name;
    }
}
