package com.example.backend.dto;

import lombok.Data;

@Data
public class EmailVerificationVerifyRequest {
    private String email;
    private String verificationId;
    private String code;
}

