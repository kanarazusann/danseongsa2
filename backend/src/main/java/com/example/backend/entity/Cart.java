package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "CART")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cart_seq")
    @SequenceGenerator(name = "cart_seq", sequenceName = "SEQ_CART_CARTID_SEQ", allocationSize = 1)
    @Column(name = "CARTID_SEQ")
    private int cartId;

    @Column(name = "USERID_SEQ", nullable = false, insertable = false, updatable = false)
    private int userId;

    @Column(name = "PRODUCTID_SEQ", nullable = false, insertable = false, updatable = false)
    private int productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID_SEQ", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTID_SEQ", nullable = false)
    private Product product;  // 상품 (FK -> Product)

    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

