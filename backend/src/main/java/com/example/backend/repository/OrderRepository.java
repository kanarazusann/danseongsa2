package com.example.backend.repository;

import com.example.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // 사용자 ID로 주문 목록 조회 (최신순)
    List<Order> findByUser_UserIdOrderByCreatedAtDesc(int userId);
}


