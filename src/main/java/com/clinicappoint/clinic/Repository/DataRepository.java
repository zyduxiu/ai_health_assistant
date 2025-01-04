package com.clinicappoint.clinic.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clinicappoint.clinic.Entity.DataEntity;

@Repository
public interface DataRepository extends JpaRepository<DataEntity, Integer> {
}