package com.example.backend.service;

import com.example.backend.dao.CartDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dto.OrderCreateRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CartDAO cartDAO;

    @Autowired
    private ProductDAO productDAO;

    @Autowired
    private ProductImageDAO productImageDAO;

    @Transactional
    public Map<String, Object> createOrder(OrderCreateRequest request) {
        if (request.getCartItemIds() == null || request.getCartItemIds().isEmpty()) {
            throw new IllegalArgumentException("주문할 장바구니 상품을 선택해주세요.");
        }

        User user = userDAO.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Cart> carts = cartDAO.findByUserIdAndCartIds(request.getUserId(), request.getCartItemIds());
        if (carts.isEmpty()) {
            throw new IllegalArgumentException("선택한 장바구니 상품을 찾을 수 없습니다.");
        }

        if (carts.size() != request.getCartItemIds().size()) {
            throw new IllegalArgumentException("일부 장바구니 상품 정보를 찾을 수 없습니다.");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        int productTotal = 0;

        for (Cart cart : carts) {
            Product product = cart.getProduct();
            if (product == null) {
                throw new IllegalArgumentException("상품 정보를 찾을 수 없습니다.");
            }
            int stock = product.getStock() != null ? product.getStock() : 0;
            if (stock < cart.getQuantity()) {
                throw new IllegalStateException("재고가 부족한 상품이 있습니다: " + product.getProductPost().getPostName());
            }

            int effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            productTotal += effectivePrice * cart.getQuantity();

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductId(product.getProductId());
            orderItem.setProductPost(product.getProductPost());
            orderItem.setPostId(product.getPostId());
            if (product.getProductPost() != null) {
                orderItem.setSeller(product.getProductPost().getSeller());
                orderItem.setSellerId(product.getProductPost().getSellerId());
                orderItem.setPostName(product.getProductPost().getPostName());
            }
            orderItem.setColor(product.getColor());
            orderItem.setProductSize(product.getProductSize());
            orderItem.setQuantity(cart.getQuantity());
            orderItem.setPrice(effectivePrice);
            orderItem.setStatus("CONFIRMED");
            orderItems.add(orderItem);

            product.setStock(stock - cart.getQuantity());
            productDAO.save(product);
        }

        int deliveryFee = productTotal >= 50000 ? 0 : 3000;
        int finalPrice = productTotal + deliveryFee;

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber(user.getUserId()));
        order.setTotalPrice(productTotal);
        order.setDiscountAmount(0);
        order.setDeliveryFee(deliveryFee);
        order.setFinalPrice(finalPrice);
        order.setOrderStatus("CONFIRMED");
        order.setRecipientName(request.getRecipientName());
        order.setRecipientPhone(request.getRecipientPhone());
        order.setZipcode(request.getZipcode());
        order.setAddress(request.getAddress());
        order.setDetailAddress(request.getDetailAddress());
        order.setDeliveryMemo(request.getDeliveryMemo());
        order.setOrderItems(orderItems);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        cartDAO.deleteAll(carts);

        return buildOrderResponse(savedOrder, request.getPaymentMethod());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderDetail(int orderId, int userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        if (order.getUser() == null || order.getUser().getUserId() != userId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }

        return buildOrderResponse(order, null);
    }

    private String generateOrderNumber(int userId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String suffix = String.format("%04d", userId % 10000);
        return "ORD" + timestamp + "-" + suffix;
    }

    private Map<String, Object> buildOrderResponse(Order order, String paymentMethod) {
        Map<String, Object> item = new HashMap<>();
        item.put("orderId", order.getOrderId());
        item.put("orderNumber", order.getOrderNumber());
        item.put("orderStatus", order.getOrderStatus());
        item.put("orderDate", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        item.put("finalPrice", order.getFinalPrice());

        Map<String, Object> deliveryInfo = new HashMap<>();
        deliveryInfo.put("recipientName", order.getRecipientName());
        deliveryInfo.put("recipientPhone", order.getRecipientPhone());
        deliveryInfo.put("zipcode", order.getZipcode());
        deliveryInfo.put("address", order.getAddress());
        deliveryInfo.put("detailAddress", order.getDetailAddress());
        deliveryInfo.put("deliveryMemo", order.getDeliveryMemo());
        item.put("deliveryInfo", deliveryInfo);

        Map<String, Object> paymentInfo = new HashMap<>();
        paymentInfo.put("paymentMethod", paymentMethod != null ? paymentMethod : "CARD");
        paymentInfo.put("amount", order.getTotalPrice());
        paymentInfo.put("discountAmount", order.getDiscountAmount());
        paymentInfo.put("deliveryFee", order.getDeliveryFee());
        paymentInfo.put("finalPrice", order.getFinalPrice());
        paymentInfo.put("paidAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
        item.put("paymentInfo", paymentInfo);

        List<Map<String, Object>> orderItemList = order.getOrderItems().stream()
                .map(this::buildOrderItemResponse)
                .collect(Collectors.toList());
        item.put("items", orderItemList);

        return item;
    }

    private Map<String, Object> buildOrderItemResponse(OrderItem orderItem) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderItemId", orderItem.getOrderItemId());
        map.put("productId", orderItem.getProductId());
        map.put("postId", orderItem.getPostId());
        map.put("productName", orderItem.getPostName());
        map.put("color", orderItem.getColor());
        map.put("productSize", orderItem.getProductSize());
        map.put("price", orderItem.getPrice());
        map.put("quantity", orderItem.getQuantity());
        map.put("status", orderItem.getStatus());
        map.put("productImage", resolveMainImageUrl(orderItem.getPostId()));
        if (orderItem.getProductPost() != null) {
            map.put("brand", orderItem.getProductPost().getBrand());
        }
        return map;
    }

    private String resolveMainImageUrl(int postId) {
        List<ProductImage> images = productImageDAO.findByPostId(postId);
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(images.get(0).getImageUrl());
    }
}


