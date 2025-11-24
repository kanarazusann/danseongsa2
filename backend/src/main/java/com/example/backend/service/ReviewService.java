package com.example.backend.service;

import com.example.backend.dao.ReviewDAO;
import com.example.backend.dao.ReviewImageDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.entity.Review;
import com.example.backend.entity.ReviewImage;
import com.example.backend.entity.User;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.Product;
import com.example.backend.entity.OrderItem;
import com.example.backend.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewDAO reviewDAO;
    
    @Autowired
    private ReviewImageDAO reviewImageDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private ProductDAO productDAO;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ImageService imageService;
    
    // 리뷰 작성
    @Transactional
    public Review createReview(int userId, int postId, Integer productId, int orderItemId, int rating, String content, List<MultipartFile> imageFiles) throws IOException {
        // 사용자 조회
        User user = getUserById(userId);
        
        // 게시물 조회
        ProductPost productPost = getProductPostById(postId);
        
        // 주문상세 조회
        OrderItem orderItem = getOrderItemById(orderItemId);
        
        // 이미 리뷰가 작성되었는지 확인
        Review existingReview = reviewDAO.findByOrderItemId(orderItemId);
        if (existingReview != null) {
            throw new IllegalArgumentException("이미 리뷰가 작성된 주문입니다.");
        }
        
        // 주문한 사용자와 리뷰 작성자가 일치하는지 확인
        if (orderItem.getOrder().getUserId() != userId) {
            throw new IllegalArgumentException("본인의 주문에만 리뷰를 작성할 수 있습니다.");
        }
        
        // 리뷰 엔티티 생성
        Review review = createReviewEntity(user, productPost, productId, orderItem, rating, content);
        Review savedReview = reviewDAO.save(review);
        
        // 리뷰 이미지 저장
        if (imageFiles != null && !imageFiles.isEmpty()) {
            saveReviewImages(savedReview, imageFiles);
        }
        
        return savedReview;
    }
    
    // 사용자 조회
    private User getUserById(int userId) {
        return userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
    
    // 게시물 조회
    private ProductPost getProductPostById(int postId) {
        ProductPost productPost = productPostDAO.findById(postId);
        if (productPost == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }
        return productPost;
    }
    
    // 주문상세 조회
    private OrderItem getOrderItemById(int orderItemId) {
        Optional<OrderItem> orderItemOpt = orderItemRepository.findById(orderItemId);
        if (orderItemOpt.isEmpty()) {
            throw new IllegalArgumentException("주문상세를 찾을 수 없습니다.");
        }
        return orderItemOpt.get();
    }
    
    // 리뷰 엔티티 생성
    private Review createReviewEntity(User user, ProductPost productPost, Integer productId, OrderItem orderItem, int rating, String content) {
        Review review = new Review();
        review.setUser(user);
        review.setProductPost(productPost);
        review.setOrderItem(orderItem);
        review.setRating(rating);
        review.setContent(content);
        
        // productId가 있으면 Product 엔티티 설정
        if (productId != null) {
            Product product = productDAO.findById(productId);
            if (product != null) {
                review.setProduct(product);
            }
        }
        
        return review;
    }
    
    // 리뷰 이미지 저장
    private void saveReviewImages(Review review, List<MultipartFile> imageFiles) throws IOException {
        if (imageFiles == null || imageFiles.isEmpty()) {
            return;
        }
        
        List<ReviewImage> reviewImages = new ArrayList<>();
        for (MultipartFile file : imageFiles) {
            if (!file.isEmpty()) {
                ReviewImage reviewImage = createReviewImage(review, file);
                reviewImages.add(reviewImage);
            }
        }
        
        if (!reviewImages.isEmpty()) {
            reviewImageDAO.saveAll(reviewImages);
        }
    }
    
    // ReviewImage 엔티티 생성
    private ReviewImage createReviewImage(Review review, MultipartFile file) throws IOException {
        String imageUrl = imageService.saveReviewImageFile(file);
        
        ReviewImage reviewImage = new ReviewImage();
        reviewImage.setReview(review);
        reviewImage.setImageUrl(imageUrl);
        
        return reviewImage;
    }
    
    // 게시물 ID로 리뷰 목록 조회
    public List<Review> getReviewsByPostId(int postId) {
        return reviewDAO.findByPostId(postId);
    }
    
    // 사용자 ID로 리뷰 목록 조회
    public List<Review> getReviewsByUserId(int userId) {
        return reviewDAO.findByUserId(userId);
    }
    
    // 판매자 ID로 리뷰 목록 조회 (판매자의 상품에 대한 리뷰)
    public List<Review> getReviewsBySellerId(int sellerId) {
        // 판매자의 상품 게시물 목록 조회
        List<ProductPost> productPosts = productPostDAO.findBySellerId(sellerId);
        
        // 각 게시물의 리뷰를 조회하여 합치기
        List<Review> allReviews = new ArrayList<>();
        for (ProductPost post : productPosts) {
            List<Review> postReviews = reviewDAO.findByPostId(post.getPostId());
            allReviews.addAll(postReviews);
        }
        
        return allReviews;
    }
    
    // 리뷰 ID로 조회
    public Review getReviewById(int reviewId) {
        return reviewDAO.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
    }
    
    // 리뷰 ID로 조회 (ProductPost와 함께 로드 - 답글 작성 시 사용)
    public Review getReviewByIdWithProductPost(int reviewId) {
        return reviewDAO.findByIdWithProductPost(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
    }
    
    // 리뷰 수정
    @Transactional
    public Review updateReview(int reviewId, int userId, int rating, String content, List<MultipartFile> imageFiles, List<Integer> keepImageIds) throws IOException {
        Review review = getReviewById(reviewId);
        
        // 본인의 리뷰인지 확인
        if (review.getUserId() != userId) {
            throw new IllegalArgumentException("본인의 리뷰만 수정할 수 있습니다.");
        }
        
        // 리뷰 내용 수정
        review.setRating(rating);
        review.setContent(content);
        
        // 이미지 처리
        List<ReviewImage> existingImages = reviewImageDAO.findByReviewId(reviewId);
        
        // 유지할 이미지 ID 목록이 있으면 해당하지 않는 이미지 삭제
        if (keepImageIds != null && !keepImageIds.isEmpty()) {
            for (ReviewImage image : existingImages) {
                if (!keepImageIds.contains(image.getReviewImageId())) {
                    reviewImageDAO.deleteById(image.getReviewImageId());
                }
            }
        } else if (imageFiles != null && !imageFiles.isEmpty()) {
            // 새 이미지가 있고 유지할 이미지 목록이 없으면 기존 이미지 모두 삭제
            for (ReviewImage image : existingImages) {
                reviewImageDAO.deleteById(image.getReviewImageId());
            }
        }
        
        // 새 이미지 저장
        if (imageFiles != null && !imageFiles.isEmpty()) {
            saveReviewImages(review, imageFiles);
        }
        
        return reviewDAO.save(review);
    }
    
    // 리뷰 삭제
    @Transactional
    public void deleteReview(int reviewId, int userId) {
        Review review = getReviewById(reviewId);
        
        // 본인의 리뷰인지 확인
        if (review.getUserId() != userId) {
            throw new IllegalArgumentException("본인의 리뷰만 삭제할 수 있습니다.");
        }
        
        // 리뷰 이미지 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
        List<ReviewImage> images = reviewImageDAO.findByReviewId(reviewId);
        for (ReviewImage image : images) {
            reviewImageDAO.deleteById(image.getReviewImageId());
        }
        
        // 리뷰 삭제
        reviewDAO.deleteById(reviewId);
    }
    
    // 판매자 답글 작성/수정
    @Transactional
    public Review addSellerReply(int reviewId, int sellerId, String reply) {
        Review review = getReviewByIdWithProductPost(reviewId);
        
        // 해당 리뷰의 상품 게시물 판매자인지 확인
        if (review.getProductPost() == null || review.getProductPost().getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 상품의 판매자만 답글을 작성할 수 있습니다.");
        }
        
        // 답글 내용 설정
        review.setSellerReply(reply);
        review.setSellerReplyAt(new java.sql.Timestamp(System.currentTimeMillis()));
        
        return reviewDAO.save(review);
    }
    
    // 판매자 답글 삭제
    @Transactional
    public Review deleteSellerReply(int reviewId, int sellerId) {
        Review review = getReviewByIdWithProductPost(reviewId);
        
        // 해당 리뷰의 상품 게시물 판매자인지 확인
        if (review.getProductPost() == null || review.getProductPost().getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 상품의 판매자만 답글을 삭제할 수 있습니다.");
        }
        
        // 답글 삭제
        review.setSellerReply(null);
        review.setSellerReplyAt(null);
        
        return reviewDAO.save(review);
    }
}

