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
@Table(name = "\"user\"")  // Oracle 예약어이므로 따옴표로 감싸기
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "SEQ_USER_USERID_SEQ", allocationSize = 1)
    @Column(name = "USERID_SEQ")
    private int userId;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "PASSWORD", nullable = false, length = 255)
    private String password;

    @Column(name = "NAME", nullable = false, length = 50)
    private String name;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "ISSELLER", nullable = false)
    private Integer isSeller = 0;  // 0: 일반, 1: 사업자

    @Column(name = "BN_NO")
    private Integer businessNumber;  // 실제 DB는 NUMBER 타입

    @Column(name = "BRAND", length = 100)
    private String brand;

    @Column(name = "ZIPCODE", length = 10)
    private String zipcode;

    @Column(name = "ADDR", length = 500)
    private String address;

    @Column(name = "D_ADDR", length = 200)
    private String detailAddress;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private Timestamp updatedAt;

    // 관계 매핑
    @OneToMany(mappedBy = "seller", fetch = FetchType.LAZY)
    private List<ProductPost> productPosts;  // 판매자가 등록한 상품게시물 목록

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Cart> carts;  // 사용자의 장바구니 목록

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Wishlist> wishlists;  // 사용자의 찜 목록

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Order> orders;  // 사용자의 주문 목록

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Review> reviews;  // 사용자가 작성한 리뷰 목록

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Refund> refunds;  // 사용자의 환불/교환 목록
}

