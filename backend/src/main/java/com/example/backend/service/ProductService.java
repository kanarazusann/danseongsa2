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
        product.setStatus(productDto.getStatus() != null ? productDto.getStatus() : "SELLING");
        return product;
    }
}

