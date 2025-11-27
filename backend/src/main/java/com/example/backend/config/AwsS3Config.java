package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsS3Config {

    @Bean
    public S3Client s3Client(
            @Value("${aws.region}") String region,
            @Value("${aws.access-key-id}") String accessKeyId,
            @Value("${aws.secret-access-key}") String secretAccessKey
    ) {
        // 리전이 비어있거나 잘못된 경우 기본값 사용
        String actualRegion = (region != null && !region.trim().isEmpty()) 
                ? region.trim() 
                : "ap-northeast-2";
        
        return S3Client.builder()
                .region(Region.of(actualRegion))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                        )
                )
                // 리전 자동 감지 활성화 (301 리다이렉트 처리)
                .forcePathStyle(false)
                .build();
    }
}

