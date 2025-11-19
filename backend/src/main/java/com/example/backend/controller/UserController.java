package com.example.backend.controller;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.UserLoginRequest;
import com.example.backend.dto.UserSignupRequest;
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

    @PostMapping("/auth/signup")
    public Map<String, Object> signup(@RequestBody UserSignupRequest request) {
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

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody UserLoginRequest request, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            User user = userService.authenticate(request);
            Map<String, Object> sessionUser = userService.buildUserResponse(user);
            session.setAttribute(SESSION_USER_KEY, sessionUser);

            result.put("rt", "OK");
            result.put("item", sessionUser);
            result.put("message", "로그인이 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", "로그인 중 오류가 발생했습니다: " + e.getMessage());
        }
        return result;
    }

    @PostMapping("/auth/logout")
    public Map<String, Object> logout(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        session.invalidate();
        result.put("rt", "OK");
        result.put("message", "로그아웃되었습니다.");
        return result;
    }

    @GetMapping("/auth/session")
    public Map<String, Object> sessionInfo(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        Object sessionUser = session.getAttribute(SESSION_USER_KEY);
        if (sessionUser != null) {
            result.put("rt", "OK");
            result.put("item", sessionUser);
        } else {
            result.put("rt", "FAIL");
            result.put("message", "로그인 정보가 없습니다.");
        }
        return result;
    }

    @GetMapping("/api/users/{userId}")
    public Map<String, Object> getUserById(@PathVariable int userId) {
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

