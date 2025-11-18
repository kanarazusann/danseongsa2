package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductPostDTO {
    // 게시물 정보
    private String postName;
    private String description;
    private String categoryName;
    private String brand;
    private String material;
    private String gender;
    private String season;
    private String status;
    
    // 상품 옵션 리스트
    private List<ProductDTO> products;
}

