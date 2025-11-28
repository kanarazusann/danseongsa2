package com.example.backend.service;

import com.example.backend.dao.UserDAO;
import com.example.backend.dao.CartDAO;
import com.example.backend.dao.WishlistDAO;
import com.example.backend.dao.ReviewDAO;
import com.example.backend.dao.ReviewImageDAO;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.RefundRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartDAO cartDAO;

    @Autowired
    private WishlistDAO wishlistDAO;

    @Autowired
    private ReviewDAO reviewDAO;

    @Autowired
    private ReviewImageDAO reviewImageDAO;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProductPostDAO productPostDAO;

    @Autowired
    private ProductDAO productDAO;

    @Autowired
    private ProductImageDAO productImageDAO;

    // 회원가입 처리
    @Transactional
    public User registerUser(UserDTO request) {
        User user = new User();
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setZipcode(request.getZipcode());
        user.setAddress(request.getAddress());
        user.setDetailAddress(request.getDetailAddress());

        int isSeller = request.getIsSeller() != null ? request.getIsSeller() : 0;
        user.setIsSeller(isSeller);

        if (isSeller == 1) {
            user.setBrand(request.getBrand());
            // String을 Integer로 변환 (사업자등록번호는 숫자만 저장)
            if (request.getBusinessNumber() != null && !request.getBusinessNumber().trim().isEmpty()) {
                try {
                    String bnStr = request.getBusinessNumber().trim().replaceAll("[^0-9]", "");
                    if (!bnStr.isEmpty()) {
                        user.setBusinessNumber(Integer.parseInt(bnStr));
                    } else {
                        user.setBusinessNumber(null);
                    }
                } catch (NumberFormatException e) {
                    user.setBusinessNumber(null);
                }
            } else {
                user.setBusinessNumber(null);
            }
        } else {
            user.setBrand(null);
            user.setBusinessNumber(null);
        }

        return userDAO.save(user);
    }

    // 이메일과 비밀번호로 유저 조회
    public User findByEmailAndPassword(String email, String password) {
        User user = userDAO.findByEmail(email != null ? email.trim() : "")
                .orElse(null);
        
        if (user == null) {
            return null;
        }
        
        // BCrypt로 암호화된 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }
        
        return user;
    }

    // User 엔티티를 Map 형태로 변환
    public Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> item = new HashMap<>();
        item.put("userId", user.getUserId());
        item.put("email", user.getEmail());
        item.put("password", user.getPassword()); // 비밀번호 확인을 위해 세션에 포함
        item.put("name", user.getName());
        item.put("phone", user.getPhone());
        item.put("isSeller", user.getIsSeller());
        item.put("brand", user.getBrand());
        item.put("businessNumber", user.getBusinessNumber() != null ? String.valueOf(user.getBusinessNumber()) : null);
        item.put("zipcode", user.getZipcode());
        item.put("address", user.getAddress());
        item.put("detailAddress", user.getDetailAddress());
        return item;
    }

    // 유저 ID로 유저 정보 조회
    public UserDTO getUserById(int userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return convertToDTO(user);
    }

    // 모든 유저 목록 조회
    public List<UserDTO> getAllUsers() {
        List<User> users = userDAO.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 유저 존재 여부 확인
    public boolean userExists(int userId) {
        return userDAO.findById(userId).isPresent();
    }

    // 이메일 존재 여부 확인
    public boolean emailExists(String email) {
        return userDAO.existsByEmail(email != null ? email.trim() : "");
    }

    // User 엔티티를 UserDTO로 변환
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setPhone(user.getPhone());
        dto.setIsSeller(user.getIsSeller());
        dto.setBusinessNumber(user.getBusinessNumber() != null ? String.valueOf(user.getBusinessNumber()) : null);
        dto.setBrand(user.getBrand());
        dto.setZipcode(user.getZipcode());
        dto.setAddress(user.getAddress());
        dto.setDetailAddress(user.getDetailAddress());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
    public String findByNameAndPhone(String name, String phone) {
        Optional<User> user = userDAO.findByNameAndPhone(name, phone);
        return user.map(User::getEmail).orElse(null);
    }
    
    // 이름과 이메일로 유저 확인 (비밀번호 찾기용)
    public User findByNameAndEmail(String name, String email) {
        Optional<User> user = userDAO.findByNameAndEmail(name, email);
        return user.orElse(null);
    }
    
    // 비밀번호 재설정
    @Transactional
    public boolean resetPassword(String email, String newPassword) {
        Optional<User> userOpt = userDAO.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // 기존 비밀번호와 동일한지 확인 (BCrypt로 검증)
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                throw new IllegalArgumentException("기존 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.");
            }
            
            // 새 비밀번호 암호화
            user.setPassword(passwordEncoder.encode(newPassword));
            userDAO.save(user);
            return true;
        }
        return false;
    }

    // 회원정보 수정
    @Transactional
    public User updateUser(int userId, UserDTO request) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 수정 가능한 필드 업데이트
        if (request.getName() != null) user.setName(request.getName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getZipcode() != null) user.setZipcode(request.getZipcode().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        if (request.getDetailAddress() != null) user.setDetailAddress(request.getDetailAddress().trim());
        if (request.getBrand() != null) user.setBrand(request.getBrand().trim());
        if (request.getBusinessNumber() != null) {
            // String을 Integer로 변환 (사업자등록번호는 숫자만 저장)
            try {
                String bnStr = request.getBusinessNumber().trim().replaceAll("[^0-9]", "");
                if (!bnStr.isEmpty()) {
                    user.setBusinessNumber(Integer.parseInt(bnStr));
                } else {
                    user.setBusinessNumber(null);
                }
            } catch (NumberFormatException e) {
                user.setBusinessNumber(null);
            }
        }

        return userDAO.save(user);
    }

    // 비밀번호 변경
    @Transactional
    public User changePassword(int userId, String newPassword) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        
        // 새 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(newPassword));
        return userDAO.save(user);
    }

    // 회원 탈퇴 (사용자 삭제)
    @Transactional
    public void deleteUser(int userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        
        // 관련 데이터 삭제 (외래키 제약조건 해결)
        // 삭제 순서: 자식 테이블부터 부모 테이블 순서로 삭제
        
        // 1. 리뷰 이미지 삭제 (리뷰 삭제 전에)
        List<com.example.backend.entity.Review> userReviews = reviewDAO.findByUserId(userId);
        if (userReviews != null && !userReviews.isEmpty()) {
            for (com.example.backend.entity.Review review : userReviews) {
                List<com.example.backend.entity.ReviewImage> reviewImages = reviewImageDAO.findByReviewId(review.getReviewId());
                if (reviewImages != null && !reviewImages.isEmpty()) {
                    for (com.example.backend.entity.ReviewImage reviewImage : reviewImages) {
                        reviewImageDAO.deleteById(reviewImage.getReviewImageId());
                    }
                }
            }
        }
        
        // 2. 리뷰 삭제 (user로 연결된 것들)
        if (userReviews != null && !userReviews.isEmpty()) {
            for (com.example.backend.entity.Review review : userReviews) {
                reviewDAO.deleteById(review.getReviewId());
            }
        }
        
        // 3. 환불/교환 삭제 (user로 연결)
        List<com.example.backend.entity.Refund> refunds = refundRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        if (refunds != null && !refunds.isEmpty()) {
            refundRepository.deleteAll(refunds);
        }
        
        // 4. 주문 관련 삭제
        List<com.example.backend.entity.Order> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        if (orders != null && !orders.isEmpty()) {
            for (com.example.backend.entity.Order order : orders) {
                // 4-1. 결제 삭제 (order로 연결)
                List<com.example.backend.entity.Payment> payments = paymentRepository.findByOrder_OrderId(order.getOrderId());
                if (payments != null && !payments.isEmpty()) {
                    paymentRepository.deleteAll(payments);
                }
                
                // 4-2. 주문상세 삭제 (order로 연결)
                List<com.example.backend.entity.OrderItem> orderItems = orderItemRepository.findByOrder_OrderId(order.getOrderId());
                if (orderItems != null && !orderItems.isEmpty()) {
                    orderItemRepository.deleteAll(orderItems);
                }
            }
            // 4-3. 주문 삭제
            orderRepository.deleteAll(orders);
        }
        
        // 5. 판매자로 등록한 상품게시물 관련 삭제 (seller로 연결)
        List<com.example.backend.entity.ProductPost> productPosts = productPostDAO.findBySellerId(userId);
        if (productPosts != null && !productPosts.isEmpty()) {
            for (com.example.backend.entity.ProductPost productPost : productPosts) {
                int postId = productPost.getPostId();
                
                // 5-1. 게시물에 대한 리뷰 삭제 (productPost로 연결)
                List<com.example.backend.entity.Review> postReviews = reviewDAO.findByPostId(postId);
                if (postReviews != null && !postReviews.isEmpty()) {
                    for (com.example.backend.entity.Review review : postReviews) {
                        // 리뷰 이미지 삭제
                        List<com.example.backend.entity.ReviewImage> reviewImages = reviewImageDAO.findByReviewId(review.getReviewId());
                        if (reviewImages != null && !reviewImages.isEmpty()) {
                            for (com.example.backend.entity.ReviewImage reviewImage : reviewImages) {
                                reviewImageDAO.deleteById(reviewImage.getReviewImageId());
                            }
                        }
                        reviewDAO.deleteById(review.getReviewId());
                    }
                }
                
                // 5-2. 게시물에 대한 찜 목록 삭제 (productPost로 연결)
                // 다른 유저가 찜한 목록도 모두 삭제해야 함
                wishlistDAO.deleteByPostId(postId);
                
                // 5-3. 게시물에 대한 주문상세 삭제 (productPost로 연결)
                // ProductPost를 삭제하기 전에 해당 게시물에 대한 OrderItem을 먼저 삭제
                List<com.example.backend.entity.OrderItem> postOrderItems = orderItemRepository.findByPostId(postId);
                if (postOrderItems != null && !postOrderItems.isEmpty()) {
                    // 각 OrderItem에 연결된 Refund와 Review도 삭제
                    for (com.example.backend.entity.OrderItem orderItem : postOrderItems) {
                        // Refund 삭제
                        List<com.example.backend.entity.Refund> orderItemRefunds = refundRepository.findByOrderItem_OrderItemId(orderItem.getOrderItemId());
                        if (orderItemRefunds != null && !orderItemRefunds.isEmpty()) {
                            refundRepository.deleteAll(orderItemRefunds);
                        }
                        // Review 삭제
                        com.example.backend.entity.Review orderItemReview = reviewDAO.findByOrderItemId(orderItem.getOrderItemId());
                        if (orderItemReview != null) {
                            // ReviewImage 삭제
                            List<com.example.backend.entity.ReviewImage> reviewImages = reviewImageDAO.findByReviewId(orderItemReview.getReviewId());
                            if (reviewImages != null && !reviewImages.isEmpty()) {
                                for (com.example.backend.entity.ReviewImage reviewImage : reviewImages) {
                                    reviewImageDAO.deleteById(reviewImage.getReviewImageId());
                                }
                            }
                            reviewDAO.deleteById(orderItemReview.getReviewId());
                        }
                    }
                    orderItemRepository.deleteAll(postOrderItems);
                }
                
                // 5-4. 상품 이미지 삭제 (productPost로 연결)
                List<com.example.backend.entity.ProductImage> productImages = productImageDAO.findByPostId(postId);
                if (productImages != null && !productImages.isEmpty()) {
                    productImageDAO.deleteAll(productImages);
                }
                
                // 5-5. 상품 삭제 (productPost로 연결)
                List<com.example.backend.entity.Product> products = productDAO.findByPostId(postId);
                if (products != null && !products.isEmpty()) {
                    productDAO.deleteAll(products);
                }
                
                // 5-6. 상품게시물 삭제
                productPostDAO.delete(productPost);
            }
        }
        
        // 6. 장바구니 삭제 (user로 연결)
        List<com.example.backend.entity.Cart> carts = cartDAO.findByUserId(userId);
        if (carts != null && !carts.isEmpty()) {
            cartDAO.deleteAll(carts);
        }
        
        // 7. 찜 목록 삭제 (user로 연결)
        List<com.example.backend.entity.Wishlist> wishlists = wishlistDAO.findByUserIdOrderByCreatedAtDesc(userId);
        if (wishlists != null && !wishlists.isEmpty()) {
            for (com.example.backend.entity.Wishlist wishlist : wishlists) {
                wishlistDAO.delete(wishlist);
            }
        }
        
        // 8. 사용자 삭제
        userDAO.delete(user);
    }
}
