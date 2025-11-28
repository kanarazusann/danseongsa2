package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Wishlist;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {

    Optional<Wishlist> findByUserIdAndPostId(int userId, int postId);

    long countByPostId(int postId);
    
    // 사용자 ID로 찜 목록 조회 (최신순)
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(int userId);
    
    // 게시물 ID로 찜 목록 조회
    List<Wishlist> findByPostId(int postId);
    
    // 게시물 ID로 찜 목록 삭제
    void deleteByPostId(int postId);
}

