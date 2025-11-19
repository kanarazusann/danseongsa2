package com.example.backend.dto;

import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private String paymentKey;
    private String orderId;
    private Integer amount;
    private OrderCreateRequest orderRequest;
}


