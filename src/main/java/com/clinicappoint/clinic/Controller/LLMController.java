package com.clinicappoint.clinic.Controller;

import com.clinicappoint.clinic.Entity.LLM;
import com.clinicappoint.clinic.Service.LLMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/LLM")
public class LLMController {

    @Autowired
    private LLMService llmService;

    @GetMapping
    public LLM generateResponse() {
        return llmService.generateResponse();
    }
}