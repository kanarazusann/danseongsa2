package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.User;
import java.io.IOException;
import java.util.List;

@Service
public class ProductPostService {
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductImageService productImageService;
    
    // 게시물 생성
    @Transactional
    public ProductPost createProductPost(ProductPostDTO dto, int sellerId, List<MultipartFile> imageFiles) throws IOException {
        User seller = getUserById(sellerId);
        ProductPost productPost = createProductPostEntity(dto, seller);
        ProductPost savedPost = productPostDAO.save(productPost);
        
        productService.createProducts(savedPost, dto.getProducts());
        productImageService.saveProductImages(savedPost, imageFiles);
        
        return savedPost;
    }
    
    // 판매자 정보 조회
    private User getUserById(int sellerId) {
        return userDAO.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자를 찾을 수 없습니다. sellerId: " + sellerId));
    }
    
    // ProductPost 엔티티 생성
    private ProductPost createProductPostEntity(ProductPostDTO dto, User seller) {
        ProductPost productPost = new ProductPost();
        productPost.setSeller(seller);
        productPost.setCategoryName(dto.getCategoryName());
        productPost.setPostName(dto.getPostName());
        productPost.setDescription(dto.getDescription());
        productPost.setBrand(dto.getBrand());
        productPost.setMaterial(dto.getMaterial());
        productPost.setGender(dto.getGender());
        productPost.setSeason(dto.getSeason());
        productPost.setStatus(dto.getStatus());
        productPost.setViewCount(0);
        return productPost;
    }
    
    // 게시물 ID로 게시물 조회
    public ProductPost findById(int postId) {
        return productPostDAO.findById(postId);
    }
    
    // 모든 게시물 목록 조회
    public List<ProductPost> findAll() {
        return productPostDAO.findAll();
    }
    
    // 판매자 ID로 게시물 목록 조회
    public List<ProductPost> findBySellerId(int sellerId) {
        return productPostDAO.findBySellerId(sellerId);
    }
}

