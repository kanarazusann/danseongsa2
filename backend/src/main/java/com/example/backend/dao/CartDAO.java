package com.example.backend.dao;

import com.example.backend.entity.Cart;
import com.example.backend.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CartDAO {

    @Autowired
    private CartRepository cartRepository;

    @SuppressWarnings("null")
    public Cart save(Cart cart) {
        return cartRepository.save(cart);
    }

    public Optional<Cart> findById(int cartId) {
        return cartRepository.findById(cartId);
    }

    public List<Cart> findByUserId(int userId) {
        return cartRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Cart> findByUserIdAndProductId(int userId, int productId) {
        return cartRepository.findByUser_UserIdAndProduct_ProductId(userId, productId);
    }

    public Optional<Cart> findByCartIdAndUserId(int cartId, int userId) {
        return cartRepository.findByCartIdAndUser_UserId(cartId, userId);
    }

    public List<Cart> findByUserIdAndCartIds(int userId, List<Integer> cartIds) {
        return cartRepository.findByUser_UserIdAndCartIdIn(userId, cartIds);
    }

    @SuppressWarnings("null")
    public void delete(Cart cart) {
        cartRepository.delete(cart);
    }

    @SuppressWarnings("null")
    public void deleteAll(List<Cart> carts) {
        cartRepository.deleteAll(carts);
    }
}

