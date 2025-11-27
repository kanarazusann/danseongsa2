package com.example.backend.controller;

import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.ReviewImageDAO;
import com.example.backend.entity.Review;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ReviewImage;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private ProductImageDAO productImageDAO;
    
    @Autowired
    private ReviewImageDAO reviewImageDAO;
    
    // 리뷰 작성
    @PostMapping("/reviews")
    public Map<String, Object> createReview(
            @RequestParam("userId") int userId,
            @RequestParam("postId") int postId,
            @RequestParam(value = "productId", required = false) Integer productId,
            @RequestParam("orderItemId") int orderItemId,
            @RequestParam("rating") int rating,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            Review review = reviewService.createReview(userId, postId, productId, orderItemId, rating, content, images);
            
            // 순환 참조 방지를 위해 필요한 필드만 Map으로 구성
            Map<String, Object> item = new HashMap<>();
            item.put("reviewId", review.getReviewId());
            item.put("postId", review.getPostId());
            item.put("productId", review.getProductId());
            item.put("userId", review.getUserId());
            item.put("orderItemId", review.getOrderItemId());
            item.put("rating", review.getRating());
            item.put("content", review.getContent());
            item.put("sellerReply", review.getSellerReply());
            item.put("sellerReplyAt", review.getSellerReplyAt());
            item.put("createdAt", review.getCreatedAt());
            item.put("updatedAt", review.getUpdatedAt());
            
            map.put("rt", "OK");
            map.put("item", item);
            map.put("message", "리뷰가 성공적으로 작성되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "리뷰 작성 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 게시물 ID로 리뷰 목록 조회
    @GetMapping("/reviews")
    public Map<String, Object> getReviews(
            @RequestParam(value = "postId", required = false) Integer postId,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "sellerId", required = false) Integer sellerId) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            List<Review> reviews;
            
            if (postId != null) {
                reviews = reviewService.getReviewsByPostId(postId);
            } else if (userId != null) {
                reviews = reviewService.getReviewsByUserId(userId);
            } else if (sellerId != null) {
                reviews = reviewService.getReviewsBySellerId(sellerId);
            } else {
                map.put("rt", "FAIL");
                map.put("message", "postId, userId 또는 sellerId를 입력해주세요.");
                return map;
            }
            
            // 순환 참조 방지를 위해 필요한 필드만 Map으로 구성
            List<Map<String, Object>> items = reviews.stream()
                    .map(review -> {
                        Map<String, Object> reviewMap = new HashMap<>();
                        reviewMap.put("reviewId", review.getReviewId());
                        reviewMap.put("postId", review.getPostId());
                        reviewMap.put("productId", review.getProductId());
                        reviewMap.put("userId", review.getUserId());
                        reviewMap.put("orderItemId", review.getOrderItemId());
                        reviewMap.put("rating", review.getRating());
                        reviewMap.put("content", review.getContent());
                        reviewMap.put("sellerReply", review.getSellerReply());
                        reviewMap.put("sellerReplyAt", review.getSellerReplyAt());
                        reviewMap.put("createdAt", review.getCreatedAt());
                        reviewMap.put("updatedAt", review.getUpdatedAt());
                        
                        // 상품 정보 추가
                        if (review.getProductPost() != null) {
                            reviewMap.put("productName", review.getProductPost().getPostName());
                            reviewMap.put("brand", review.getProductPost().getBrand());
                            reviewMap.put("productImage", resolveMainImageUrl(review.getPostId()));
                        }
                        
                        // 주문 정보 추가 (OrderItem에서)
                        if (review.getOrderItem() != null && review.getOrderItem().getOrder() != null) {
                            reviewMap.put("orderNumber", review.getOrderItem().getOrder().getOrderNumber());
                        }
                        
                        // 사용자 정보 추가
                        if (review.getUser() != null) {
                            Map<String, Object> userMap = new HashMap<>();
                            userMap.put("userId", review.getUser().getUserId());
                            userMap.put("name", review.getUser().getName());
                            reviewMap.put("user", userMap);
                        }
                        
                        // 리뷰 이미지 추가
                        List<ReviewImage> reviewImages = reviewImageDAO.findByReviewId(review.getReviewId());
                        List<Map<String, Object>> imageList = reviewImages.stream()
                                .map(img -> {
                                    Map<String, Object> imageMap = new HashMap<>();
                                    imageMap.put("imageId", img.getReviewImageId());
                                    imageMap.put("imageUrl", img.getImageUrl());
                                    return imageMap;
                                })
                                .collect(java.util.stream.Collectors.toList());
                        reviewMap.put("images", imageList);
                        
                        return reviewMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            map.put("rt", "OK");
            map.put("items", items);
            
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "리뷰 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 리뷰 ID로 조회
    @GetMapping("/reviews/{reviewId}")
    public Map<String, Object> getReviewById(@PathVariable("reviewId") int reviewId) {
        Map<String, Object> map = new HashMap<>();
        
        try {
            Review review = reviewService.getReviewById(reviewId);
            
            Map<String, Object> item = new HashMap<>();
            item.put("reviewId", review.getReviewId());
            item.put("postId", review.getPostId());
            item.put("productId", review.getProductId());
            item.put("userId", review.getUserId());
            item.put("orderItemId", review.getOrderItemId());
            item.put("rating", review.getRating());
            item.put("content", review.getContent());
            item.put("sellerReply", review.getSellerReply());
            item.put("sellerReplyAt", review.getSellerReplyAt());
            item.put("createdAt", review.getCreatedAt());
            item.put("updatedAt", review.getUpdatedAt());
            
            // 상품 정보 추가
            if (review.getProductPost() != null) {
                item.put("productName", review.getProductPost().getPostName());
                item.put("brand", review.getProductPost().getBrand());
                item.put("productImage", resolveMainImageUrl(review.getPostId()));
            }
            
            // 주문 정보 추가
            if (review.getOrderItem() != null && review.getOrderItem().getOrder() != null) {
                item.put("orderNumber", review.getOrderItem().getOrder().getOrderNumber());
            }
            
            // 리뷰 이미지 추가
            List<ReviewImage> reviewImages = reviewImageDAO.findByReviewId(review.getReviewId());
            List<Map<String, Object>> imageList = reviewImages.stream()
                    .map(img -> {
                        Map<String, Object> imageMap = new HashMap<>();
                        imageMap.put("imageId", img.getReviewImageId());
                        imageMap.put("imageUrl", img.getImageUrl());
                        return imageMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
            item.put("images", imageList);
            
            map.put("rt", "OK");
            map.put("item", item);
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "리뷰 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 리뷰 수정
    @PutMapping("/reviews/{reviewId}")
    public Map<String, Object> updateReview(
            @PathVariable("reviewId") int reviewId,
            @RequestParam("userId") int userId,
            @RequestParam("rating") int rating,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "keepImageIds", required = false) List<Integer> keepImageIds) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            Review review = reviewService.updateReview(reviewId, userId, rating, content, images, keepImageIds);
            
            Map<String, Object> item = new HashMap<>();
            item.put("reviewId", review.getReviewId());
            item.put("postId", review.getPostId());
            item.put("productId", review.getProductId());
            item.put("userId", review.getUserId());
            item.put("orderItemId", review.getOrderItemId());
            item.put("rating", review.getRating());
            item.put("content", review.getContent());
            item.put("sellerReply", review.getSellerReply());
            item.put("sellerReplyAt", review.getSellerReplyAt());
            item.put("createdAt", review.getCreatedAt());
            item.put("updatedAt", review.getUpdatedAt());
            
            map.put("rt", "OK");
            map.put("item", item);
            map.put("message", "리뷰가 성공적으로 수정되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "리뷰 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 리뷰 삭제
    @DeleteMapping("/reviews/{reviewId}")
    public Map<String, Object> deleteReview(
            @PathVariable("reviewId") int reviewId,
            @RequestParam("userId") int userId) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            reviewService.deleteReview(reviewId, userId);
            
            map.put("rt", "OK");
            map.put("message", "리뷰가 성공적으로 삭제되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "리뷰 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 판매자 답글 작성/수정
    @PostMapping("/reviews/{reviewId}/reply")
    public Map<String, Object> addSellerReply(
            @PathVariable("reviewId") int reviewId,
            @RequestParam("sellerId") int sellerId,
            @RequestParam("reply") String reply) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            Review review = reviewService.addSellerReply(reviewId, sellerId, reply);
            
            Map<String, Object> item = new HashMap<>();
            item.put("reviewId", review.getReviewId());
            item.put("sellerReply", review.getSellerReply());
            item.put("sellerReplyAt", review.getSellerReplyAt());
            
            map.put("rt", "OK");
            map.put("item", item);
            map.put("message", "답글이 성공적으로 작성되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "답글 작성 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 판매자 답글 삭제
    @DeleteMapping("/reviews/{reviewId}/reply")
    public Map<String, Object> deleteSellerReply(
            @PathVariable("reviewId") int reviewId,
            @RequestParam("sellerId") int sellerId) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            Review review = reviewService.deleteSellerReply(reviewId, sellerId);
            
            map.put("rt", "OK");
            map.put("message", "답글이 성공적으로 삭제되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "답글 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 상품 이미지 URL 조회 (대표 이미지)
    private String resolveMainImageUrl(int postId) {
        List<ProductImage> images = productImageDAO.findByPostId(postId);
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(images.get(0).getImageUrl());
    }
}

