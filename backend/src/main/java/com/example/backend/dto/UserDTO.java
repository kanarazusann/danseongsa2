package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private int userId;
    private String email;
    private String password;  // 로그인/회원가입 시에만 사용
    private String name;
    private String phone;
    private Integer isSeller;
    private String businessNumber;  // 프론트엔드에서 String으로 받고, 엔티티에서 Integer로 변환
    private String brand;
    private String zipcode;
    private String address;
    private String detailAddress;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}

