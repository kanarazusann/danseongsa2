package com.example.backend.repository;

import com.example.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    @Query("select distinct oi from OrderItem oi " +
            "join fetch oi.order o " +
            "left join fetch oi.product p " +
            "left join fetch oi.productPost post " +
            "where oi.sellerId = :sellerId " +
            "order by oi.orderItemId desc")
    List<OrderItem> findBySellerIdWithDetails(@Param("sellerId") int sellerId);
}

