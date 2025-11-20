package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.ReviewImage;
import com.example.backend.repository.ReviewImageRepository;
import java.util.List;

@Repository
public class ReviewImageDAO {
    
    @Autowired
    private ReviewImageRepository reviewImageRepository;
    
    // 리뷰 이미지 저장
    public ReviewImage save(ReviewImage reviewImage) {
        return reviewImageRepository.save(reviewImage);
    }
    
    // 리뷰 이미지 목록 저장
    public List<ReviewImage> saveAll(List<ReviewImage> reviewImages) {
        return reviewImageRepository.saveAll(reviewImages);
    }
    
    // 리뷰 ID로 이미지 목록 조회
    public List<ReviewImage> findByReviewId(int reviewId) {
        return reviewImageRepository.findByReviewId(reviewId);
    }
    
    // 리뷰 이미지 삭제
    public void deleteById(int reviewImageId) {
        reviewImageRepository.deleteById(reviewImageId);
    }
}

