package com.example.backend.service;

import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SellerService {

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ProductPostDAO productPostDAO;

    @Autowired
    private ProductImageDAO productImageDAO;

    @Autowired
    private ProductDAO productDAO;

    // 판매자 정보 및 상품 목록 조회
    public Map<String, Object> getSellerInfo(int sellerId) {
        User seller = userDAO.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자를 찾을 수 없습니다."));

        Map<String, Object> sellerInfo = new HashMap<>();
        sellerInfo.put("userId", seller.getUserId());
        sellerInfo.put("brand", seller.getBrand());
        sellerInfo.put("businessNumber", seller.getBusinessNumber());
        sellerInfo.put("phone", seller.getPhone());
        
        // 가입일 포맷팅
        if (seller.getCreatedAt() != null) {
            LocalDateTime dateTime = seller.getCreatedAt().toLocalDateTime();
            sellerInfo.put("createdAt", dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } else {
            sellerInfo.put("createdAt", null);
        }

        // 판매 상품 목록 조회
        List<ProductPost> posts = productPostDAO.findBySellerId(sellerId);
        List<Map<String, Object>> products = posts.stream()
                .map(post -> buildProductResponse(post))
                .collect(Collectors.toList());

        sellerInfo.put("products", products);
        sellerInfo.put("totalProducts", products.size());

        return sellerInfo;
    }

        // 상품 응답 생성
    private Map<String, Object> buildProductResponse(ProductPost post) {
        Map<String, Object> product = new HashMap<>();
        product.put("id", post.getPostId()); // 프론트엔드 ProductCard에서 id 사용
        product.put("postId", post.getPostId());
        product.put("name", post.getPostName()); // 프론트엔드 ProductCard에서 name 사용
        product.put("postName", post.getPostName());
        product.put("brand", post.getBrand());
        String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
        product.put("categoryId", post.getCategoryId());
        product.put("categoryName", categoryName);
        
        // 최소 가격 계산 (ProductDAO를 통해 조회)
        List<Product> products = productDAO.findByPostId(post.getPostId());
        Integer minPrice = null;
        Integer minDiscountPrice = null;
        if (products != null && !products.isEmpty()) {
            for (Product productItem : products) {
                Integer price = productItem.getPrice();
                Integer discountPrice = productItem.getDiscountPrice();
                Integer effectivePrice = discountPrice != null ? discountPrice : price;
                
                if (effectivePrice != null) {
                    Integer currentMin = minDiscountPrice != null ? minDiscountPrice : minPrice;
                    if (minPrice == null || effectivePrice < (currentMin != null ? currentMin : Integer.MAX_VALUE)) {
                        minPrice = price;
                        minDiscountPrice = discountPrice;
                    }
                }
            }
        }
        
        product.put("price", minPrice);
        product.put("discountPrice", minDiscountPrice);
        
        // 찜 수(wishCount) 추가
        product.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);

        // 대표 이미지 가져오기 (갤러리 이미지 중 첫 번째)
        var galleryImages = productImageDAO.findByPostId(post.getPostId()).stream()
                .filter(img -> "GALLERY".equals(img.getImageType()))
                .findFirst();
        
        if (galleryImages.isPresent()) {
            product.put("image", galleryImages.get().getImageUrl()); // 프론트엔드 ProductCard에서 image 사용
            product.put("imageUrl", galleryImages.get().getImageUrl());
        } else {
            product.put("image", null);
            product.put("imageUrl", null);
        }

        return product;
    }
}

