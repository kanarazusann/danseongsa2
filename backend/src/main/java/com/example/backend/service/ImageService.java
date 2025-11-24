package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageService {
    
    private static final String UPLOAD_DIR = "uploads/images/";
    private static final String REVIEW_IMAGE_DIR = "uploads/reviewImages/";
    
    // 이미지 파일 저장 (상품 이미지용)
    public String saveImageFile(MultipartFile file) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
            : "";
        String fileName = UUID.randomUUID().toString() + extension;
        
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.write(filePath, file.getBytes());
        
        return "/images/" + fileName;
    }
    
    // 리뷰 이미지 파일 저장
    public String saveReviewImageFile(MultipartFile file) throws IOException {
        File uploadDir = new File(REVIEW_IMAGE_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
            : "";
        String fileName = UUID.randomUUID().toString() + extension;
        
        Path filePath = Paths.get(REVIEW_IMAGE_DIR + fileName);
        Files.write(filePath, file.getBytes());
        
        return "/reviewImages/" + fileName;
    }
}

