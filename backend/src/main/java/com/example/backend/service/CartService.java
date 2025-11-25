package com.example.backend.service;

import com.example.backend.dao.CartDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.entity.Cart;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartDAO cartDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private ProductDAO productDAO;

    @Autowired
    private ProductImageDAO productImageDAO;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCartItems(int userId) {
        validateUser(userId);
        return cartDAO.findByUserId(userId).stream()
                .map(this::buildCartItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> addCartItem(int userId, int productId, int quantity) {
        User user = validateUser(userId);
        Product product = validateProduct(productId);
        validateQuantity(quantity);

        Optional<Cart> existing = cartDAO.findByUserIdAndProductId(userId, productId);
        Cart cart = existing.orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setProduct(product);
            return newCart;
        });

        int stock = product.getStock() != null ? product.getStock() : 0;
        if (stock <= 0) {
            throw new IllegalStateException("재고가 부족합니다.");
        }

        int baseQuantity = existing.map(Cart::getQuantity).orElse(0);
        int targetQuantity = Math.min(baseQuantity + quantity, stock);
        cart.setQuantity(targetQuantity);

        Cart saved = cartDAO.save(cart);
        return buildCartItemResponse(saved);
    }

    @Transactional
    public Map<String, Object> updateCartItem(int userId, int cartId, int quantity) {
        validateQuantity(quantity);
        Cart cart = cartDAO.findByCartIdAndUserId(cartId, userId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 상품을 찾을 수 없습니다."));

        Product product = cart.getProduct();
        int stock = product.getStock() != null ? product.getStock() : quantity;
        if (stock <= 0) {
            throw new IllegalStateException("재고가 부족합니다.");
        }

        cart.setQuantity(Math.min(quantity, stock));
        Cart saved = cartDAO.save(cart);
        return buildCartItemResponse(saved);
    }

    @Transactional
    public void removeCartItem(int userId, int cartId) {
        Cart cart = cartDAO.findByCartIdAndUserId(cartId, userId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 상품을 찾을 수 없습니다."));
        cartDAO.delete(cart);
    }

    @Transactional
    public void removeCartItems(int userId, List<Integer> cartIds) {
        if (cartIds == null || cartIds.isEmpty()) {
            return;
        }
        List<Cart> carts = cartDAO.findByUserIdAndCartIds(userId, cartIds);
        if (carts.isEmpty()) {
            throw new IllegalArgumentException("삭제할 장바구니 상품을 찾을 수 없습니다.");
        }
        cartDAO.deleteAll(carts);
    }

    private User validateUser(int userId) {
        return userDAO.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private Product validateProduct(int productId) {
        Product product = productDAO.findById(productId);
        if (product == null) {
            throw new IllegalArgumentException("상품을 찾을 수 없습니다.");
        }
        // Product STATUS는 Integer (1=SELLING, 0=SOLD_OUT)
        if (product.getStatus() == null || product.getStatus() != 1) {
            throw new IllegalStateException("판매 중이 아닌 상품입니다.");
        }
        return product;
    }

    private void validateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("수량은 1개 이상이어야 합니다.");
        }
    }

    private Map<String, Object> buildCartItemResponse(Cart cart) {
        Map<String, Object> item = new HashMap<>();
        Product product = cart.getProduct();
        ProductPost post = product.getProductPost();

        item.put("cartId", cart.getCartId());
        item.put("productId", product.getProductId());
        item.put("postId", post.getPostId());
        item.put("postName", post.getPostName());
        item.put("brand", post.getBrand());
        item.put("color", product.getColor());
        item.put("productSize", product.getProductSize());
        item.put("price", product.getPrice());
        item.put("discountPrice", product.getDiscountPrice());
        item.put("stock", product.getStock());
        item.put("quantity", cart.getQuantity());
        // Product STATUS 변환: Integer → String (API 응답용)
        String productStatus = product.getStatus() != null && product.getStatus() == 1 ? "SELLING" : "SOLD_OUT";
        item.put("status", productStatus);
        item.put("postStatus", post.getStatus());
        String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
        item.put("categoryId", post.getCategoryId());
        item.put("categoryName", categoryName);
        item.put("imageUrl", resolveMainImageUrl(post.getPostId()));
        item.put("createdAt", cart.getCreatedAt() != null ? cart.getCreatedAt().toString() : null);
        return item;
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

