package com.example.backend.service;

import com.example.backend.dto.OrderCreateRequest;
import com.example.backend.dto.PaymentConfirmRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class PaymentService {

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

    @Value("${toss.payments.secret-key}")
    private String secretKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private OrderService orderService;

    public Map<String, Object> confirmPayment(PaymentConfirmRequest request) {
        if (request.getOrderRequest() == null) {
            throw new IllegalArgumentException("주문 정보를 확인할 수 없습니다.");
        }
        OrderCreateRequest orderRequest = request.getOrderRequest();
        if (orderRequest.getPaymentMethod() == null || orderRequest.getPaymentMethod().isBlank()) {
            orderRequest.setPaymentMethod("CARD");
        }

        Map<String, Object> tossResponse = requestTossConfirm(request);
        Map<String, Object> order = orderService.createOrder(orderRequest);

        Object finalPrice = order.get("finalPrice");
        if (finalPrice instanceof Number) {
            int actualAmount = ((Number) finalPrice).intValue();
            if (!Objects.equals(actualAmount, request.getAmount())) {
                throw new IllegalStateException("결제 금액이 주문 금액과 일치하지 않습니다.");
            }
        }

        order.put("payment", tossResponse);
        return order;
    }

    @SuppressWarnings("null")
    private Map<String, Object> requestTossConfirm(PaymentConfirmRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String basicAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            headers.set(HttpHeaders.AUTHORIZATION, "Basic " + basicAuth);

            Map<String, Object> body = new HashMap<>();
            body.put("paymentKey", request.getPaymentKey());
            body.put("orderId", request.getOrderId());
            body.put("amount", request.getAmount());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            TOSS_CONFIRM_URL,
                            HttpMethod.POST,
                            entity,
                            new ParameterizedTypeReference<Map<String, Object>>() {
                            });
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            throw new IllegalStateException("토스 결제 승인 중 오류가 발생했습니다: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new IllegalStateException("토스 결제 승인 중 오류가 발생했습니다.", e);
        }
    }
}


