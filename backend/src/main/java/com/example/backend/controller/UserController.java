package com.example.backend.controller;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class UserController {

    private static final String SESSION_USER_KEY = "USER_INFO";

    @Autowired
    private UserService userService;

    // 회원가입 API
    @PostMapping("/auth/signup")
    public Map<String, Object> signup(@RequestBody UserDTO request) {
        Map<String, Object> result = new HashMap<>();
        try {
            User savedUser = userService.registerUser(request);
            Map<String, Object> item = userService.buildUserResponse(savedUser);

            result.put("rt", "OK");
            result.put("item", item);
            result.put("message", "회원가입이 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 이메일과 비밀번호로 유저 확인 API
    @PostMapping("/api/users/verify-credentials")
    public Map<String, Object> verifyCredentials(@RequestBody UserDTO request) {
        Map<String, Object> result = new HashMap<>();
        try {
            User user = userService.findByEmailAndPassword(request.getEmail(), request.getPassword());
            if (user != null) {
                Map<String, Object> userInfo = userService.buildUserResponse(user);
                result.put("rt", "OK");
                result.put("item", userInfo);
                result.put("message", "인증 성공");
            } else {
                result.put("rt", "FAIL");
                result.put("message", "이메일 또는 비밀번호가 일치하지 않습니다.");
            }
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "인증 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 세션 설정 API
    @PostMapping("/auth/set-session")
    public Map<String, Object> setSession(@RequestBody Map<String, Object> userInfo, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            session.setAttribute(SESSION_USER_KEY, userInfo);
            result.put("rt", "OK");
            result.put("message", "세션이 설정되었습니다.");
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "세션 설정 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 로그아웃 API
    @PostMapping("/auth/logout")
    public Map<String, Object> logout(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        session.invalidate();
        result.put("rt", "OK");
        result.put("message", "로그아웃되었습니다.");
        return result;
    }

    // 유저 존재 여부 확인 API
    @GetMapping("/api/users/{userId}/exists")
    public Map<String, Object> checkUserExists(@PathVariable("userId") int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean exists = userService.userExists(userId);
            result.put("rt", "OK");
            result.put("exists", exists);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "유저 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 이메일 존재 여부 확인 API
    @GetMapping("/api/users/email/{email}/exists")
    public Map<String, Object> checkEmailExists(@PathVariable("email") String email) {
        Map<String, Object> result = new HashMap<>();
        try {
            boolean exists = userService.emailExists(email);
            result.put("rt", "OK");
            result.put("exists", exists);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "이메일 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 유저 ID로 유저 정보 조회 API
    @GetMapping("/api/users/{userId}")
    public Map<String, Object> getUserById(@PathVariable("userId") int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            UserDTO userDTO = userService.getUserById(userId);
            result.put("rt", "OK");
            result.put("item", userDTO);
        } catch (IllegalArgumentException e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "유저 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    // 모든 유저 목록 조회 API
    @GetMapping("/api/users")
    public Map<String, Object> getAllUsers() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<UserDTO> users = userService.getAllUsers();
            result.put("rt", "OK");
            result.put("items", users);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "유저 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }
}

