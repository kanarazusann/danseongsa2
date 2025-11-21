package com.example.backend.service;

import com.example.backend.dao.UserDAO;
import com.example.backend.dao.CartDAO;
import com.example.backend.dao.WishlistDAO;
import com.example.backend.dao.ReviewDAO;
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

    @Autowired
    private CartDAO cartDAO;

    @Autowired
    private WishlistDAO wishlistDAO;

    @Autowired
    private ReviewDAO reviewDAO;

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
        item.put("password", user.getPassword()); // 비밀번호 확인을 위해 세션에 포함
        item.put("name", user.getName());
        item.put("phone", user.getPhone());
        item.put("isSeller", user.getIsSeller());
        item.put("brand", user.getBrand());
        item.put("businessNumber", user.getBusinessNumber());
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

    // 회원정보 수정
    @Transactional
    public User updateUser(int userId, UserDTO request) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 수정 가능한 필드 업데이트
        if (request.getName() != null) user.setName(request.getName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getZipcode() != null) user.setZipcode(request.getZipcode().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getDetailAddress() != null) user.setDetailAddress(request.getDetailAddress().trim());
        if (request.getBrand() != null) user.setBrand(request.getBrand().trim());
        if (request.getBusinessNumber() != null) user.setBusinessNumber(request.getBusinessNumber().trim());

        return userDAO.save(user);
    }

    // 비밀번호 변경
    @Transactional
    public User changePassword(int userId, String newPassword) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        
        user.setPassword(newPassword);
        return userDAO.save(user);
    }

    // 회원 탈퇴 (사용자 삭제)
    @Transactional
    public void deleteUser(int userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        
        // 관련 데이터 삭제 (외래키 제약조건 해결)
        // 1. 장바구니 삭제
        List<com.example.backend.entity.Cart> carts = cartDAO.findByUserId(userId);
        if (carts != null && !carts.isEmpty()) {
            cartDAO.deleteAll(carts);
        }
        
        // 2. 찜 목록 삭제
        List<com.example.backend.entity.Wishlist> wishlists = wishlistDAO.findByUserIdOrderByCreatedAtDesc(userId);
        if (wishlists != null && !wishlists.isEmpty()) {
            for (com.example.backend.entity.Wishlist wishlist : wishlists) {
                wishlistDAO.delete(wishlist);
            }
        }
        
        // 3. 리뷰 삭제
        List<com.example.backend.entity.Review> reviews = reviewDAO.findByUserId(userId);
        if (reviews != null && !reviews.isEmpty()) {
            for (com.example.backend.entity.Review review : reviews) {
                reviewDAO.deleteById(review.getReviewId());
            }
        }
        
        // 4. 사용자 삭제
        userDAO.delete(user);
    }
}
