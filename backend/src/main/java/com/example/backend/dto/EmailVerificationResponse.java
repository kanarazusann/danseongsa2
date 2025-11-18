package com.example.backend.dto;

import lombok.Data;

@Data
public class EmailVerificationResponse {
    private String verificationId;
    private long expiresAt;
}

