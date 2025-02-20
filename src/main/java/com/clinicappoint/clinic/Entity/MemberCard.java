package com.clinicappoint.clinic.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "membercard")
@Data
public class MemberCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer cardid;

    private int cardBalance;

    private String cardDiscount;

    private String memberPhone;

    private int cardNumber;

    private String cardName;

    private int memberKey;

    private String memberName;

}