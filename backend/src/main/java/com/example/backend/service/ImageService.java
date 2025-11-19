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
    
    // 이미지 파일 저장
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
}

