package com.example.backend.controller;

import com.example.backend.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // 찜 상태 조회
    @GetMapping("/wishlist/status")
    public Map<String, Object> getWishlistStatus(@RequestParam("userId") int userId,
                                                 @RequestParam("postId") int postId) {
        Map<String, Object> map = new HashMap<>();
        try {
            boolean isWished = wishlistService.isWished(userId, postId);
            map.put("rt", "OK");
            map.put("isWished", isWished);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "찜 상태 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return map;
    }

    // 찜 추가
    @PostMapping("/wishlist")
    public Map<String, Object> addWishlist(@RequestParam("userId") int userId,
                                           @RequestParam("postId") int postId) {
        Map<String, Object> map = new HashMap<>();
        try {
            int wishCount = wishlistService.addWishlist(userId, postId);
            map.put("rt", "OK");
            map.put("wishCount", wishCount);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "찜 추가 중 오류가 발생했습니다: " + e.getMessage());
        }
        return map;
    }

    // 찜 삭제
    @DeleteMapping("/wishlist")
    public Map<String, Object> removeWishlist(@RequestParam("userId") int userId,
                                              @RequestParam("postId") int postId) {
        Map<String, Object> map = new HashMap<>();
        try {
            int wishCount = wishlistService.removeWishlist(userId, postId);
            map.put("rt", "OK");
            map.put("wishCount", wishCount);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "찜 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        return map;
    }
    
    // 사용자 찜목록 조회
    @GetMapping("/wishlist")
    public Map<String, Object> getUserWishlist(@RequestParam("userId") int userId) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<Map<String, Object>> wishlist = wishlistService.getUserWishlist(userId);
            map.put("rt", "OK");
            map.put("items", wishlist);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "찜목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return map;
    }
}

