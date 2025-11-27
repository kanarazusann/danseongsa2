package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class ImageService {

    private static final String IMAGE_FOLDER = "uploads/images";
    private static final String REVIEW_IMAGE_FOLDER = "uploads/reviewImages";

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;
    private final String customBaseUrl;

    public ImageService(
            S3Client s3Client,
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.region}") String region,
            @Value("${aws.s3.base-url:}") String customBaseUrl
    ) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.region = region;
        this.customBaseUrl = customBaseUrl;
    }

    // 이미지 파일 저장 (상품 이미지용)
    public String saveImageFile(MultipartFile file) throws IOException {
        return uploadToS3(file, IMAGE_FOLDER);
    }

    // 리뷰 이미지 파일 저장
    public String saveReviewImageFile(MultipartFile file) throws IOException {
        return uploadToS3(file, REVIEW_IMAGE_FOLDER);
    }

    private String uploadToS3(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String extension = "";
        String originalFileName = file.getOriginalFilename();
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;
        String normalizedFolder = folder.endsWith("/") ? folder.substring(0, folder.length() - 1) : folder;
        String key = normalizedFolder + "/" + fileName;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(StringUtils.hasText(file.getContentType()) ? file.getContentType() : "application/octet-stream")
                .acl(ObjectCannedACL.PUBLIC_READ)
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        return buildPublicUrl(key);
    }

    private String buildPublicUrl(String key) {
        if (StringUtils.hasText(customBaseUrl)) {
            return customBaseUrl.endsWith("/")
                    ? customBaseUrl + key
                    : customBaseUrl + "/" + key;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }
}
