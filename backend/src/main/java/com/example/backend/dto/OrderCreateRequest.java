package com.example.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequest {
    private int userId;
    private List<Integer> cartItemIds; // 장바구니에서 주문하는 경우

    // 바로구매의 경우 직접 주문 항목 정보
    private List<OrderItemRequest> orderItems;

    private String recipientName;
    private String recipientPhone;
    private String zipcode;
    private String address;
    private String detailAddress;
    private String deliveryMemo;

    private String paymentMethod;

    // 바로구매를 위한 주문 항목 DTO
    @Data
    public static class OrderItemRequest {
        private int productId;
        private int quantity;
        private String color;
        private String productSize;
    }
}


