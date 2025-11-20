package com.example.backend.controller;

import com.example.backend.dto.OrderCreateRequest;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/orders")
    public Map<String, Object> createOrder(@RequestBody OrderCreateRequest request) {
        Map<String, Object> map = new HashMap<>();
        try {
            Map<String, Object> order = orderService.createOrder(request);
            map.put("rt", "OK");
            map.put("item", order);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    // 사용자별 주문 목록 조회
    @GetMapping("/orders")
    public Map<String, Object> getOrders(@RequestParam("userId") int userId) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<Map<String, Object>> orders = orderService.getOrdersByUserId(userId);
            map.put("rt", "OK");
            map.put("items", orders);
            System.out.println(map);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
            System.out.println(map);
        }
        return map;
    }

    @GetMapping("/orders/{orderId}")
    public Map<String, Object> getOrderDetail(@PathVariable("orderId") int orderId,
                                              @RequestParam("userId") int userId) {
        Map<String, Object> map = new HashMap<>();
        try {
            Map<String, Object> order = orderService.getOrderDetail(orderId, userId);
            map.put("rt", "OK");
            map.put("item", order);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/orders/{orderId}/cancel")
    public Map<String, Object> cancelOrder(@PathVariable("orderId") int orderId,
                                           @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> order = orderService.cancelOrder(orderId, userId);
            map.put("rt", "OK");
            map.put("item", order);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @GetMapping("/seller/orders")
    public Map<String, Object> getSellerOrders(@RequestParam("sellerId") int sellerId) {
        Map<String, Object> map = new HashMap<>();
        try {
            List<Map<String, Object>> orders = orderService.getSellerOrders(sellerId);
            map.put("rt", "OK");
            map.put("items", orders);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/seller/orders/{orderItemId}/ship")
    public Map<String, Object> shipOrderItem(@PathVariable("orderItemId") int orderItemId,
                                             @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int sellerId = ((Number) request.get("sellerId")).intValue();
            Map<String, Object> item = orderService.updateOrderItemStatusBySeller(orderItemId, sellerId, "DELIVERING");
            map.put("rt", "OK");
            map.put("item", item);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/seller/orders/{orderItemId}/cancel")
    public Map<String, Object> cancelOrderItemBySeller(@PathVariable("orderItemId") int orderItemId,
                                                       @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int sellerId = ((Number) request.get("sellerId")).intValue();
            Map<String, Object> result = orderService.cancelOrderItemBySeller(orderItemId, sellerId);
            map.put("rt", "OK");
            map.put("item", result);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/orders/items/{orderItemId}/cancel")
    public Map<String, Object> cancelOrderItem(@PathVariable("orderItemId") int orderItemId,
                                               @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> result = orderService.cancelOrderItem(orderItemId, userId);
            map.put("rt", "OK");
            map.put("item", result);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/orders/items/{orderItemId}/refund")
    public Map<String, Object> requestRefund(@PathVariable("orderItemId") int orderItemId,
                                             @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> result = orderService.requestRefund(orderItemId, userId);
            map.put("rt", "OK");
            map.put("item", result);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/orders/items/{orderItemId}/exchange")
    public Map<String, Object> requestExchange(@PathVariable("orderItemId") int orderItemId,
                                               @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> result = orderService.requestExchange(orderItemId, userId);
            map.put("rt", "OK");
            map.put("item", result);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }

    @PostMapping("/orders/items/{orderItemId}/confirm")
    public Map<String, Object> confirmOrderItem(@PathVariable("orderItemId") int orderItemId,
                                                @RequestBody Map<String, Object> request) {
        Map<String, Object> map = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> result = orderService.confirmOrderItem(orderItemId, userId);
            map.put("rt", "OK");
            map.put("item", result);
        } catch (Exception e) {
            map.put("rt", "FAIL");
            map.put("message", e.getMessage());
        }
        return map;
    }
}


