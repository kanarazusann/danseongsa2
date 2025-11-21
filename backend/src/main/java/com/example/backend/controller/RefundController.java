package com.example.backend.controller;

import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/refunds")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RefundController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Map<String, Object> createRefundRequest(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int orderItemId = ((Number) request.get("orderItemId")).intValue();
            int userId = ((Number) request.get("userId")).intValue();
            String refundType = request.getOrDefault("refundType", "REFUND").toString();
            String reason = request.getOrDefault("reason", "요청").toString();
            String reasonDetail = request.getOrDefault("reasonDetail", "").toString();
            Integer refundAmount = null;
            if (request.get("refundAmount") != null) {
                refundAmount = ((Number) request.get("refundAmount")).intValue();
            }
            Map<String, Object> data = orderService.createRefundRequest(
                    orderItemId,
                    userId,
                    refundType,
                    reason,
                    reasonDetail,
                    refundAmount
            );
            result.put("rt", "OK");
            result.put("item", data);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/{refundId}/cancel")
    public Map<String, Object> cancelRefund(@PathVariable("refundId") int refundId,
                                            @RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int userId = ((Number) request.get("userId")).intValue();
            Map<String, Object> data = orderService.cancelRefundRequest(refundId, userId);
            result.put("rt", "OK");
            result.put("item", data);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/{refundId}/approve")
    public Map<String, Object> approveRefund(@PathVariable("refundId") int refundId,
                                             @RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int sellerId = ((Number) request.get("sellerId")).intValue();
            String responseMessage = request.getOrDefault("sellerResponse", "").toString();
            Map<String, Object> data = orderService.approveRefundRequest(refundId, sellerId, responseMessage);
            result.put("rt", "OK");
            result.put("item", data);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @PostMapping("/{refundId}/reject")
    public Map<String, Object> rejectRefund(@PathVariable("refundId") int refundId,
                                            @RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int sellerId = ((Number) request.get("sellerId")).intValue();
            String responseMessage = request.getOrDefault("sellerResponse", "").toString();
            Map<String, Object> data = orderService.rejectRefundRequest(refundId, sellerId, responseMessage);
            result.put("rt", "OK");
            result.put("item", data);
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/user")
    public Map<String, Object> getUserRefunds(@RequestParam("userId") int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("rt", "OK");
            result.put("items", orderService.getRefundsByUser(userId));
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }

    @GetMapping("/seller")
    public Map<String, Object> getSellerRefunds(@RequestParam("sellerId") int sellerId) {
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("rt", "OK");
            result.put("items", orderService.getRefundsBySeller(sellerId));
        } catch (Exception e) {
            result.put("rt", "FAIL");
            result.put("message", e.getMessage());
        }
        return result;
    }
}


