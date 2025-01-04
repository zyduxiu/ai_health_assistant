package com.clinicappoint.clinic.ServiceImp;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.clinicappoint.clinic.Entity.DataEntity;
import com.clinicappoint.clinic.Repository.DataRepository;
import com.clinicappoint.clinic.Service.DataService;

@Service
public class DataServiceImpl implements DataService {

    @Autowired
    private DataRepository dataRepository;

    @Override
    public List<DataEntity> getAllData() {
        return dataRepository.findAll();
    }

}