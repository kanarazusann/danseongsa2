package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "REVIEWIMAGE")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reviewimage_seq")
    @SequenceGenerator(name = "reviewimage_seq", sequenceName = "SEQ_REVIEWIMAGE_REVIEWIMAGEID", allocationSize = 1)
    @Column(name = "REVIEWIMAGEID")
    private int reviewImageId;

    @Column(name = "REVIEWID", nullable = false, insertable = false, updatable = false)
    private int reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REVIEWID", nullable = false)
    private Review review;  // 리뷰 (FK -> Review)

    @Column(name = "IMAGEURL", nullable = false, length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "CREATEDAT", nullable = false, updatable = false)
    private Timestamp createdAt;
}

