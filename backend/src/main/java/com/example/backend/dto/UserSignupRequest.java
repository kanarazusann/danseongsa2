package com.example.backend.dto;

import lombok.Data;

@Data
public class UserSignupRequest {
    private String email;
    private String password;
    private String name;
    private String phone;
    private String zipcode;
    private String address;
    private String detailAddress;
    private Integer isSeller;
    private String businessNumber;
    private String brand;
}

