package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "\"order\"")  // Oracle 예약어이므로 따옴표로 감싸기, 실제 테이블명은 소문자 "order"
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "SEQ_ORDER_ORDERID_SEQ", allocationSize = 1)
    @Column(name = "ORDERID_SEQ")
    private int orderId;

    @Column(name = "USERID_SEQ", nullable = false, insertable = false, updatable = false)
    private int userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID_SEQ", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @Column(name = "OD_NO", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "TOTALPRICE", nullable = false)
    private Integer totalPrice;

    @Column(name = "DISCOUNTAMOUNT", nullable = false)
    private Integer discountAmount = 0;

    @Column(name = "DV_FEE", nullable = false)
    private Integer deliveryFee = 0;

    @Column(name = "FINALPRICE", nullable = false)
    private Integer finalPrice;

    @Column(name = "OD_STATUS", length = 20)
    private String orderStatus;  // CONFIRMED, PAID, DELIVERED, CANCELLED

    @Column(name = "RECIPIENTNAME", nullable = false, length = 50)
    private String recipientName;

    @Column(name = "RECIPIENTPHONE", nullable = false, length = 20)
    private String recipientPhone;

    @Column(name = "ZIPCODE", length = 10)
    private String zipcode;

    @Column(name = "ADDR", nullable = false, length = 500)
    private String address;

    @Column(name = "DETAILADDRESS", length = 200)
    private String detailAddress;

    @Column(name = "DV_MEMO", length = 200)
    private String deliveryMemo;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private Timestamp updatedAt;

    // 관계 매핑
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;  // 주문에 속한 주문상세 목록

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<Payment> payments;  // 주문에 대한 결제 목록
}

