package com.example.backend.service;

import com.example.backend.dao.ProductImageDAO;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ProductPost;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductImageService {
    
    @Autowired
    private ProductImageDAO productImageDAO;
    
    @Autowired
    private ImageService imageService;
    
    // 상품 이미지 목록 저장
    public List<ProductImage> saveProductImages(ProductPost productPost, List<MultipartFile> imageFiles) throws IOException {
        if (imageFiles == null || imageFiles.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<ProductImage> productImages = new ArrayList<>();
        for (int i = 0; i < imageFiles.size(); i++) {
            MultipartFile file = imageFiles.get(i);
            if (!file.isEmpty()) {
                ProductImage productImage = createProductImage(productPost, file, i);
                productImages.add(productImage);
            }
        }
        
        if (!productImages.isEmpty()) {
            return productImageDAO.saveAll(productImages);
        }
        
        return new ArrayList<>();
    }
    
    // ProductImage 엔티티 생성
    private ProductImage createProductImage(ProductPost productPost, MultipartFile file, int index) throws IOException {
        String fileName = imageService.saveImageFile(file);
        
        ProductImage productImage = new ProductImage();
        productImage.setProductPost(productPost);
        productImage.setImageUrl(fileName);
        productImage.setIsMain(index == 0 ? 1 : 0);
        return productImage;
    }
}

