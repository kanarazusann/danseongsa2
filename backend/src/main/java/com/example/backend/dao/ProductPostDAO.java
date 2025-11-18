package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.ProductPost;
import com.example.backend.repository.ProductPostRepository;
import java.util.List;

@Repository
public class ProductPostDAO {
    
    @Autowired
    private ProductPostRepository productPostRepository;
    
    public ProductPost save(ProductPost productPost) {
        return productPostRepository.save(productPost);
    }
    
    public ProductPost findById(int postId) {
        return productPostRepository.findById(postId).orElse(null);
    }
    
    public List<ProductPost> findBySellerId(int sellerId) {
        return productPostRepository.findBySellerId(sellerId);
    }
    
    public List<ProductPost> findAll() {
        return productPostRepository.findAll();
    }
}

