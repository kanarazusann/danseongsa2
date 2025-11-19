package com.example.backend.dao;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserDAO {

    @Autowired
    private UserRepository userRepository;

    // 유저 저장
    public User save(User user) {
        return userRepository.save(user);
    }

    // 이메일 존재 여부 확인
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // 이메일로 유저 조회
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // 유저 ID로 유저 조회
    public Optional<User> findById(int userId) {
        return userRepository.findById(userId);
    }

    // 모든 유저 목록 조회
    public List<User> findAll() {
        return userRepository.findAll();
    }
    // 아이디 찾기
    public Optional<User> findByNameAndPhone(String name, String phone) {
        return userRepository.findByNameAndPhone(name, phone);
    }
    // 비밀번호 찾기
    public Optional<User> findByNameAndEmail(String name, String email) {
        return userRepository.findByNameAndEmail(name, email);
    }
}

