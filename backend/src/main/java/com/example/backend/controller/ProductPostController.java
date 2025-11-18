package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.service.ProductPostService;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.entity.ProductPost;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProductPostController {
    
    @Autowired
    private ProductPostService productPostService;
    
    // 게시물 등록
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
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        
        Map<String, Object> map = new HashMap<>();
        
        try {
            // 입력값 검증
            if (postName == null || postName.trim().isEmpty()) {
                map.put("rt", "FAIL");
                map.put("message", "게시물명은 필수입니다.");
                return map;
            }
            if (categoryName == null || categoryName.trim().isEmpty()) {
                map.put("rt", "FAIL");
                map.put("message", "카테고리명은 필수입니다.");
                return map;
            }
            if (gender == null || gender.trim().isEmpty()) {
                map.put("rt", "FAIL");
                map.put("message", "성별은 필수입니다.");
                return map;
            }
            if (season == null || season.trim().isEmpty()) {
                map.put("rt", "FAIL");
                map.put("message", "계절은 필수입니다.");
                return map;
            }
            if (sellerId <= 0) {
                map.put("rt", "FAIL");
                map.put("message", "유효하지 않은 판매자 ID입니다.");
                return map;
            }
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
            ProductPost savedPost = productPostService.createProductPost(dto, sellerId, images);
            
            map.put("rt", "OK");
            map.put("item", savedPost);
            map.put("message", "게시물이 성공적으로 등록되었습니다.");
            
        } catch (Exception e) {
            e.printStackTrace();
            map.put("rt", "FAIL");
            map.put("message", "게시물 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 게시물 전체 조회 (필터링 옵션)
    @GetMapping("/productposts")
    public Map<String, Object> getAllProductPosts() {
        Map<String, Object> map = new HashMap<>();
        
        try {
            // DB에서 필터링 조건으로 조회 (메모리 필터링 X)
            List<ProductPost> productPosts = productPostService.findAll();
            
            map.put("rt", "OK");
            map.put("items", productPosts);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
    
    // 게시물 단일 조회
    @GetMapping("/productposts/detail")
    public Map<String, Object> getProductPost(@RequestParam("postId") int postId) {
        Map<String, Object> map = new HashMap<>();
        
        try {
            ProductPost productPost = productPostService.findById(postId);
            if (productPost != null) {
                map.put("rt", "OK");
                map.put("item", productPost);
            } else {
                map.put("rt", "FAIL");
                map.put("message", "게시물을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", "오류가 발생했습니다: " + e.getMessage());
        }
        
        return map;
    }
}

