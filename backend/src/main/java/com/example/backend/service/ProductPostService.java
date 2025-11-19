package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.User;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class ProductPostService {
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductImageService productImageService;
    
    @Autowired
    private ProductImageDAO productImageDAO;
    
    @Autowired
    private ProductDAO productDAO;
    
    // 게시물 생성
    @Transactional
    public ProductPost createProductPost(ProductPostDTO dto, int sellerId, List<MultipartFile> imageFiles) throws IOException {
        User seller = getUserById(sellerId);
        System.out.println("판매자 정보 - userId: " + seller.getUserId() + ", brand: " + seller.getBrand());
        ProductPost productPost = createProductPostEntity(dto, seller);
        System.out.println("ProductPost brand 설정: " + productPost.getBrand());
        ProductPost savedPost = productPostDAO.save(productPost);
        
        productService.createProducts(savedPost, dto.getProducts());
        productImageService.saveProductImages(savedPost, imageFiles);
        
        return savedPost;
    }
    
    // 판매자 정보 조회
    private User getUserById(int sellerId) {
        return userDAO.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자를 찾을 수 없습니다. sellerId: " + sellerId));
    }
    
    // ProductPost 엔티티 생성
    private ProductPost createProductPostEntity(ProductPostDTO dto, User seller) {
        ProductPost productPost = new ProductPost();
        productPost.setSeller(seller);
        productPost.setCategoryName(dto.getCategoryName());
        productPost.setPostName(dto.getPostName());
        productPost.setDescription(dto.getDescription());
        // 판매자의 brand 정보 사용
        String brand = seller.getBrand() != null && !seller.getBrand().trim().isEmpty() 
                ? seller.getBrand() 
                : "";
        System.out.println("판매자 brand 값: " + brand);
        productPost.setBrand(brand);
        productPost.setMaterial(dto.getMaterial());
        productPost.setGender(dto.getGender());
        productPost.setSeason(dto.getSeason());
        productPost.setStatus(dto.getStatus());
        productPost.setViewCount(0);
        return productPost;
    }
    
    // 게시물 ID로 게시물 조회
    public ProductPost findById(int postId) {
        return productPostDAO.findById(postId);
    }
    
    // 모든 게시물 목록 조회
    public List<ProductPost> findAll() {
        return productPostDAO.findAll();
    }
    
    // 판매자 ID로 게시물 목록 조회
    public List<ProductPost> findBySellerId(int sellerId) {
        return productPostDAO.findBySellerId(sellerId);
    }
    
    // 인기순 조회 (찜수 기준, 이미지 및 최소 가격 포함) - WISHCOUNT 컬럼 사용
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAllOrderByPopularity() {
        List<ProductPost> productPosts = productPostDAO.findAllOrderByPopularity();
        
        // 디버깅: 찜수 확인
        System.out.println("=== 인기순 조회 결과 (총 " + productPosts.size() + "개) ===");
        for (ProductPost post : productPosts) {
            System.out.println("POSTID: " + post.getPostId() + ", POSTNAME: " + post.getPostName() + ", WISHCOUNT: " + post.getWishCount());
        }
        
        return productPosts.stream().map(post -> {
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            item.put("categoryName", post.getCategoryName());
            item.put("status", post.getStatus());
            item.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = productImageDAO.findByPostId(post.getPostId());
            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                    .findFirst()
                    .orElse(images.get(0));
                mainImageUrl = mainImage.getImageUrl();
                System.out.println("POSTID " + post.getPostId() + " 이미지 URL: " + mainImageUrl);
            } else {
                System.out.println("POSTID " + post.getPostId() + " 이미지 없음");
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
        }).collect(Collectors.toList());
    }
    
    // 최신순 조회 (생성일 기준, 이미지 및 최소 가격 포함)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAllOrderByCreatedAtDesc() {
        List<ProductPost> productPosts = productPostDAO.findAllOrderByCreatedAtDesc();
        
        return productPosts.stream().map(post -> {
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            item.put("categoryName", post.getCategoryName());
            item.put("status", post.getStatus());
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = productImageDAO.findByPostId(post.getPostId());
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
        }).collect(Collectors.toList());
    }
    
    // 필터링된 게시물 목록 조회 (카테고리, 성별, 검색어, 컬러, 사이즈, 계절 필터링 지원)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findWithFilters(String category, String gender, String search, 
                                                      List<String> colors, List<String> sizes, List<String> seasons) {
        // 모든 게시물 조회 (SELLING 상태만)
        List<ProductPost> allPosts = productPostDAO.findByStatus("SELLING");
        
        return allPosts.stream()
            .filter(post -> {
                // 카테고리 필터링
                if (category != null && !category.isEmpty()) {
                    if (post.getCategoryName() == null || !post.getCategoryName().startsWith(category)) {
                        return false;
                    }
                }
                
                // 성별 필터링
                if (gender != null && !gender.isEmpty() && !gender.equals("전체")) {
                    if (post.getGender() == null || (!post.getGender().equals(gender) && !post.getGender().equals("UNISEX"))) {
                        return false;
                    }
                }
                
                // 검색어 필터링 (게시물명)
                if (search != null && !search.isEmpty()) {
                    if (post.getPostName() == null || !post.getPostName().toLowerCase().contains(search.toLowerCase())) {
                        return false;
                    }
                }
                
                // 계절 필터링
                if (seasons != null && !seasons.isEmpty()) {
                    if (post.getSeason() == null || !seasons.contains(post.getSeason())) {
                        return false;
                    }
                }
                
                return true;
            })
            .map(post -> {
                Map<String, Object> item = new HashMap<>();
                item.put("postId", post.getPostId());
                item.put("postName", post.getPostName());
                item.put("brand", post.getBrand());
                item.put("categoryName", post.getCategoryName());
                item.put("status", post.getStatus());
                item.put("gender", post.getGender());
                item.put("season", post.getSeason());
                item.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);
                // Timestamp를 String으로 변환하여 JSON 직렬화 문제 해결
                item.put("createdAt", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
                
                // 대표 이미지 조회
                String mainImageUrl = null;
                List<ProductImage> images = productImageDAO.findByPostId(post.getPostId());
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
                
                // 컬러/사이즈 필터링
                if (products != null && !products.isEmpty()) {
                    List<Product> filteredProducts = products;
                    
                    // 컬러 필터링
                    if (colors != null && !colors.isEmpty()) {
                        filteredProducts = filteredProducts.stream()
                            .filter(p -> p.getColor() != null && colors.contains(p.getColor().toLowerCase()))
                            .collect(Collectors.toList());
                    }
                    
                    // 사이즈 필터링
                    if (sizes != null && !sizes.isEmpty()) {
                        filteredProducts = filteredProducts.stream()
                            .filter(p -> p.getProductSize() != null && sizes.contains(p.getProductSize()))
                            .collect(Collectors.toList());
                    }
                    
                    // 필터링된 상품 중 최소 가격 찾기
                    if (!filteredProducts.isEmpty()) {
                        Product minPriceProduct = filteredProducts.stream()
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
                }
                
                item.put("price", minPrice);
                item.put("discountPrice", minDiscountPrice);
                
                return item;
            })
            .filter(item -> {
                // 컬러/사이즈 필터링 후 가격이 있는 상품만 반환
                return item.get("price") != null;
            })
            .collect(Collectors.toList());
    }
}

