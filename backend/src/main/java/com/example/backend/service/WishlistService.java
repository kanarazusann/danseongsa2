package com.example.backend.service;

import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dao.WishlistDAO;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.User;
import com.example.backend.entity.Wishlist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    @Autowired
    private WishlistDAO wishlistDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ProductPostDAO productPostDAO;

    // 찜 여부 확인
    @Transactional(readOnly = true)
    public boolean isWished(int userId, int postId) {
        return wishlistDAO.findByUserIdAndPostId(userId, postId).isPresent();
    }

    // 찜 추가
    @Transactional
    public int addWishlist(int userId, int postId) {
        if (isWished(userId, postId)) {
            return getWishCount(postId);
        }

        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        ProductPost post = productPostDAO.findById(postId);
        if (post == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProductPost(post);
        wishlistDAO.save(wishlist);

        // 트리거로 wishCount 업데이트되므로 새 값 조회
        return getWishCount(postId);
    }

    // 찜 삭제
    @Transactional
    public int removeWishlist(int userId, int postId) {
        wishlistDAO.findByUserIdAndPostId(userId, postId)
                .ifPresent(wishlistDAO::delete);
        return getWishCount(postId);
    }

    // 현재 찜수 조회
    @Transactional(readOnly = true)
    public int getWishCount(int postId) {
        ProductPost post = productPostDAO.findById(postId);
        if (post == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }
        return (int) wishlistDAO.countByPostId(postId);
    }
}

