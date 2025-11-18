package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "ORDERITEM")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "orderitem_seq")
    @SequenceGenerator(name = "orderitem_seq", sequenceName = "SEQ_ORDERITEM_ORDERITEMID", allocationSize = 1)
    @Column(name = "ORDERITEMID")
    private int orderItemId;

    @Column(name = "ORDERID", nullable = false, insertable = false, updatable = false)
    private int orderId;

    @Column(name = "PRODUCTID", nullable = false, insertable = false, updatable = false)
    private int productId;

    @Column(name = "POSTID", nullable = false, insertable = false, updatable = false)
    private int postId;

    @Column(name = "SELLERID", nullable = false, insertable = false, updatable = false)
    private int sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDERID", nullable = false)
    private Order order;  // 주문 (FK -> Order)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTID", nullable = false)
    private Product product;  // 상품 (FK -> Product)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID", nullable = false)
    private ProductPost productPost;  // 상품게시물 (FK -> ProductPost)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SELLERID", nullable = false)
    private User seller;  // 판매자 (FK -> User)

    @Column(name = "POSTNAME", length = 200)
    private String postName;

    @Column(name = "COLOR", length = 50)
    private String color;

    @Column(name = "PRODUCTSIZE", length = 20)
    private String productSize;  // Oracle 예약어 SIZE 대신 PRODUCTSIZE 사용

    @Column(name = "QUANTITY", nullable = false)
    private Integer quantity;

    @Column(name = "PRICE", nullable = false)
    private Integer price;

    @Column(name = "STATUS", length = 20)
    private String status;  // CONFIRMED, CANCELLED, REFUNDED

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;

    // 관계 매핑
    @OneToOne(mappedBy = "orderItem", fetch = FetchType.LAZY)
    private Review review;  // 주문상세에 대한 리뷰 (1:1)

    @OneToMany(mappedBy = "orderItem", fetch = FetchType.LAZY)
    private List<Refund> refunds;  // 주문상세에 대한 환불/교환 목록
}

