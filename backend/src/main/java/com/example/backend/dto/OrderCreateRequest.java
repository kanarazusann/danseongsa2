package com.example.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequest {
    private int userId;
    private List<Integer> cartItemIds;

    private String recipientName;
    private String recipientPhone;
    private String zipcode;
    private String address;
    private String detailAddress;
    private String deliveryMemo;

    private String paymentMethod;
}


