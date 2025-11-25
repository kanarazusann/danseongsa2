package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "CATEGORY")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "category_seq")
    @SequenceGenerator(name = "category_seq", sequenceName = "SEQ_CATEGORY_CATEGORYID_SEQ", allocationSize = 1)
    @Column(name = "CATEGORYID_SEQ")
    private int categoryId;

    @Column(name = "MAIN_CATEGORY", nullable = false, length = 20)
    private String mainCategory;  // 전체, 남성, 여성

    @Column(name = "MID_CATEGORY", nullable = false, length = 50)
    private String midCategory;  // 신발, 상의, 아우터, 바지, 원피스/스커트, 가방, 패션소품

    @Column(name = "SUB_CATEGORY", nullable = false, length = 50)
    private String subCategory;  // 스니커즈, 맨투맨, 후드 등

    @Column(name = "CATEGORYNAME", nullable = false, length = 100)
    private String categoryName;  // 전체 경로: "신발 스니커즈"

    @Column(name = "IMAGE_URL", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

