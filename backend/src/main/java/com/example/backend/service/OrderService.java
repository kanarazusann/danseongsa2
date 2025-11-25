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
import com.example.backend.repository.RefundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String REFUND_STATUS_REQUESTED = "REQ";
    private static final String REFUND_STATUS_APPROVED = "APR";
    private static final String REFUND_STATUS_COMPLETED = "COM";
    private static final String REFUND_STATUS_REJECTED = "REJ";
    private static final String REFUND_STATUS_CANCELED = "CAN";
    
    // REFUNDTYPE 상수 (DB 저장용: 짧은 코드)
    private static final String REFUND_TYPE_REF = "REF";  // 환불
    private static final String REFUND_TYPE_EXC = "EXC";  // 교환
    
    // ORDERITEM STATUS 상수 (DB 저장용: 짧은 코드)
    private static final String ORDERITEM_STATUS_CONFIRMED = "con";  // CONFIRMED
    private static final String ORDERITEM_STATUS_CANCELLED = "can";  // CANCELLED
    private static final String ORDERITEM_STATUS_REFUNDED = "ref";   // REFUNDED

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

    @Autowired
    private RefundRepository refundRepository;

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
        orderItem.setStatus(convertOrderItemStatusToDb("CONFIRMED"));  // 결제 완료 시 즉시 CONFIRMED로 설정
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
        orderItem.setStatus(convertOrderItemStatusToDb("CONFIRMED"));  // 결제 완료 시 즉시 CONFIRMED로 설정
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

        String currentStatus = convertOrderItemStatusFromDb(orderItem.getStatus());
        if (!"CONFIRMED".equalsIgnoreCase(currentStatus) && !"DELIVERING".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("배송 처리할 수 없는 상태입니다.");
        }

        orderItem.setStatus(convertOrderItemStatusToDb(newStatus));
        OrderItem savedItem = orderItemRepository.save(orderItem);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        return buildSellerOrderItemResponse(savedItem);
    }

    @Transactional
    public Map<String, Object> cancelOrderItem(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = convertOrderItemStatusFromDb(orderItem.getStatus());
        if (!"CONFIRMED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("결제 취소할 수 없는 상태입니다.");
        }

        Product product = orderItem.getProduct();
        if (product != null) {
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            int quantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
            product.setStock(currentStock + quantity);
            productDAO.save(product);
        }

        orderItem.setStatus(convertOrderItemStatusToDb("CANCELLED"));
        orderItemRepository.save(orderItem);

        Order order = orderItem.getOrder();
        updateOrderStatusBasedOnItems(order);
        Order refreshedOrder = orderRepository.findById(order.getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("orderDeleted", false);
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> cancelOrderItemBySeller(int orderItemId, int sellerId) {
        OrderItem orderItem = getOrderItemOrThrow(orderItemId);
        if (orderItem.getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 주문에 접근할 수 없습니다.");
        }
        String currentStatus = convertOrderItemStatusFromDb(orderItem.getStatus());
        if (!"CONFIRMED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("결제 취소할 수 없는 상태입니다.");
        }
        Product product = orderItem.getProduct();
        if (product != null) {
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            int quantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 0;
            product.setStock(currentStock + quantity);
            productDAO.save(product);
        }

        orderItem.setStatus(convertOrderItemStatusToDb("CANCELLED"));
        orderItemRepository.save(orderItem);

        Order order = orderItem.getOrder();
        updateOrderStatusBasedOnItems(order);
        Order refreshedOrder = orderRepository.findById(order.getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("orderDeleted", false);
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> requestRefund(int orderItemId, int userId) {
        return createRefundRequest(orderItemId, userId, "REFUND", "사용자 환불 요청", null, null);
    }


    @Transactional
    public Map<String, Object> confirmOrderItem(int orderItemId, int userId) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = convertOrderItemStatusFromDb(orderItem.getStatus());
        if (!"DELIVERING".equalsIgnoreCase(currentStatus) && !"DELIVERED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("구매 확정할 수 없는 상태입니다.");
        }

        orderItem.setStatus(convertOrderItemStatusToDb("CONFIRMED"));  // 구매 확정은 CONFIRMED로 처리
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

    @Transactional
    public Map<String, Object> createRefundRequest(int orderItemId,
                                                   int userId,
                                                   String refundType,
                                                   String reason,
                                                   String reasonDetail,
                                                   Integer refundAmount) {
        OrderItem orderItem = getOrderItemForUser(orderItemId, userId);
        String currentStatus = convertOrderItemStatusFromDb(orderItem.getStatus());
        validateRefundRequestStatus(refundType, currentStatus);

        refundRepository.findByOrderItem_OrderItemIdAndStatusIn(
                orderItemId,
                Arrays.asList(REFUND_STATUS_REQUESTED, REFUND_STATUS_APPROVED, "REQUESTED", "APPROVED")
        ).ifPresent(r -> {
            throw new IllegalStateException("이미 처리 중인 신청이 있습니다.");
        });

        Refund refund = new Refund();
        refund.setOrderItem(orderItem);
        refund.setUser(orderItem.getOrder().getUser());
        // API는 "REFUND"/"EXCHANGE"를 받지만, DB에는 "REF"/"EXC"로 저장
        refund.setRefundType(normalizeRefundType(refundType != null ? refundType.toUpperCase() : "REFUND"));
        refund.setReason(reason);
        refund.setReasonDetail(reasonDetail);
        refund.setRefundAmount(refundAmount);
        refund.setStatus(REFUND_STATUS_REQUESTED);
        refund.setPreviousStatus(orderItem.getStatus());

        // REFUND_REQUESTED는 임시 상태이므로 DB에는 저장하지 않고, 실제 환불 완료 시 REFUNDED로 저장
        // orderItem.setStatus(convertOrderItemStatusToDb("REFUNDED")); // 환불 요청 시점에는 상태 변경하지 않음
        orderItemRepository.save(orderItem);

        Refund saved = refundRepository.save(refund);
        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("refund", buildRefundResponse(saved));
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> cancelRefundRequest(int refundId, int userId) {
        Refund refund = getRefundOrThrow(refundId);
        if (refund.getUser() == null || refund.getUser().getUserId() != userId) {
            throw new IllegalArgumentException("신청을 취소할 수 없습니다.");
        }
        if (!isRefundStatusRequested(refund.getStatus())) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        OrderItem orderItem = refund.getOrderItem();
        // previousStatus는 이미 DB 형식(짧은 코드)이므로 그대로 사용
        orderItem.setStatus(refund.getPreviousStatus());
        orderItemRepository.save(orderItem);

        refund.setStatus(REFUND_STATUS_CANCELED);
        refundRepository.save(refund);

        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("refund", buildRefundResponse(refund));
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> approveRefundRequest(int refundId, int sellerId, String sellerResponse) {
        Refund refund = getRefundOrThrow(refundId);
        OrderItem orderItem = refund.getOrderItem();
        if (orderItem.getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 요청을 처리할 수 없습니다.");
        }
        if (!isRefundStatusRequested(refund.getStatus())) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        // 교환 기능 제거 - 환불만 처리
        refund.setSellerResponse(sellerResponse);
        refund.setStatus(REFUND_STATUS_COMPLETED);
        if (orderItem.getProduct() != null) {
            Integer qty = Optional.ofNullable(orderItem.getQuantity()).orElse(0);
            Integer stock = Optional.ofNullable(orderItem.getProduct().getStock()).orElse(0);
            orderItem.getProduct().setStock(stock + qty);
            productDAO.save(orderItem.getProduct());
        }
        orderItem.setStatus("REFUNDED"); // 환불 완료로 변경
        orderItemRepository.save(orderItem);
        refundRepository.save(refund);

        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("refund", buildRefundResponse(refund));
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional
    public Map<String, Object> rejectRefundRequest(int refundId, int sellerId, String sellerResponse) {
        Refund refund = getRefundOrThrow(refundId);
        OrderItem orderItem = refund.getOrderItem();
        if (orderItem.getSellerId() != sellerId) {
            throw new IllegalArgumentException("해당 요청을 처리할 수 없습니다.");
        }
        if (!isRefundStatusRequested(refund.getStatus())) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        refund.setStatus(REFUND_STATUS_REJECTED);
        refund.setSellerResponse(sellerResponse);
        // previousStatus는 이미 DB 형식(짧은 코드)이므로 그대로 사용
        orderItem.setStatus(refund.getPreviousStatus());
        orderItemRepository.save(orderItem);
        refundRepository.save(refund);

        updateOrderStatusBasedOnItems(orderItem.getOrder());
        Order refreshedOrder = orderRepository.findById(orderItem.getOrder().getOrderId())
                .orElseThrow(() -> new IllegalStateException("주문을 찾을 수 없습니다."));

        Map<String, Object> response = new HashMap<>();
        response.put("refund", buildRefundResponse(refund));
        response.put("order", buildOrderResponse(refreshedOrder, null));
        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRefundsByUser(int userId) {
        return refundRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::buildRefundResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRefundsBySeller(int sellerId) {
        return refundRepository.findBySellerId(sellerId).stream()
                .map(this::buildRefundResponse)
                .collect(Collectors.toList());
    }

    private void validateRefundRequestStatus(String refundType, String currentStatus) {
        String type = refundType != null ? refundType.toUpperCase() : "REFUND";
        switch (type) {
            case "CANCEL" -> {
                if (!"PAID".equals(currentStatus)) {
                    throw new IllegalStateException("결제 완료 상태에서만 취소 요청이 가능합니다.");
                }
            }
            case "REFUND" -> {
                if (!"DELIVERING".equals(currentStatus) && !"DELIVERED".equals(currentStatus)) {
                    throw new IllegalStateException("배송중 또는 배송완료 상태에서만 요청할 수 있습니다.");
                }
            }
            default -> throw new IllegalArgumentException("지원하지 않는 요청 유형입니다.");
        }
    }

    private Refund getRefundOrThrow(int refundId) {
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("환불 요청을 찾을 수 없습니다."));
    }

    private Map<String, Object> buildRefundResponse(Refund refund) {
        Map<String, Object> map = new HashMap<>();
        map.put("refundId", refund.getRefundId());
        // DB에는 "REF"/"EXC"로 저장되지만, API 응답은 "REFUND"/"EXCHANGE"로 변환
        map.put("refundType", denormalizeRefundType(refund.getRefundType()));
        map.put("status", normalizeRefundStatus(refund.getStatus()));
        map.put("reason", refund.getReason());
        map.put("reasonDetail", refund.getReasonDetail());
        map.put("refundAmount", refund.getRefundAmount());
        map.put("previousStatus", refund.getPreviousStatus());
        map.put("sellerResponse", refund.getSellerResponse());
        map.put("createdAt", refund.getCreatedAt());
        map.put("updatedAt", refund.getUpdatedAt());

        OrderItem orderItem = refund.getOrderItem();
        if (orderItem != null) {
            map.put("orderItemId", orderItem.getOrderItemId());
            map.put("orderItemStatus", orderItem.getStatus());
            map.put("productName", orderItem.getPostName());
            map.put("productId", orderItem.getProductId());
            map.put("quantity", orderItem.getQuantity());
            map.put("price", orderItem.getPrice());
            map.put("color", orderItem.getColor());
            map.put("productSize", orderItem.getProductSize());
            String productImage = resolveMainImageUrl(orderItem.getPostId());
            map.put("productImage", productImage != null ? productImage : "");
            Order order = orderItem.getOrder();
            if (order != null) {
                map.put("orderId", order.getOrderId());
                map.put("orderNumber", order.getOrderNumber());
                map.put("buyerName", order.getRecipientName());
                map.put("buyerPhone", order.getRecipientPhone());
            }
        }
        return map;
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
        map.put("status", convertOrderItemStatusFromDb(orderItem.getStatus()));
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

        map.put("status", convertOrderItemStatusFromDb(orderItem.getStatus()));
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

        // 모든 orderItem의 status 확인
        boolean allCompleted = items.stream()
                .allMatch(item -> {
                    String status = Optional.ofNullable(item.getStatus()).orElse("").toUpperCase();
                    // 구매확정(DELIVERED), 환불완료(REFUNDED), 취소완료(CANCELED/CANCELLED)인 경우 완료로 간주
                    return "DELIVERED".equals(status) || 
                           "REFUNDED".equals(status) || 
                           "CANCELED".equals(status) || 
                           "CANCELLED".equals(status);
                });

        // 처리 중인 상태: 환불요청중, 배송중, 결제완료 등
        boolean anyProcessing = items.stream()
                .anyMatch(item -> {
                    String status = Optional.ofNullable(item.getStatus()).orElse("").toUpperCase();
                    return "PAID".equals(status) || 
                           "DELIVERING".equals(status) || 
                           "REFUND_REQUESTED".equals(status);
                });

        String newStatus;
        if (allCompleted) {
            // 모든 orderItem이 완료 상태면 처리완료
            newStatus = "COMPLETED";
        } else if (anyProcessing) {
            // 하나라도 처리 중이면 처리중
            newStatus = "PROCESSING";
        } else {
            // 기본값
            newStatus = "PAID";
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

    private boolean isRefundStatusRequested(String status) {
        return REFUND_STATUS_REQUESTED.equals(normalizeRefundStatus(status));
    }

    private String normalizeRefundStatus(String status) {
        if (status == null) {
            return null;
        }
        String upper = status.trim().toUpperCase(Locale.ROOT);
        switch (upper) {
            case "REQUESTED":
            case REFUND_STATUS_REQUESTED:
                return REFUND_STATUS_REQUESTED;
            case "APPROVED":
            case REFUND_STATUS_APPROVED:
                return REFUND_STATUS_APPROVED;
            case "COMPLETED":
            case REFUND_STATUS_COMPLETED:
                return REFUND_STATUS_COMPLETED;
            case "REJECTED":
            case REFUND_STATUS_REJECTED:
                return REFUND_STATUS_REJECTED;
            case "CANCELED":
            case "CANCELLED":
            case REFUND_STATUS_CANCELED:
                return REFUND_STATUS_CANCELED;
            default:
                return upper;
        }
    }
    
    /**
     * REFUNDTYPE을 DB 저장용 짧은 코드로 변환
     * "REFUND" -> "REF", "EXCHANGE" -> "EXC"
     */
    private String normalizeRefundType(String refundType) {
        if (refundType == null) {
            return REFUND_TYPE_REF; // 기본값: 환불
        }
        String upper = refundType.trim().toUpperCase(Locale.ROOT);
        switch (upper) {
            case "REFUND":
                return REFUND_TYPE_REF;
            case "EXCHANGE":
                return REFUND_TYPE_EXC;
            case REFUND_TYPE_REF:
            case REFUND_TYPE_EXC:
                return upper; // 이미 변환된 경우 그대로 반환
            default:
                return REFUND_TYPE_REF; // 기본값: 환불
        }
    }
    
    /**
     * DB의 짧은 코드를 API 응답용 긴 이름으로 변환
     * "REF" -> "REFUND", "EXC" -> "EXCHANGE"
     */
    private String denormalizeRefundType(String refundType) {
        if (refundType == null) {
            return "REFUND"; // 기본값
        }
        String upper = refundType.trim().toUpperCase(Locale.ROOT);
        switch (upper) {
            case REFUND_TYPE_REF:
                return "REFUND";
            case REFUND_TYPE_EXC:
                return "EXCHANGE";
            case "REFUND":
            case "EXCHANGE":
                return upper; // 이미 긴 이름인 경우 그대로 반환
            default:
                return "REFUND"; // 기본값
        }
    }
    
    // ORDERITEM STATUS 변환: String → String (DB 저장용: 짧은 코드)
    private String convertOrderItemStatusToDb(String status) {
        if (status == null) return ORDERITEM_STATUS_CONFIRMED; // 기본값: CONFIRMED
        String upper = status.trim().toUpperCase(Locale.ROOT);
        switch (upper) {
            case "CONFIRMED":
            case "PAID":
            case "DELIVERED":
                return ORDERITEM_STATUS_CONFIRMED;  // con
            case "CANCELLED":
            case "CANCELED":
                return ORDERITEM_STATUS_CANCELLED;  // can
            case "REFUNDED":
            case "REFUND_REQUESTED":
                return ORDERITEM_STATUS_REFUNDED;   // ref
            case "con":
            case "can":
            case "ref":
                return status.toLowerCase(); // 이미 짧은 코드인 경우 그대로 반환
            default:
                return ORDERITEM_STATUS_CONFIRMED; // 기본값: CONFIRMED
        }
    }
    
    // ORDERITEM STATUS 변환: String → String (API 응답용: 긴 이름)
    private String convertOrderItemStatusFromDb(String status) {
        if (status == null) return "CONFIRMED";
        String lower = status.trim().toLowerCase(Locale.ROOT);
        switch (lower) {
            case ORDERITEM_STATUS_CONFIRMED:
                return "CONFIRMED";
            case ORDERITEM_STATUS_CANCELLED:
                return "CANCELLED";
            case ORDERITEM_STATUS_REFUNDED:
                return "REFUNDED";
            case "confirmed":
            case "cancelled":
            case "refunded":
                return status.toUpperCase(); // 이미 긴 이름인 경우 그대로 반환
            default:
                return "CONFIRMED"; // 기본값
        }
    }
}


