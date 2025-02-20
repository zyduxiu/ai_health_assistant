package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.UserAuth;
import com.clinicappoint.clinic.Service.UserAuthService;
import com.clinicappoint.clinic.Util.SessionUtils;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
public class LoginController {
    @Autowired
    UserAuthService userAuthService;
    @CrossOrigin
    @GetMapping("/login")
    public UserAuth checkLogin(String username, String password){
        if(userAuthService.getLogininformation(username,password)!=null){
            SessionUtils.setSession(userAuthService.getLogininformation(username,password));
        }
        return userAuthService.getLogininformation(username,password);
    }

    @CrossOrigin
    @PostMapping("/delaccount")
    public ResponseEntity<String> delAccount(@RequestBody delbody pd){
        int delid=pd.getId();
        userAuthService.delaccount(delid);
        return ResponseEntity.ok("ok");
    }

    @CrossOrigin
    @PostMapping("/addaccount")
    public ResponseEntity<String> addAccount(@RequestBody signupbody pd){
        if(userAuthService.Signup(pd.getUsername(),pd.getPassword(),pd.getEmail(),pd.getPhoneNumber())){
            return ResponseEntity.ok("Success");
        }
        else{
            return ResponseEntity.badRequest().body(pd.getUsername());
        }
    }


    @CrossOrigin
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody signupbody pd){
        if(userAuthService.Signup(pd.getUsername(),pd.getPassword(),pd.getEmail(),pd.getPhoneNumber())){
            return ResponseEntity.ok("Success");
        }
        else{
            return ResponseEntity.badRequest().body(pd.getUsername());
        }
    }

    @Data
    static class delbody{
        int id;
    }
    @Data
    static class signupbody{
        String username;
        String password;
        String email;
        String phoneNumber;
    }
}
