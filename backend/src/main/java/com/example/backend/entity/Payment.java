package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "PAYMENT")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "SEQ_PAYMENT_PAYMENTID", allocationSize = 1)
    @Column(name = "PAYMENTID")
    private int paymentId;

    @Column(name = "ORDERID", nullable = false, insertable = false, updatable = false)
    private int orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDERID", referencedColumnName = "ORDERID_SEQ", nullable = false)
    private Order order;  // 주문 (FK -> Order) - DB 컬럼명: ORDERID (FK -> "order".ORDERID_SEQ)

    @Column(name = "PAYMENTMETHOD", length = 20)
    private String paymentMethod;  // CARD, TOSS

    @Column(name = "AMOUNT", nullable = false)
    private Integer amount;

    @Column(name = "STATUS", length = 20)
    private String status;  // COMPLETED, FAILED, CANCELLED

    @Column(name = "TRANSACTIONID", length = 100)
    private String transactionId;

    @CreationTimestamp
    @Column(name = "PAIDAT", nullable = false, updatable = false)
    private Timestamp paidAt;
}

