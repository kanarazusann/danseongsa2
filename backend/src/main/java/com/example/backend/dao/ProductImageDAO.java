package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.ProductImage;
import com.example.backend.repository.ProductImageRepository;
import java.util.List;

@Repository
public class ProductImageDAO {
    
    @Autowired
    private ProductImageRepository productImageRepository;
    
    public ProductImage save(ProductImage productImage) {
        return productImageRepository.save(productImage);
    }
    
    public List<ProductImage> saveAll(List<ProductImage> productImages) {
        return productImageRepository.saveAll(productImages);
    }
    
    public List<ProductImage> findByPostId(int postId) {
        return productImageRepository.findByPostId(postId);
    }
    
    public void deleteById(int imageId) {
        productImageRepository.deleteById(imageId);
    }
    
    public void deleteAll(List<ProductImage> productImages) {
        productImageRepository.deleteAll(productImages);
    }
}

