package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.Review;
import com.example.backend.repository.ReviewRepository;
import java.util.List;
import java.util.Optional;

@Repository
public class ReviewDAO {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    // 리뷰 저장
    public Review save(Review review) {
        return reviewRepository.save(review);
    }
    
    // 리뷰 ID로 조회
    public Optional<Review> findById(int reviewId) {
        return reviewRepository.findById(reviewId);
    }
    
    // 게시물 ID로 리뷰 목록 조회
    public List<Review> findByPostId(int postId) {
        return reviewRepository.findByPostId(postId);
    }
    
    // 사용자 ID로 리뷰 목록 조회
    public List<Review> findByUserId(int userId) {
        return reviewRepository.findByUserId(userId);
    }
    
    // 주문상세 ID로 리뷰 조회
    public Review findByOrderItemId(int orderItemId) {
        return reviewRepository.findByOrderItemId(orderItemId);
    }
    
    // 리뷰 삭제
    public void deleteById(int reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}

