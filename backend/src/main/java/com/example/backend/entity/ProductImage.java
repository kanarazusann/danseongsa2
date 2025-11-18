package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "PRODUCTIMAGE")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "productimage_seq")
    @SequenceGenerator(name = "productimage_seq", sequenceName = "SEQ_PRODUCTIMAGE_IMAGEID", allocationSize = 1)
    @Column(name = "IMAGEID")
    private int imageId;

    @Column(name = "POSTID", nullable = false, insertable = false, updatable = false)
    private int postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID", nullable = false)
    private ProductPost productPost;  // 상품게시물 (FK -> ProductPost)

    @Column(name = "IMAGEURL", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "ISMAIN", nullable = false, columnDefinition = "NUMBER(1) DEFAULT 0")
    private Integer isMain = 0;  // 0: 일반, 1: 대표

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

