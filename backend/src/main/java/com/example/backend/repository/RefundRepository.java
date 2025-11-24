package com.example.backend.repository;

import com.example.backend.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Integer> {

    List<Refund> findByUser_UserIdOrderByCreatedAtDesc(int userId);

    @Query("select r from Refund r join r.orderItem oi where oi.sellerId = :sellerId order by r.createdAt desc")
    List<Refund> findBySellerId(@Param("sellerId") int sellerId);

    Optional<Refund> findByOrderItem_OrderItemIdAndStatusIn(int orderItemId, List<String> statuses);
    
    // 주문상세 ID로 환불 목록 조회
    List<Refund> findByOrderItem_OrderItemId(int orderItemId);
}


