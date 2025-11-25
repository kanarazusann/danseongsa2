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
    @SequenceGenerator(name = "productimage_seq", sequenceName = "SEQ_PRODUCTIMAGE_IMAGEID_SEQ", allocationSize = 1)
    @Column(name = "IMAGEID_SEQ")
    private int imageId;

    @Column(name = "POSTID_SEQ", nullable = false, insertable = false, updatable = false)
    private int postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSTID_SEQ", nullable = false)
    private ProductPost productPost;  // 상품게시물 (FK -> ProductPost)

    @Column(name = "IMAGEURL", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "ISMAIN", nullable = false)
    private Integer isMain = 0;  // 0: 일반, 1: 대표

    @Column(name = "IMAGETYPE", length = 20)
    private String imageType;  // 'GALLERY': 갤러리 이미지, 'DESCRIPTION': 상품 설명 이미지

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

