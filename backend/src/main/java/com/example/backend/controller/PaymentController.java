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
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }
}


