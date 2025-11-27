package com.example.backend.controller;

import com.example.backend.dto.EmailVerificationResponse;
import com.example.backend.dto.EmailVerificationSendRequest;
import com.example.backend.dto.EmailVerificationVerifyRequest;
import com.example.backend.service.EmailVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private EmailVerificationService emailVerificationService;

    @PostMapping("/auth/email/send-code")
    public Map<String, Object> sendVerificationCode(@RequestBody EmailVerificationSendRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            EmailVerificationResponse response = emailVerificationService.sendVerificationCode(request.getEmail());
            result.put("rt", "OK");
            result.put("item", response);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/auth/email/verify-code")
    public Map<String, Object> verifyEmailCode(@RequestBody EmailVerificationVerifyRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean verified = emailVerificationService.verifyCode(
                    request.getEmail(),
                    request.getVerificationId(),
                    request.getCode()
            );
            if (verified) {
                result.put("rt", "OK");
                result.put("message", "이메일 인증이 완료되었습니다.");
            } else {
                result.put("rt", "FAIL");
                result.put("message", "인증 번호가 올바르지 않거나 만료되었습니다.");
            }
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }
}

