package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductPostDTO {
    // 게시물 정보
    private String postName;
    private String description;
    private String categoryName;  // 카테고리명 (예: "신발 스니커즈") - Category 테이블에서 조회하여 categoryId 설정
    private String brand;
    private String material;
    private String gender;
    private String season;
    private String status;
    
    // 상품 옵션 리스트
    private List<ProductDTO> products;
}

