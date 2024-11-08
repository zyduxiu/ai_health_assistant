package com.clinicappoint.clinic.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Entity
@Table
@Data
public class MemberList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int memberKey;

    private String memberAddress;

    private int memberAge;

    private String memberEmail;

    private String memberGender;

    private String memberName;

    private String memberPhone;

    private int cashIn;


}
