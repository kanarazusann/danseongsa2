package com.example.backend.service;

import com.example.backend.dao.ProductDAO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    
    // STATUS 변환 상수
    private static final int STATUS_SELLING = 1;
    private static final int STATUS_SOLD_OUT = 0;
    
    @Autowired
    private ProductDAO productDAO;
    
    // 상품 목록 생성
    public List<Product> createProducts(ProductPost productPost, List<ProductDTO> productDTOs) {
        if (productDTOs == null || productDTOs.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Product> products = new ArrayList<>();
        for (ProductDTO productDto : productDTOs) {
            Product product = createProduct(productPost, productDto);
            products.add(product);
        }
        
        return productDAO.saveAll(products);
    }
    
    // Product 엔티티 생성
    private Product createProduct(ProductPost productPost, ProductDTO productDto) {
        Product product = new Product();
        product.setProductPost(productPost);
        product.setColor(productDto.getColor());
        product.setProductSize(productDto.getProductSize());
        product.setPrice(productDto.getPrice());
        product.setDiscountPrice(productDto.getDiscountPrice());
        product.setStock(productDto.getStock() != null ? productDto.getStock() : 0);
        // STATUS 변환: String → Integer (DB 저장용)
        product.setStatus(convertStatusToDb(productDto.getStatus() != null ? productDto.getStatus() : "SELLING"));
        return product;
    }
    
    // STATUS 변환: String → Integer (DB 저장용)
    private Integer convertStatusToDb(String status) {
        if (status == null) return STATUS_SELLING;
        String upper = status.trim().toUpperCase();
        if ("SELLING".equals(upper) || "1".equals(status)) {
            return STATUS_SELLING;
        } else if ("SOLD_OUT".equals(upper) || "SOLDOUT".equals(upper) || "0".equals(status)) {
            return STATUS_SOLD_OUT;
        }
        return STATUS_SELLING; // 기본값
    }
    
    // STATUS 변환: Integer → String (API 응답용)
    public String convertStatusFromDb(Integer status) {
        if (status == null) return "SELLING";
        return status == STATUS_SELLING ? "SELLING" : "SOLD_OUT";
    }
}

