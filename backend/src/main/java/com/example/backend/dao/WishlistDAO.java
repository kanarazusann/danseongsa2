package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.Wishlist;
import com.example.backend.repository.WishlistRepository;

import java.util.List;
import java.util.Optional;

@Repository
public class WishlistDAO {

    @Autowired
    private WishlistRepository wishlistRepository;

    @SuppressWarnings("null")
    public Wishlist save(Wishlist wishlist) {
        return wishlistRepository.save(wishlist);
    }

    public Optional<Wishlist> findByUserIdAndPostId(int userId, int postId) {
        return wishlistRepository.findByUserIdAndPostId(userId, postId);
    }

    @SuppressWarnings("null")
    public void delete(Wishlist wishlist) {
        wishlistRepository.delete(wishlist);
    }

    public long countByPostId(int postId) {
        return wishlistRepository.countByPostId(postId);
    }
    
    // 사용자 ID로 찜 목록 조회 (최신순)
    public List<Wishlist> findByUserIdOrderByCreatedAtDesc(int userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    // 게시물 ID로 찜 목록 조회
    public List<Wishlist> findByPostId(int postId) {
        return wishlistRepository.findByPostId(postId);
    }
    
    // 게시물 ID로 찜 목록 삭제
    public void deleteByPostId(int postId) {
        wishlistRepository.deleteByPostId(postId);
    }
}

