package com.clinicappoint.clinic.ServiceImp;
import com.clinicappoint.clinic.Entity.UserAuth;
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
    public boolean Signup(String username,String password,String email){
        UserAuth userAuth=new UserAuth();
        if(userAuthRepository.findUserAuthByUsername(username)==null){
            userAuth.setUsername(username);
            userAuth.setPassword(password);
            userAuth.setEmail(email);
            userAuth.setTitle("manager");
            Date newDate=new Date();
            userAuth.setJoinedDate(newDate);
            userAuthRepository.save(userAuth);
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
