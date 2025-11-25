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
@Table(name = "PRODUCT")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "SEQ_PRODUCT_PRODUCTID_SEQ", allocationSize = 1)
    @Column(name = "PRODUCTID_SEQ")
    private int productId;

    @Column(name = "POSTID_SEQ", nullable = false, insertable = false, updatable = false)
    private int postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID_SEQ", nullable = false)
    private ProductPost productPost;  // 상품게시물 (FK -> ProductPost)

    @Column(name = "COLOR", nullable = false, length = 50)
    private String color;

    @Column(name = "PRODUCTSIZE", nullable = false, length = 20)
    private String productSize;  // Oracle 예약어 SIZE 대신 PRODUCTSIZE 사용

    @Column(name = "PRICE", nullable = false)
    private Integer price;

    @Column(name = "DISCOUNTPRICE")
    private Integer discountPrice;

    @Column(name = "STOCK", nullable = false)
    private Integer stock = 0;

    @Column(name = "STATUS", nullable = false)
    private Integer status;  // 1=SELLING, 0=SOLD_OUT (DB 저장용), API는 "SELLING"/"SOLD_OUT" 문자열로 변환

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private Timestamp updatedAt;

    // 관계 매핑
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Cart> carts;  // 장바구니에 담긴 상품 목록

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;  // 주문된 상품 목록

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<Review> reviews;  // 상품에 대한 리뷰 목록
}

