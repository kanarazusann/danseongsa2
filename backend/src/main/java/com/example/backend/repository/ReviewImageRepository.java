package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.ReviewImage;
import java.util.List;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Integer> {
    
    // 리뷰 ID로 이미지 목록 조회
    List<ReviewImage> findByReviewId(int reviewId);
}

