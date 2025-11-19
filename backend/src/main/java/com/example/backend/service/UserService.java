package com.example.backend.service;

import com.example.backend.dao.UserDAO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserDAO userDAO;

    // 회원가입 처리
    @Transactional
    public User registerUser(UserDTO request) {
        User user = new User();
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
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

    // 이메일과 비밀번호로 유저 조회
    public User findByEmailAndPassword(String email, String password) {
        User user = userDAO.findByEmail(email != null ? email.trim() : "")
                .orElse(null);
        
        if (user == null) {
            return null;
        }
        
        if (!user.getPassword().equals(password)) {
            return null;
        }
        
        return user;
    }

    // User 엔티티를 Map 형태로 변환
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

    // 유저 ID로 유저 정보 조회
    public UserDTO getUserById(int userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return convertToDTO(user);
    }

    // 모든 유저 목록 조회
    public List<UserDTO> getAllUsers() {
        List<User> users = userDAO.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 유저 존재 여부 확인
    public boolean userExists(int userId) {
        return userDAO.findById(userId).isPresent();
    }

    // 이메일 존재 여부 확인
    public boolean emailExists(String email) {
        return userDAO.existsByEmail(email != null ? email.trim() : "");
    }

    // User 엔티티를 UserDTO로 변환
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
    public String findByNameAndPhone(String name, String phone) {
        Optional<User> user = userDAO.findByNameAndPhone(name, phone);
        return user.map(User::getEmail).orElse(null);
    }
    
    // 이름과 이메일로 유저 확인 (비밀번호 찾기용)
    public User findByNameAndEmail(String name, String email) {
        Optional<User> user = userDAO.findByNameAndEmail(name, email);
        return user.orElse(null);
    }
    
    // 비밀번호 재설정
    @Transactional
    public boolean resetPassword(String email, String newPassword) {
        Optional<User> userOpt = userDAO.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(newPassword);
            userDAO.save(user);
            return true;
        }
        return false;
    }
}
