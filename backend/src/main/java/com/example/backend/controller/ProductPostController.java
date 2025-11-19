package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.service.ProductPostService;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.dto.ProductDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.backend.entity.ProductPost;
import java.util.*;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProductPostController {
    
    @Autowired
    private ProductPostService productPostService;
    
    // 게시물 등록 API
    @PostMapping("/productposts")
    public Map<String, Object> createProductPost(
            @RequestParam("postName") String postName,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("categoryName") String categoryName,
            @RequestParam(value = "brand", required = false, defaultValue = "") String brand,
            @RequestParam(value = "material", required = false, defaultValue = "") String material,
            @RequestParam("gender") String gender,
            @RequestParam("season") String season,
            @RequestParam("status") String status,
            @RequestParam("products") String productsJson,  // JSON 문자열
            @RequestParam("sellerId") int sellerId,  // 실제 로그인한 판매자 ID
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "descriptionImages", required = false) List<MultipartFile> descriptionImages) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            // DTO 생성
            ProductPostDTO dto = new ProductPostDTO();
            dto.setPostName(postName);
            dto.setDescription(description != null ? description : "");
            dto.setCategoryName(categoryName);
            dto.setBrand(brand != null ? brand : "");
            dto.setMaterial(material != null ? material : "");
            dto.setGender(gender);
            dto.setSeason(season);
            dto.setStatus(status);
            
            // products JSON 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            List<ProductDTO> products = objectMapper.readValue(
                productsJson, 
                new TypeReference<List<ProductDTO>>() {}
            );
            dto.setProducts(products);
            
            // 실제 로그인한 판매자 ID 사용
            ProductPost savedPost = productPostService.createProductPost(dto, sellerId, images, descriptionImages);
            
            // 순환 참조 방지를 위해 필요한 필드만 Map으로 구성
            Map<String, Object> item = new HashMap<>();
            item.put("postId", savedPost.getPostId());
            item.put("postName", savedPost.getPostName());
            item.put("categoryName", savedPost.getCategoryName());
            item.put("brand", savedPost.getBrand());
            item.put("description", savedPost.getDescription());
            item.put("material", savedPost.getMaterial());
            item.put("gender", savedPost.getGender());
            item.put("season", savedPost.getSeason());
            item.put("status", savedPost.getStatus());
            item.put("viewCount", savedPost.getViewCount());
            item.put("sellerId", savedPost.getSellerId());
            item.put("createdAt", savedPost.getCreatedAt());
            item.put("updatedAt", savedPost.getUpdatedAt());
            
            map.put("rt", "OK");
            map.put("item", item);
            map.put("message", "게시물이 성공적으로 등록되었습니다.");
            
        } catch (IllegalArgumentException e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "게시물 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 모든 게시물 목록 조회 API (필터링 지원)
    @GetMapping("/productposts")
    public Map<String, Object> getAllProductPosts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "color", required = false) List<String> colors,
            @RequestParam(value = "size", required = false) List<String> sizes,
            @RequestParam(value = "season", required = false) List<String> seasons,
            @RequestParam(value = "sort", required = false, defaultValue = "newest") String sort) {
        Map<String, Object> map = new HashMap<>();
        
        try {
            List<Map<String, Object>> productPosts = productPostService.findWithFilters(
                category, gender, search, colors, sizes, seasons);
            
            // 정렬 적용
            switch (sort) {
                case "popular":
                    productPosts.sort((a, b) -> {
                        Integer wishCountA = (Integer) a.getOrDefault("wishCount", 0);
                        Integer wishCountB = (Integer) b.getOrDefault("wishCount", 0);
                        return wishCountB.compareTo(wishCountA);
                    });
                    break;
                case "newest":
                    productPosts.sort((a, b) -> {
                        String dateAStr = (String) a.get("createdAt");
                        String dateBStr = (String) b.get("createdAt");
                        if (dateAStr == null && dateBStr == null) return 0;
                        if (dateAStr == null) return 1;
                        if (dateBStr == null) return -1;
                        return dateBStr.compareTo(dateAStr);
                    });
                    break;
                case "price-low":
                    productPosts.sort((a, b) -> {
                        Integer priceA = getDisplayPrice(a);
                        Integer priceB = getDisplayPrice(b);
                        if (priceA == null && priceB == null) return 0;
                        if (priceA == null) return 1;
                        if (priceB == null) return -1;
                        return priceA.compareTo(priceB);
                    });
                    break;
                case "price-high":
                    productPosts.sort((a, b) -> {
                        Integer priceA = getDisplayPrice(a);
                        Integer priceB = getDisplayPrice(b);
                        if (priceA == null && priceB == null) return 0;
                        if (priceA == null) return 1;
                        if (priceB == null) return -1;
                        return priceB.compareTo(priceA);
                    });
                    break;
            }
            
            map.put("rt", "OK");
            map.put("items", productPosts);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "상품 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 표시 가격 계산 (할인가 우선, 없으면 원가)
    private Integer getDisplayPrice(Map<String, Object> item) {
        Integer discountPrice = (Integer) item.get("discountPrice");
        Integer price = (Integer) item.get("price");
        return discountPrice != null ? discountPrice : price;
    }
    
    // 인기순 게시물 목록 조회 API (찜수 기준)
    @GetMapping("/productposts/popular")
    public Map<String, Object> getPopularProductPosts() {
        Map<String, Object> map = new HashMap<>();
        
        try {
            List<Map<String, Object>> productPosts = productPostService.findAllOrderByPopularity();
            
            map.put("rt", "OK");
            map.put("items", productPosts);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "인기 상품 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 최신순 게시물 목록 조회 API (생성일 기준)
    @GetMapping("/productposts/newest")
    public Map<String, Object> getNewestProductPosts() {
        Map<String, Object> map = new HashMap<>();
        
        try {
            List<Map<String, Object>> productPosts = productPostService.findAllOrderByCreatedAtDesc();
            
            map.put("rt", "OK");
            map.put("items", productPosts);
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "최신 상품 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 게시물 ID로 게시물 조회 API
    @GetMapping("/productposts/detail")
    public Map<String, Object> getProductPost(
            @RequestParam("postId") int postId,
            @RequestParam(value = "userId", required = false) Integer userId) {
        Map<String, Object> map = new HashMap<>();
        
        try {
            Map<String, Object> detail = productPostService.getProductDetail(postId, userId);
            map.put("rt", "OK");
            map.put("item", detail);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "게시물 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
}

