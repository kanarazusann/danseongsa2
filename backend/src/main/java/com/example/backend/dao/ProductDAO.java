package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.Product;
import com.example.backend.repository.ProductRepository;
import java.util.List;

@Repository
public class ProductDAO {
    
    @Autowired
    private ProductRepository productRepository;
    
    public Product save(Product product) {
        return productRepository.save(product);
    }
    
    public List<Product> saveAll(List<Product> products) {
        return productRepository.saveAll(products);
    }
    
    public Product findById(int productId) {
        return productRepository.findById(productId).orElse(null);
    }
    
    public List<Product> findByPostId(int postId) {
        return productRepository.findByPostId(postId);
    }
    
    public void delete(Product product) {
        productRepository.delete(product);
    }
    
    public void deleteById(int productId) {
        productRepository.deleteById(productId);
    }
}

