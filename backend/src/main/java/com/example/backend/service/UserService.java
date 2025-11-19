package com.example.backend.service;

import com.example.backend.dao.UserDAO;
import com.example.backend.dto.UserDTO;
import com.example.backend.dto.UserLoginRequest;
import com.example.backend.dto.UserSignupRequest;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserDAO userDAO;

    @Transactional
    public User registerUser(UserSignupRequest request) {
        validateSignupRequest(request);

        if (userDAO.existsByEmail(request.getEmail().trim())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim());
        user.setPassword(request.getPassword());
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setZipcode(request.getZipcode());
        user.setAddress(request.getAddress());
        user.setDetailAddress(request.getDetailAddress());

        int isSeller = request.getIsSeller() != null ? request.getIsSeller() : 0;
        user.setIsSeller(isSeller);

        if (isSeller == 1) {
            user.setBrand(request.getBrand());
            user.setBusinessNumber(request.getBusinessNumber());
        } else {
            user.setBrand(null);
            user.setBusinessNumber(null);
        }

        return userDAO.save(user);
    }

    public User authenticate(UserLoginRequest request) {
        if (!StringUtils.hasText(request.getEmail()) || !StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("이메일과 비밀번호를 입력해주세요.");
        }

        User user = userDAO.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 없습니다."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return user;
    }

    public Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> item = new HashMap<>();
        item.put("userId", user.getUserId());
        item.put("email", user.getEmail());
        item.put("name", user.getName());
        item.put("phone", user.getPhone());
        item.put("isSeller", user.getIsSeller());
        item.put("brand", user.getBrand());
        item.put("zipcode", user.getZipcode());
        item.put("address", user.getAddress());
        item.put("detailAddress", user.getDetailAddress());
        return item;
    }

    public UserDTO getUserById(int userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        List<User> users = userDAO.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setIsSeller(user.getIsSeller());
        dto.setBusinessNumber(user.getBusinessNumber());
        dto.setBrand(user.getBrand());
        dto.setZipcode(user.getZipcode());
        dto.setAddress(user.getAddress());
        dto.setDetailAddress(user.getDetailAddress());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    private void validateSignupRequest(UserSignupRequest request) {
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        if (!StringUtils.hasText(request.getPhone())) {
            throw new IllegalArgumentException("전화번호를 입력해주세요.");
        }
        if (!StringUtils.hasText(request.getZipcode()) || !StringUtils.hasText(request.getAddress())) {
            throw new IllegalArgumentException("주소를 검색해 입력해주세요.");
        }

        int isSeller = request.getIsSeller() != null ? request.getIsSeller() : 0;
        if (isSeller == 1) {
            if (!StringUtils.hasText(request.getBrand())) {
                throw new IllegalArgumentException("상호명(brand)을 입력해주세요.");
            }
            if (!StringUtils.hasText(request.getBusinessNumber())) {
                throw new IllegalArgumentException("사업자등록번호를 입력해주세요.");
            }
        }
    }
}
