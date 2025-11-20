package com.example.backend.controller;

import com.example.backend.dto.OrderCreateRequest;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
}


