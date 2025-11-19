package com.example.backend.repository;

import com.example.backend.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    List<Cart> findByUser_UserIdOrderByCreatedAtDesc(int userId);

    Optional<Cart> findByUser_UserIdAndProduct_ProductId(int userId, int productId);

    Optional<Cart> findByCartIdAndUser_UserId(int cartId, int userId);

    List<Cart> findByUser_UserIdAndCartIdIn(int userId, List<Integer> cartIds);
}

