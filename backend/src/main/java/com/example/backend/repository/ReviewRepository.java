package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Review;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // 게시물 ID로 리뷰 목록 조회
    List<Review> findByPostId(int postId);
    
    // 사용자 ID로 리뷰 목록 조회
    List<Review> findByUserId(int userId);
    
    // 주문상세 ID로 리뷰 조회 (중복 리뷰 방지)
    Review findByOrderItemId(int orderItemId);
}

