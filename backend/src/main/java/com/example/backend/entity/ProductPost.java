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
@Table(name = "PRODUCTPOST")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductPost {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "productpost_seq")
    @SequenceGenerator(name = "productpost_seq", sequenceName = "SEQ_PRODUCTPOST_POSTID_SEQ", allocationSize = 1)
    @Column(name = "POSTID_SEQ")
    private int postId;

    @Column(name = "USERID_SEQ", nullable = false, insertable = false, updatable = false)
    private int sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID_SEQ", nullable = false)
    private User seller;  // 판매자 (FK -> User)

    @Column(name = "CATEGORYID_SEQ", nullable = false, insertable = false, updatable = false)
    private int categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORYID_SEQ", nullable = false)
    private Category category;  // 카테고리 (FK -> Category)

    @Column(name = "POSTNAME", nullable = false, length = 200)
    private String postName;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "BRAND", length = 100)
    private String brand;

    @Column(name = "MATERIAL", length = 100)
    private String material;

    @Column(name = "VIEWCOUNT", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "WISHCOUNT", nullable = false)
    private Integer wishCount = 0;

    @Column(name = "STATUS", nullable = false)
    private Integer status;  // 1=SELLING, 0=SOLD_OUT

    @Column(name = "GENDER", length = 1)
    private String gender;  // M=MEN, W=WOMEN, U=UNISEX

    @Column(name = "SEASON", length = 3)
    private String season;  // SPR=SPRING, SMR=SUMMER, FAL=FALL, WTR=WINTER, ALL=ALL_SEASON

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private Timestamp updatedAt;

    // 관계 매핑
    @OneToMany(mappedBy = "productPost", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products;  // 게시물에 속한 상품 목록

    @OneToMany(mappedBy = "productPost", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductImage> productImages;  // 게시물에 속한 이미지 목록

    @OneToMany(mappedBy = "productPost", fetch = FetchType.LAZY)
    private List<Review> reviews;  // 게시물에 대한 리뷰 목록

    @OneToMany(mappedBy = "productPost", fetch = FetchType.LAZY)
    private List<Wishlist> wishlists;  // 게시물에 대한 찜 목록
}

