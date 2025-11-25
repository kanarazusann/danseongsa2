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
    
    // 인기순 조회 (찜수 기준)
    public List<ProductPost> findAllOrderByPopularity() {
        return productPostRepository.findAllOrderByPopularity();
    }
    
    // 최신순 조회 (생성일 기준)
    public List<ProductPost> findAllOrderByCreatedAtDesc() {
        return productPostRepository.findAllOrderByCreatedAtDesc();
    }
    
    // 상태로 게시물 목록 조회 (Integer: 1=SELLING, 0=SOLD_OUT)
    public List<ProductPost> findByStatus(Integer status) {
        return productPostRepository.findByStatus(status);
    }
    
    // 브랜드로 게시물 목록 조회
    public List<ProductPost> findByBrand(String brand) {
        return productPostRepository.findByBrand(brand);
    }
    
    // 게시물 삭제
    public void delete(ProductPost productPost) {
        productPostRepository.delete(productPost);
    }
    
    // 게시물 ID로 삭제
    public void deleteById(int postId) {
        productPostRepository.deleteById(postId);
    }
}

