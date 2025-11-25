package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "REFUND")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "refund_seq")
    @SequenceGenerator(name = "refund_seq", sequenceName = "SEQ_REFUND_REFUNDID_SEQ", allocationSize = 1)
    @Column(name = "REFUNDID_SEQ")
    private int refundId;

    @Column(name = "ORDERITEMID_SEQ", nullable = false, insertable = false, updatable = false)
    private int orderItemId;

    @Column(name = "USERID_SEQ", nullable = false, insertable = false, updatable = false)
    private int userId;

    @Column(name = "REFUNDTYPE", length = 3)
    private String refundType;  // REF=환불, EXC=교환 (DB 저장용), API는 "REFUND"/"EXCHANGE"로 변환

    @Column(name = "REASON", nullable = false, length = 100)
    private String reason;

    @Column(name = "REASONDETAIL", length = 2000)
    private String reasonDetail;

    @Column(name = "REFUNDAMOUNT")
    private Integer refundAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDERITEMID_SEQ", nullable = false)
    private OrderItem orderItem;  // 주문상세 (FK -> OrderItem)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID_SEQ", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @Column(name = "STATUS", length = 20)
    private String status;  // REQ, APR, REJ, COM, CAN

    @Column(name = "PREVIOUSSTATUS", length = 20)
    private String previousStatus;  // orderItem status before request

    @Column(name = "SELLERRESPONSE", length = 200)
    private String sellerResponse;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT")
    private Timestamp updatedAt;
}

