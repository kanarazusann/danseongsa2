package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.ProductImage;
import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    
    // 게시물 ID로 이미지 목록 조회
    List<ProductImage> findByPostId(int postId);
    
    // 게시물 ID와 대표이미지 여부로 조회
    List<ProductImage> findByPostIdAndIsMain(int postId, Integer isMain);
}

