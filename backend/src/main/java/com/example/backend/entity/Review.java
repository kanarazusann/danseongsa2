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
@Table(name = "REVIEW")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq")
    @SequenceGenerator(name = "review_seq", sequenceName = "SEQ_REVIEW_REVIEWID", allocationSize = 1)
    @Column(name = "REVIEWID")
    private int reviewId;

    @Column(name = "POSTID", nullable = false, insertable = false, updatable = false)
    private int postId;

    @Column(name = "PRODUCTID", insertable = false, updatable = false)
    private Integer productId;  // nullable

    @Column(name = "USERID", nullable = false, insertable = false, updatable = false)
    private int userId;

    @Column(name = "ORDERITEMID", nullable = false, insertable = false, updatable = false)
    private int orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID", nullable = false)
    private ProductPost productPost;  // 상품게시물 (FK -> ProductPost)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTID")
    private Product product;  // 상품 (FK -> Product, nullable)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USERID", nullable = false)
    private User user;  // 사용자 (FK -> User)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDERITEMID", nullable = false)
    private OrderItem orderItem;  // 주문상세 (FK -> OrderItem)

    @Column(name = "RATING", nullable = false)
    private Integer rating;  // 1~5

    @Column(name = "CONTENT", columnDefinition = "CLOB")
    private String content;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATEDAT", nullable = false)
    private Timestamp updatedAt;

    // 관계 매핑
    @OneToMany(mappedBy = "review", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ReviewImage> reviewImages;  // 리뷰에 속한 이미지 목록
}

