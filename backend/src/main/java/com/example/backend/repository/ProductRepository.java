package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    
    // 게시물 ID로 상품 목록 조회
    List<Product> findByPostId(int postId);
}

