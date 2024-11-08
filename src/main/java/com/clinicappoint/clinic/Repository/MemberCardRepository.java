package com.clinicappoint.clinic.Repository;

import com.clinicappoint.clinic.Entity.MemberCard;
import com.clinicappoint.clinic.Entity.MemberList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberCardRepository extends JpaRepository<MemberCard, Integer> {
    MemberCard findByMemberKey(int memberKey);

    MemberCard findByMemberPhone(String memberPhone);
}
