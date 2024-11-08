package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.Appointment;
import com.clinicappoint.clinic.Repository.AppointmentRepository;
import com.clinicappoint.clinic.Service.AppointmentTableService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
public class getAppointment {
    @Autowired
    AppointmentTableService appointmentTableService;
    @Autowired
    AppointmentRepository appointmentRepository;

    @CrossOrigin
    @GetMapping("/getAppointDate")
    public List<Appointment> getAppointmentDate(String date){
        return appointmentTableService.getAppointmentTableByDate(date);
    }

    @CrossOrigin
    @PostMapping("/updatepay")
    public ResponseEntity<String> updatepayment(@RequestBody timerange pd){
        appointmentTableService.updateload(pd.getStartHourindex(),pd.getEndHourindex(),pd.getStartMinuteindex(),
                pd.getEndMinuteindex(),pd.getDate(),pd.getDoctor());
        return ResponseEntity.ok("yes");
    }

    @CrossOrigin
    @GetMapping("/getAllAppointments")
    public List<Appointment> getAppointments(){
        List<Appointment> paid = appointmentRepository.findByAttribute("已付费");
        List<Appointment> filtered=appointmentTableService.mergeAppointment(paid);
        return filtered;
    }
    // 统计未付款客户
    @CrossOrigin
    @GetMapping("/api/unpaid")
    public List<Appointment> getUnpaidAppointments() {
        List<Appointment> unpaid = appointmentRepository.findByAttribute("已诊");
        System.out.println("Query Result: " + unpaid);  // 打印查询结果
        if (unpaid.isEmpty()) {
            System.out.println("No unpaid appointments found.");
        } else {
            System.out.println("Unpaid appointments found: " + unpaid.size());
        }
        unpaid=appointmentTableService.mergeAppointment(unpaid);
        return unpaid;
    }

    @CrossOrigin
    @GetMapping("/api/paid")
    public List<Appointment> getAllpaidAppointments() {
        List<Appointment> paid=appointmentRepository.findByAttribute("已付费");
        List<Appointment> unpaid = appointmentRepository.findByAttribute("已诊");
        List<Appointment> allpaid=new ArrayList<>();
        for(Appointment appointment:paid){
            allpaid.add(appointment);
        }
        for(Appointment appointment:unpaid){
            allpaid.add(appointment);
        }
        System.out.println("Query Result: " + allpaid);  // 打印查询结果
        if (allpaid.isEmpty()) {
            System.out.println("No unpaid appointments found.");
        } else {
            System.out.println("Unpaid appointments found: " + allpaid.size());
        }
        allpaid=appointmentTableService.mergeAppointment(allpaid);
        return allpaid;
    }

    @CrossOrigin
    @PostMapping("/updatePaymentStatus")
    public ResponseEntity<String> updatePaymentStatus(@RequestParam int appointmentKey, @RequestParam String status) {
        Appointment appointment = appointmentRepository.findById(appointmentKey).orElse(null);
        if (appointment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Appointment not found");
        }
        appointment.setAttribute(status);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok("Status updated successfully");
    }

    @Data
    static class timerange{
        int startHourindex;
        int endHourindex;
        int startMinuteindex;
        int endMinuteindex;
        String date;
        String doctor;
    }

}
