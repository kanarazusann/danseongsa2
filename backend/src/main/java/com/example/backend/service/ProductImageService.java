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
    
    // 상품 이미지 목록 저장 (갤러리 이미지)
    public List<ProductImage> saveProductImages(ProductPost productPost, List<MultipartFile> imageFiles) throws IOException {
        return saveProductImages(productPost, imageFiles, "GALLERY");
    }
    
    // 상품 이미지 목록 저장 (이미지 타입 지정 가능)
    public List<ProductImage> saveProductImages(ProductPost productPost, List<MultipartFile> imageFiles, String imageType) throws IOException {
        if (imageFiles == null || imageFiles.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<ProductImage> productImages = new ArrayList<>();
        for (int i = 0; i < imageFiles.size(); i++) {
            MultipartFile file = imageFiles.get(i);
            if (!file.isEmpty()) {
                ProductImage productImage = createProductImage(productPost, file, i, imageType);
                productImages.add(productImage);
            }
        }
        
        if (!productImages.isEmpty()) {
            return productImageDAO.saveAll(productImages);
        }
        
        return new ArrayList<>();
    }
    
    // ProductImage 엔티티 생성
    private ProductImage createProductImage(ProductPost productPost, MultipartFile file, int index, String imageType) throws IOException {
        String fileName = imageService.saveImageFile(file);
        
        ProductImage productImage = new ProductImage();
        productImage.setProductPost(productPost);
        productImage.setImageUrl(fileName);
        String resolvedType = imageType != null ? imageType : "GALLERY";
        productImage.setImageType(resolvedType);
        if ("GALLERY".equalsIgnoreCase(resolvedType)) {
            productImage.setIsMain(index == 0 ? 1 : 0);
        } else {
            productImage.setIsMain(0);
        }
        return productImage;
    }
}

