package com.example.backend.service;

import com.example.backend.dao.CartDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.ReviewDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dto.OrderCreateRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.OrderItemRepository;
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

    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ReviewDAO reviewDAO;

    @Transactional
    public Map<String, Object> createOrder(OrderCreateRequest request) {
        User user = userDAO.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<OrderItem> orderItems;
        int productTotal;
        List<Cart> cartsToDelete = new ArrayList<>();

        // 장바구니에서 주문하는 경우
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            List<Cart> carts = cartDAO.findByUserIdAndCartIds(request.getUserId(), request.getCartItemIds());
            if (carts.isEmpty()) {
                throw new IllegalArgumentException("선택한 장바구니 상품을 찾을 수 없습니다.");
            }

            if (carts.size() != request.getCartItemIds().size()) {
                throw new IllegalArgumentException("일부 장바구니 상품 정보를 찾을 수 없습니다.");
            }

            orderItems = new ArrayList<>();
            productTotal = 0;

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

                OrderItem orderItem = createOrderItemFromCart(cart, product, effectivePrice);
                orderItems.add(orderItem);

                product.setStock(stock - cart.getQuantity());
                productDAO.save(product);
            }

            cartsToDelete = carts;
        }
        // 바로구매 - 직접 주문 항목으로 주문하는 경우
        else if (request.getOrderItems() != null && !request.getOrderItems().isEmpty()) {
            orderItems = new ArrayList<>();
            productTotal = 0;

            for (OrderCreateRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
                Product product = productDAO.findById(itemRequest.getProductId());
                if (product == null) {
                    throw new IllegalArgumentException("상품 정보를 찾을 수 없습니다: " + itemRequest.getProductId());
                }

                // 색상과 사이즈가 일치하는지 확인 (null인 경우 스킵)
                if (itemRequest.getColor() != null && product.getColor() != null && 
                    !itemRequest.getColor().equals(product.getColor())) {
                    throw new IllegalArgumentException("선택한 색상과 상품 정보가 일치하지 않습니다.");
                }
                if (itemRequest.getProductSize() != null && product.getProductSize() != null &&
                    !itemRequest.getProductSize().equals(product.getProductSize())) {
                    throw new IllegalArgumentException("선택한 사이즈와 상품 정보가 일치하지 않습니다.");
                }

                int stock = product.getStock() != null ? product.getStock() : 0;
                if (stock < itemRequest.getQuantity()) {
                    throw new IllegalStateException("재고가 부족한 상품이 있습니다: " + product.getProductPost().getPostName());
                }

                int effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
                productTotal += effectivePrice * itemRequest.getQuantity();

                OrderItem orderItem = createOrderItemFromRequest(itemRequest, product, effectivePrice);
                orderItems.add(orderItem);

                product.setStock(stock - itemRequest.getQuantity());
                productDAO.save(product);
            }
        } else {
            throw new IllegalArgumentException("주문할 상품을 선택해주세요.");
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
        order.setOrderStatus("PAID");  // 결제 완료 시 즉시 PAID로 설정
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
        
        // 저장 후 refresh하여 최신 데이터 가져오기 (updatedAt 자동 설정)
        orderRepository.flush(); // DB에 즉시 반영
        
        // 장바구니에서 주문한 경우 장바구니 삭제
        if (!cartsToDelete.isEmpty()) {
            cartDAO.deleteAll(cartsToDelete);
        }

        // 최신 정보 다시 조회하여 날짜 필드 확실히 가져오기
        Order freshOrder = orderRepository.findById(savedOrder.getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문 저장 후 조회 실패"));

        return buildOrderResponse(freshOrder, request.getPaymentMethod());
    }

    private OrderItem createOrderItemFromCart(Cart cart, Product product, int effectivePrice) {
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
        orderItem.setStatus("PAID");  // 결제 완료 시 즉시 PAID로 설정
        return orderItem;
    }

    private OrderItem createOrderItemFromRequest(OrderCreateRequest.OrderItemRequest itemRequest, Product product, int effectivePrice) {
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
        orderItem.setQuantity(itemRequest.getQuantity());
        orderItem.setPrice(effectivePrice);
        orderItem.setStatus("PAID");  // 결제 완료 시 즉시 PAID로 설정
        return orderItem;
    }

    // 사용자별 주문 목록 조회
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrdersByUserId(int userId) {
        List<Order> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        
        return orders.stream()
                .map(order -> buildOrderResponse(order, null))
                .collect(Collectors.toList());
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

    @Transactional
    public Map<String, Object> cancelOrder(int orderId, int userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        if (order.getUser() == null || order.getUser().getUserId() != userId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }

        // 주문 상태 확인 (PAID인 경우만 취소 가능)
        if (!"PAID".equals(order.getOrderStatus())) {
            throw new IllegalStateException("취소할 수 없는 주문 상태입니다.");
        }

        // 주문 상품들의 재고 복구
        if (order.getOrderItems() != null) {
            for (OrderItem orderItem : order.getOrderItems()) {
                Product product = orderItem.getProduct();
                if (product != null) {
                    int currentStock = product.getStock() != null ? product.getStock() : 0;
                    product.setStock(currentStock + orderItem.getQuantity());
                    productDAO.save(product);
                }
            }
        }

        // Order 삭제 (CASCADE로 OrderItem도 자동 삭제됨)
        orderRepository.deleteById(orderId);

        // 성공 응답 반환
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "주문이 취소되었습니다.");
        return response;
    }

    @Transactional
    public Map<String, Object> updateOrderItemStatusBySeller(int orderItemId, int sellerId, String newStatus) {
        OrderItem orderItem = getOrderItemOrThrow(orderItemId);
        if (orderItem.getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }

        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "PAID";
        if (!"PAID".equals(currentStatus) && !"DELIVERING".equals(currentStatus)) {
            throw new IllegalStateException("배송 처리할 수 없는 상태입니다.");
        }

        orderItem.setStatus(newStatus.toUpperCase());
        OrderItem savedItem = orderItemRepository.save(orderItem);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        return buildSellerOrderItemResponse(savedItem);
    }

    @Transactional
    public Map<String, Object> cancelOrderItem(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "PAID";
        if (!"PAID".equals(currentStatus)) {
            throw new IllegalStateException("결제 취소할 수 없는 상태입니다.");
        }

        Product product = orderItem.getProduct();
        if (product != null) {
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            int quantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
            product.setStock(currentStock + quantity);
            productDAO.save(product);
        }

        Order order = orderItem.getOrder();
        orderItemRepository.delete(orderItem);

        Map<String, Object> response = new HashMap<>();
        List<OrderItem> remainingItems = orderItemRepository.findByOrder_OrderId(order.getOrderId());
        if (remainingItems.isEmpty()) {
            orderRepository.delete(order);
            response.put("orderDeleted", true);
        } else {
            updateOrderStatusBasedOnItems(order);
            Order refreshedOrder = orderRepository.findById(order.getOrderId())
                    .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));
            response.put("orderDeleted", false);
            response.put("order", buildOrderResponse(refreshedOrder, null));
        }
        return response;
    }

    @Transactional
    public Map<String, Object> cancelOrderItemBySeller(int orderItemId, int sellerId) {
        OrderItem orderItem = getOrderItemOrThrow(orderItemId);
        if (orderItem.getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }
        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "PAID";
        if (!"PAID".equals(currentStatus)) {
            throw new IllegalStateException("결제 취소할 수 없는 상태입니다.");
        }
        Product product = orderItem.getProduct();
        if (product != null) {
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            int quantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
            product.setStock(currentStock + quantity);
            productDAO.save(product);
        }
        Order order = orderItem.getOrder();
        orderItemRepository.delete(orderItem);
        Map<String, Object> response = new HashMap<>();
        List<OrderItem> remainingItems = orderItemRepository.findByOrder_OrderId(order.getOrderId());
        if (remainingItems.isEmpty()) {
            orderRepository.delete(order);
            response.put("orderDeleted", true);
        } else {
            updateOrderStatusBasedOnItems(order);
            Order refreshedOrder = orderRepository.findById(order.getOrderId())
                    .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));
            response.put("orderDeleted", false);
            response.put("order", buildOrderResponse(refreshedOrder, null));
        }
        return response;
    }

    @Transactional
    public Map<String, Object> requestRefund(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "";
        if (!"DELIVERING".equals(currentStatus) && !"DELIVERED".equals(currentStatus)) {
            throw new IllegalStateException("환불을 요청할 수 없는 상태입니다.");
        }
        orderItem.setStatus("REFUND_REQUESTED");
        orderItemRepository.save(orderItem);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));
        Map<String, Object> response = new HashMap<>();
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> requestExchange(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "";
        if (!"DELIVERING".equals(currentStatus) && !"DELIVERED".equals(currentStatus)) {
            throw new IllegalStateException("교환을 요청할 수 없는 상태입니다.");
        }
        orderItem.setStatus("EXCHANGE_REQUESTED");
        orderItemRepository.save(orderItem);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));
        Map<String, Object> response = new HashMap<>();
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> confirmOrderItem(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = orderItem.getStatus() != null ? orderItem.getStatus().toUpperCase() : "";
        if (!"DELIVERING".equals(currentStatus) && !"DELIVERED".equals(currentStatus)) {
            throw new IllegalStateException("구매 확정할 수 없는 상태입니다.");
        }

        orderItem.setStatus("DELIVERED");
        orderItemRepository.save(orderItem);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));
        Map<String, Object> response = new HashMap<>();
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSellerOrders(int sellerId) {
        List<OrderItem> orderItems = orderItemRepository.findBySellerIdWithDetails(sellerId);
        return orderItems.stream()
                .map(this::buildSellerOrderItemResponse)
                .collect(Collectors.toList());
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
        
        // 주문일시: createdAt 사용
        String orderDateStr = null;
        if (order.getCreatedAt() != null) {
            orderDateStr = order.getCreatedAt().toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        item.put("orderDate", orderDateStr);
        item.put("createdAt", orderDateStr);
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
        // 결제일시: 주문일시와 동일 (updatedAt 우선, 없으면 createdAt)
        paymentInfo.put("paidAt", orderDateStr);
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
        
        // 리뷰 작성 여부 확인
        Review review = reviewDAO.findByOrderItemId(orderItem.getOrderItemId());
        if (review != null) {
            map.put("reviewId", review.getReviewId());
            map.put("hasReview", true);
        } else {
            map.put("hasReview", false);
        }
        
        return map;
    }

    private Map<String, Object> buildSellerOrderItemResponse(OrderItem orderItem) {
        Map<String, Object> map = new HashMap<>();
        Order order = orderItem.getOrder();

        map.put("orderItemId", orderItem.getOrderItemId());
        map.put("orderId", order != null ? order.getOrderId() : null);
        map.put("orderNumber", order != null ? order.getOrderNumber() : null);

        String orderDateStr = null;
        if (order != null && order.getCreatedAt() != null) {
            orderDateStr = order.getCreatedAt().toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        map.put("orderDate", orderDateStr);

        map.put("status", orderItem.getStatus());
        map.put("productName", orderItem.getPostName());
        map.put("productId", orderItem.getProductId());
        map.put("postId", orderItem.getPostId());
        map.put("color", orderItem.getColor());
        map.put("productSize", orderItem.getProductSize());
        map.put("quantity", orderItem.getQuantity());
        map.put("price", orderItem.getPrice());
        Integer price = orderItem.getPrice() != null ? orderItem.getPrice() : 0;
        Integer qty = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
        map.put("totalPrice", price * qty);
        map.put("productImage", resolveMainImageUrl(orderItem.getPostId()));

        if (order != null) {
            map.put("buyerName", order.getRecipientName());
            map.put("buyerPhone", order.getRecipientPhone());
            map.put("zipcode", order.getZipcode());
            map.put("address", order.getAddress());
            map.put("detailAddress", order.getDetailAddress());
        }

        return map;
    }

    private OrderItem getOrderItemOrThrow(int orderItemId) {
        return orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("주문 상품을 찾을 수 없습니다."));
    }

    private OrderItem getOrderItemForUser(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemOrThrow(orderItemId);
        if (orderItem.getOrder() == null || orderItem.getOrder().getUser() == null ||
                orderItem.getOrder().getUser().getUserId() != userId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }
        return orderItem;
    }

    private void updateOrderStatusBasedOnItems(Order order) {
        if (order == null) return;
        List<OrderItem> items = orderItemRepository.findByOrder_OrderId(order.getOrderId());
        if (items == null || items.isEmpty()) {
            return;
        }

        boolean allDelivered = items.stream()
                .allMatch(item -> "DELIVERED".equalsIgnoreCase(item.getStatus()));

        boolean anyRefund = items.stream().anyMatch(item -> {
            String status = item.getStatus() != null ? item.getStatus().toUpperCase() : "";
            return status.startsWith("REFUND") || status.startsWith("EXCHANGE");
        });

        boolean anyDelivering = items.stream()
                .anyMatch(item -> "DELIVERING".equalsIgnoreCase(item.getStatus()));

        String newStatus = "PAID";
        if (allDelivered) {
            newStatus = "DELIVERED";
        } else if (anyRefund) {
            newStatus = "REFUND";
        } else if (anyDelivering) {
            newStatus = "DELIVERING";
        }

        order.setOrderStatus(newStatus);
        orderRepository.save(order);
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


