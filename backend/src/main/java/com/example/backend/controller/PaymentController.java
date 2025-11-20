package com.example.backend.controller;

import com.example.backend.dto.PaymentConfirmRequest;
import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/payments/confirm")
    public Map<String, Object> confirmPayment(@RequestBody PaymentConfirmRequest request) {
        Map<String, Object> map = new HashMap<>();
        try {
            Map<String, Object> order = paymentService.confirmPayment(request);
            map.put("rt", "OK");
            map.put("item", order);
        } catch (Exception e) {
            e.printStackTrace(); // 에러 로그 출력
            map.put("rt", "FAIL");
            String errorMessage = e.getMessage();
            // 더 자세한 에러 정보 포함
            if (e.getCause() != null) {
                errorMessage += " (원인: " + e.getCause().getMessage() + ")";
            }
            map.put("message", errorMessage);
        }
        return map;
    }
}


