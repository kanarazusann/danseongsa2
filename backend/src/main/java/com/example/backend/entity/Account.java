package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "ACCOUNT")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "account_seq")
    @SequenceGenerator(name = "account_seq", sequenceName = "SEQ_ACCOUNT_ACCOUNTID", allocationSize = 1)
    @Column(name = "ACCOUNTID")
    private int accountId;

    @Column(name = "USERID", nullable = false, insertable = false, updatable = false)
    private int userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @Column(name = "BANKNAME", nullable = false, length = 50)
    private String bankName;

    @Column(name = "ACCOUNTNUMBER", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "ACCOUNTHOLDER", nullable = false, length = 50)
    private String accountHolder;

    @Column(name = "BALANCE", nullable = false, columnDefinition = "NUMBER DEFAULT 0")
    private Integer balance = 0;

    @Column(name = "ISDEFAULT", nullable = false, columnDefinition = "NUMBER(1) DEFAULT 0")
    private Integer isDefault = 0;  // 0: 일반, 1: 기본

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    // 관계 매핑
    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    private List<Payment> payments;  // 계좌로 결제한 내역 목록

    @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
    private List<Refund> refunds;  // 계좌로 환불받은 내역 목록
}

