package com.example.backend.service;

import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dao.WishlistDAO;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.User;
import com.example.backend.entity.Wishlist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistDAO wishlistDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private ProductDAO productDAO;
    
    @Autowired
    private ProductImageDAO productImageDAO;

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
    
    // 사용자 찜목록 조회 (인기순 조회와 동일한 형식으로 반환)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserWishlist(int userId) {
        // 사용자가 찜한 게시물 목록 조회 (최신순)
        List<Wishlist> wishlists = wishlistDAO.findByUserIdOrderByCreatedAtDesc(userId);
        
        return wishlists.stream().map(wishlist -> {
            ProductPost post = productPostDAO.findById(wishlist.getPostId());
            if (post == null) {
                return null;
            }
            
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            item.put("categoryName", post.getCategoryName());
            item.put("status", post.getStatus());
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = productImageDAO.findByPostId(post.getPostId()).stream()
                    .filter(img -> img.getImageType() == null || "GALLERY".equalsIgnoreCase(img.getImageType()))
                    .collect(Collectors.toList());
            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                        .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                        .findFirst()
                        .orElse(images.get(0));
                mainImageUrl = mainImage.getImageUrl();
            }
            item.put("imageUrl", mainImageUrl);
            
            // 최소 가격 조회 (할인가 우선, 없으면 원가)
            Integer minPrice = null;
            Integer minDiscountPrice = null;
            List<Product> products = productDAO.findByPostId(post.getPostId());
            if (products != null && !products.isEmpty()) {
                Product minPriceProduct = products.stream()
                        .min((p1, p2) -> {
                            Integer price1 = (p1.getDiscountPrice() != null) ? p1.getDiscountPrice() : p1.getPrice();
                            Integer price2 = (p2.getDiscountPrice() != null) ? p2.getDiscountPrice() : p2.getPrice();
                            return price1.compareTo(price2);
                        })
                        .orElse(null);
                
                if (minPriceProduct != null) {
                    minPrice = minPriceProduct.getPrice();
                    minDiscountPrice = minPriceProduct.getDiscountPrice();
                }
            }
            item.put("price", minPrice);
            item.put("discountPrice", minDiscountPrice);
            
            return item;
        }).filter(item -> item != null).collect(Collectors.toList());
    }
}

