package com.example.backend.controller;

import com.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/cart")
    public Map<String, Object> getCartItems(@RequestParam("userId") int userId) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<Map<String, Object>> items = cartService.getCartItems(userId);
            map.put("rt", "OK");
            map.put("items", items);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/cart")
    public Map<String, Object> addCartItem(@RequestBody CartAddRequest request) {
        Map<String, Object> map = new HashMap<>();
        try {
            Map<String, Object> item = cartService.addCartItem(request.getUserId(), request.getProductId(), request.getQuantity());
            map.put("rt", "OK");
            map.put("item", item);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PutMapping("/cart/{cartId}")
    public Map<String, Object> updateCartItem(@PathVariable("cartId") int cartId,
                                              @RequestBody CartUpdateRequest request) {
        Map<String, Object> map = new HashMap<>();
        try {
            Map<String, Object> item = cartService.updateCartItem(request.getUserId(), cartId, request.getQuantity());
            map.put("rt", "OK");
            map.put("item", item);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @DeleteMapping("/cart/{cartId}")
    public Map<String, Object> deleteCartItem(@PathVariable("cartId") int cartId,
                                              @RequestParam("userId") int userId) {
        Map<String, Object> map = new HashMap<>();
        try {
            cartService.removeCartItem(userId, cartId);
            map.put("rt", "OK");
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/cart/bulk-delete")
    public Map<String, Object> deleteCartItems(@RequestBody CartBulkDeleteRequest request) {
        Map<String, Object> map = new HashMap<>();
        try {
            cartService.removeCartItems(request.getUserId(), request.getCartIds());
            map.put("rt", "OK");
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    public static class CartAddRequest {
        private int userId;
        private int productId;
        private int quantity;

        public int getUserId() {
            return userId;
        }

        public void setUserId(int userId) {
            this.userId = userId;
        }

        public int getProductId() {
            return productId;
        }

        public void setProductId(int productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public static class CartUpdateRequest {
        private int userId;
        private int quantity;

        public int getUserId() {
            return userId;
        }

        public void setUserId(int userId) {
            this.userId = userId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public static class CartBulkDeleteRequest {
        private int userId;
        private List<Integer> cartIds;

        public int getUserId() {
            return userId;
        }

        public void setUserId(int userId) {
            this.userId = userId;
        }

        public List<Integer> getCartIds() {
            return cartIds;
        }

        public void setCartIds(List<Integer> cartIds) {
            this.cartIds = cartIds;
        }
    }
}

