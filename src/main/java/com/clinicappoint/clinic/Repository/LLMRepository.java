package com.clinicappoint.clinic.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clinicappoint.clinic.Entity.LLM;

@Repository
public interface LLMRepository extends JpaRepository<LLM, Integer> {
}