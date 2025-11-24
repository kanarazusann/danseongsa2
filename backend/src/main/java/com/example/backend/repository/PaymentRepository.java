package com.example.backend.repository;

import com.example.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
    // 주문 ID로 결제 목록 조회
    List<Payment> findByOrder_OrderId(int orderId);
}

