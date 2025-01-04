package com.clinicappoint.clinic.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicappoint.clinic.Entity.DataEntity;
import com.clinicappoint.clinic.Service.DataService;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private DataService dataService;

    @GetMapping
    public List<DataEntity> getAllData() {
        return dataService.getAllData();
    }
}