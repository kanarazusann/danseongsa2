package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.backend.entity.ProductPost;
import java.util.List;

public interface ProductPostRepository extends JpaRepository<ProductPost, Integer> {
    
    // 판매자 ID로 게시물 목록 조회
    List<ProductPost> findBySellerId(int sellerId);
    
    // 상태로 게시물 목록 조회
    List<ProductPost> findByStatus(String status);
}

