package com.example.backend.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Integer productId;  // 수정 시 사용 (새로 추가되는 경우 null)
    private String color;
    private String productSize;
    private Integer price;
    private Integer discountPrice;
    private Integer stock;
    private String status;
}

