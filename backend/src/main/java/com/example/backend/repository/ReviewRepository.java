package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.backend.entity.Review;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    // 게시물 ID로 리뷰 목록 조회
    List<Review> findByPostId(int postId);
    
    // 사용자 ID로 리뷰 목록 조회
    List<Review> findByUserId(int userId);
    
    // 주문상세 ID로 리뷰 조회 (중복 리뷰 방지)
    Review findByOrderItemId(int orderItemId);
    
    // 리뷰 ID로 조회 (ProductPost와 함께 로드)
    @Query("SELECT r FROM Review r JOIN FETCH r.productPost WHERE r.reviewId = :reviewId")
    Optional<Review> findByIdWithProductPost(@Param("reviewId") int reviewId);
}

