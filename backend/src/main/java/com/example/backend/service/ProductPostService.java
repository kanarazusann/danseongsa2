package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.CategoryDAO;
import com.example.backend.entity.Category;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dao.UserDAO;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.User;
import com.example.backend.service.ProductImageService;
import com.example.backend.service.ImageService;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ProductPostService {
    
    // STATUS 변환 상수
    private static final int STATUS_SELLING = 1;
    private static final int STATUS_SOLD_OUT = 0;
    
    // GENDER 변환 상수
    private static final String GENDER_MEN = "M";
    private static final String GENDER_WOMEN = "W";
    private static final String GENDER_UNISEX = "U";
    
    // SEASON 변환 상수
    private static final String SEASON_SPRING = "SPR";
    private static final String SEASON_SUMMER = "SMR";
    private static final String SEASON_FALL = "FAL";
    private static final String SEASON_WINTER = "WTR";
    private static final String SEASON_ALL = "ALL";
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductImageService productImageService;
    
    @Autowired
    private ProductImageDAO productImageDAO;
    
    @Autowired
    private ProductDAO productDAO;
    
    @Autowired
    private ImageService imageService;

    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private CategoryDAO categoryDAO;
    
    // STATUS 변환: String → Integer (DB 저장용)
    private Integer convertStatusToDb(String status) {
        if (status == null) return STATUS_SELLING;
        String upper = status.trim().toUpperCase();
        if ("SELLING".equals(upper) || "1".equals(status)) {
            return STATUS_SELLING;
        } else if ("SOLD_OUT".equals(upper) || "SOLDOUT".equals(upper) || "0".equals(status)) {
            return STATUS_SOLD_OUT;
        }
        return STATUS_SELLING; // 기본값
    }
    
    // STATUS 변환: Integer → String (API 응답용)
    private String convertStatusFromDb(Integer status) {
        if (status == null) return "SELLING";
        return status == STATUS_SELLING ? "SELLING" : "SOLD_OUT";
    }
    
    // GENDER 변환: String → String (DB 저장용)
    private String convertGenderToDb(String gender) {
        if (gender == null) return null;
        String upper = gender.trim().toUpperCase();
        if ("MEN".equals(upper) || "M".equals(upper)) {
            return GENDER_MEN;
        } else if ("WOMEN".equals(upper) || "W".equals(upper)) {
            return GENDER_WOMEN;
        } else if ("UNISEX".equals(upper) || "U".equals(upper)) {
            return GENDER_UNISEX;
        }
        return upper.length() == 1 ? upper : null; // 이미 짧은 코드면 그대로
    }
    
    // GENDER 변환: String → String (API 응답용)
    private String convertGenderFromDb(String gender) {
        if (gender == null) return null;
        String upper = gender.trim().toUpperCase();
        if (GENDER_MEN.equals(upper)) {
            return "MEN";
        } else if (GENDER_WOMEN.equals(upper)) {
            return "WOMEN";
        } else if (GENDER_UNISEX.equals(upper)) {
            return "UNISEX";
        }
        return gender; // 이미 긴 형태면 그대로
    }
    
    // SEASON 변환: String → String (DB 저장용)
    private String convertSeasonToDb(String season) {
        if (season == null) return null;
        String upper = season.trim().toUpperCase();
        if ("SPRING".equals(upper)) {
            return SEASON_SPRING;
        } else if ("SUMMER".equals(upper)) {
            return SEASON_SUMMER;
        } else if ("FALL".equals(upper)) {
            return SEASON_FALL;
        } else if ("WINTER".equals(upper)) {
            return SEASON_WINTER;
        } else if ("ALL_SEASON".equals(upper) || "ALLSEASON".equals(upper)) {
            return SEASON_ALL;
        }
        // 이미 짧은 코드면 그대로 (SPR, SMR, FAL, WTR, ALL)
        if (upper.length() <= 3) {
            return upper;
        }
        return null;
    }
    
    // SEASON 변환: String → String (API 응답용)
    private String convertSeasonFromDb(String season) {
        if (season == null) return null;
        String upper = season.trim().toUpperCase();
        if (SEASON_SPRING.equals(upper)) {
            return "SPRING";
        } else if (SEASON_SUMMER.equals(upper)) {
            return "SUMMER";
        } else if (SEASON_FALL.equals(upper)) {
            return "FALL";
        } else if (SEASON_WINTER.equals(upper)) {
            return "WINTER";
        } else if (SEASON_ALL.equals(upper)) {
            return "ALL_SEASON";
        }
        return season; // 이미 긴 형태면 그대로
    }
    
    // 게시물 생성
    @Transactional
    public ProductPost createProductPost(ProductPostDTO dto, int sellerId, List<MultipartFile> imageFiles, List<MultipartFile> descriptionImages) throws IOException {
        User seller = getUserById(sellerId);
        System.out.println("판매자 정보 - userId: " + seller.getUserId() + ", brand: " + seller.getBrand());
        ProductPost productPost = createProductPostEntity(dto, seller);
        System.out.println("ProductPost brand 설정: " + productPost.getBrand());
        ProductPost savedPost = productPostDAO.save(productPost);
        
        productService.createProducts(savedPost, dto.getProducts());
        productImageService.saveProductImages(savedPost, imageFiles, "GALLERY");
        productImageService.saveProductImages(savedPost, descriptionImages, "DESCRIPTION");
        
        return savedPost;
    }
    
    // 판매자 정보 조회
    private User getUserById(int sellerId) {
        return userDAO.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("판매자를 찾을 수 없습니다. sellerId: " + sellerId));
    }

    // 게시물의 갤러리 이미지 목록만 추출
    private List<ProductImage> getGalleryImages(int postId) {
        return productImageDAO.findByPostId(postId).stream()
                .filter(img -> img.getImageType() == null || "GALLERY".equalsIgnoreCase(img.getImageType()))
                .collect(Collectors.toList());
    }

    // 상품 상세 정보 조회 + 조회수 증가
    @Transactional
    public Map<String, Object> getProductDetail(int postId, Integer userId) {
        ProductPost post = productPostDAO.findById(postId);
        if (post == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }

        // 조회수 증가
        post.setViewCount((post.getViewCount() != null ? post.getViewCount() : 0) + 1);
        productPostDAO.save(post);

        List<ProductImage> allImages = productImageDAO.findByPostId(postId);
        List<Map<String, Object>> galleryImages = allImages.stream()
                .filter(img -> img.getImageType() == null || "GALLERY".equalsIgnoreCase(img.getImageType()))
                .map(img -> {
                    Map<String, Object> imageMap = new HashMap<>();
                    imageMap.put("imageId", img.getImageId());
                    imageMap.put("imageUrl", img.getImageUrl());
                    imageMap.put("isMain", img.getIsMain());
                    return imageMap;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> descriptionImages = allImages.stream()
                .filter(img -> "DESCRIPTION".equalsIgnoreCase(img.getImageType()))
                .map(img -> {
                    Map<String, Object> imageMap = new HashMap<>();
                    imageMap.put("imageId", img.getImageId());
                    imageMap.put("imageUrl", img.getImageUrl());
                    return imageMap;
                })
                .collect(Collectors.toList());

        List<Product> products = productDAO.findByPostId(postId);

        Integer minPrice = null;
        Integer minDiscountPrice = null;
        Integer minEffectivePrice = null;
        for (Product product : products) {
            Integer price = product.getPrice();
            Integer discountPrice = product.getDiscountPrice();
            Integer effectivePrice = discountPrice != null ? discountPrice : price;
            if (effectivePrice == null) {
                continue;
            }
            if (minEffectivePrice == null || effectivePrice < minEffectivePrice) {
                minEffectivePrice = effectivePrice;
                minPrice = price;
                minDiscountPrice = discountPrice;
            }
        }

        List<Map<String, Object>> productOptions = products.stream()
                .map(product -> {
                    Map<String, Object> option = new HashMap<>();
                    option.put("productId", product.getProductId());
                    option.put("color", product.getColor());
                    option.put("productSize", product.getProductSize());
                    option.put("price", product.getPrice());
                    option.put("discountPrice", product.getDiscountPrice());
                    option.put("stock", product.getStock());
                    // STATUS 변환: Integer → String (API 응답용)
                    String productStatus = convertProductStatusFromDb(product.getStatus());
                    option.put("status", productStatus);
                    return option;
                })
                .collect(Collectors.toList());

        List<String> colors = products.stream()
                .map(Product::getColor)
                .filter(color -> color != null && !color.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        String mainImageUrl = galleryImages.stream()
                .filter(img -> {
                    Object isMain = img.get("isMain");
                    return isMain != null && ((Integer) isMain) == 1;
                })
                .map(img -> (String) img.get("imageUrl"))
                .findFirst()
                .orElseGet(() -> galleryImages.stream()
                        .map(img -> (String) img.get("imageUrl"))
                        .findFirst()
                        .orElse(null));

        Map<String, Object> detail = new HashMap<>();
        detail.put("postId", post.getPostId());
        detail.put("postName", post.getPostName());
        detail.put("brand", post.getBrand());
        // Category에서 categoryName 가져오기
        String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
        detail.put("categoryId", post.getCategoryId());
        detail.put("categoryName", categoryName);
        detail.put("material", post.getMaterial());
        detail.put("gender", convertGenderFromDb(post.getGender()));
        detail.put("season", convertSeasonFromDb(post.getSeason()));
        detail.put("description", post.getDescription());
        detail.put("status", convertStatusFromDb(post.getStatus()));
        detail.put("viewCount", post.getViewCount());
        detail.put("wishCount", post.getWishCount());
        detail.put("sellerId", post.getSellerId());
        detail.put("minPrice", minPrice);
        detail.put("minDiscountPrice", minDiscountPrice);
        detail.put("galleryImages", galleryImages);
        detail.put("descriptionImages", descriptionImages);
        detail.put("mainImageUrl", mainImageUrl);
        detail.put("products", productOptions);
        detail.put("colors", colors);
        detail.put("isWished", userId != null && wishlistService.isWished(userId, postId));

        return detail;
    }
    
    // ProductPost 엔티티 생성
    private ProductPost createProductPostEntity(ProductPostDTO dto, User seller) {
        ProductPost productPost = new ProductPost();
        productPost.setSeller(seller);
        // categoryName으로 Category 테이블에서 조회하여 categoryId 설정
        if (dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            Category category = categoryDAO.findByCategoryName(dto.getCategoryName().trim());
            if (category == null) {
                throw new IllegalArgumentException("카테고리를 찾을 수 없습니다. categoryName: " + dto.getCategoryName());
            }
            productPost.setCategory(category);
        } else {
            throw new IllegalArgumentException("카테고리명은 필수입니다.");
        }
        productPost.setPostName(dto.getPostName());
        productPost.setDescription(dto.getDescription());
        // 판매자의 brand 정보 사용
        String brand = seller.getBrand() != null && !seller.getBrand().trim().isEmpty() 
                ? seller.getBrand() 
                : "";
        System.out.println("판매자 brand 값: " + brand);
        productPost.setBrand(brand);
        productPost.setMaterial(dto.getMaterial());
        productPost.setGender(convertGenderToDb(dto.getGender()));
        productPost.setSeason(convertSeasonToDb(dto.getSeason()));
        productPost.setStatus(convertStatusToDb(dto.getStatus()));
        productPost.setViewCount(0);
        return productPost;
    }
    
    // 게시물 수정
    @Transactional
    public ProductPost updateProductPost(int postId, ProductPostDTO dto, List<Integer> keptImageIds, List<MultipartFile> newImageFiles, Integer mainImageIndex, List<Integer> keptDescriptionImageIds, List<MultipartFile> newDescriptionImages) throws IOException {
        ProductPost post = productPostDAO.findById(postId);
        if (post == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }
        
        // 게시물 정보 업데이트
        post.setPostName(dto.getPostName());
        post.setDescription(dto.getDescription());
        // categoryName으로 Category 테이블에서 조회하여 categoryId 설정
        if (dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            Category category = categoryDAO.findByCategoryName(dto.getCategoryName().trim());
            if (category == null) {
                throw new IllegalArgumentException("카테고리를 찾을 수 없습니다. categoryName: " + dto.getCategoryName());
            }
            post.setCategory(category);
        }
        post.setMaterial(dto.getMaterial());
        post.setGender(convertGenderToDb(dto.getGender()));
        post.setSeason(convertSeasonToDb(dto.getSeason()));
        post.setStatus(convertStatusToDb(dto.getStatus()));
        ProductPost updatedPost = productPostDAO.save(post);
        
        // 상품 옵션 업데이트
        updateProducts(updatedPost, dto.getProducts());
        
        // 이미지 업데이트
        updateProductImages(updatedPost, keptImageIds, newImageFiles, mainImageIndex, keptDescriptionImageIds, newDescriptionImages);
        
        return updatedPost;
    }
    
    // 상품 옵션 업데이트
    private void updateProducts(ProductPost post, List<ProductDTO> productDTOs) {
        List<Product> existingProducts = productDAO.findByPostId(post.getPostId());
        
        // 기존 상품 ID 목록
        List<Integer> existingProductIds = existingProducts.stream()
                .map(Product::getProductId)
                .collect(Collectors.toList());
        
        // 업데이트할 상품 ID 목록 (null이 아닌 것만)
        List<Integer> updateProductIds = productDTOs.stream()
                .map(ProductDTO::getProductId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        
        // 삭제할 상품 (기존에 있지만 업데이트 목록에 없는 것)
        List<Product> productsToDelete = existingProducts.stream()
                .filter(product -> !updateProductIds.contains(product.getProductId()))
                .collect(Collectors.toList());
        productDAO.deleteAll(productsToDelete);
        
        // 업데이트 또는 생성
        for (ProductDTO productDto : productDTOs) {
            if (productDto.getProductId() != null && existingProductIds.contains(productDto.getProductId())) {
                // 기존 상품 업데이트
                Product existingProduct = productDAO.findById(productDto.getProductId());
                if (existingProduct != null) {
                    existingProduct.setColor(productDto.getColor());
                    existingProduct.setProductSize(productDto.getProductSize());
                    existingProduct.setPrice(productDto.getPrice());
                    existingProduct.setDiscountPrice(productDto.getDiscountPrice());
                    existingProduct.setStock(productDto.getStock() != null ? productDto.getStock() : 0);
                    // STATUS 변환: String → Integer (DB 저장용)
                    existingProduct.setStatus(convertProductStatusToDb(productDto.getStatus() != null ? productDto.getStatus() : "SELLING"));
                    productDAO.save(existingProduct);
                }
            } else {
                // 새 상품 생성
                Product newProduct = new Product();
                newProduct.setProductPost(post);
                newProduct.setColor(productDto.getColor());
                newProduct.setProductSize(productDto.getProductSize());
                newProduct.setPrice(productDto.getPrice());
                newProduct.setDiscountPrice(productDto.getDiscountPrice());
                newProduct.setStock(productDto.getStock() != null ? productDto.getStock() : 0);
                // STATUS 변환: String → Integer (DB 저장용)
                newProduct.setStatus(convertProductStatusToDb(productDto.getStatus() != null ? productDto.getStatus() : "SELLING"));
                productDAO.save(newProduct);
            }
        }
    }
    
    // 이미지 업데이트
    private void updateProductImages(ProductPost post, List<Integer> keptImageIds, List<MultipartFile> newImageFiles, Integer mainImageIndex, List<Integer> keptDescriptionImageIds, List<MultipartFile> newDescriptionImages) throws IOException {
        List<ProductImage> allImages = productImageDAO.findByPostId(post.getPostId());
        
        // GALLERY 이미지 처리
        List<ProductImage> galleryImages = allImages.stream()
                .filter(img -> img.getImageType() == null || "GALLERY".equalsIgnoreCase(img.getImageType()))
                .collect(Collectors.toList());
        
        // 유지할 이미지 ID 목록
        List<Integer> keptIds = keptImageIds != null ? keptImageIds : new ArrayList<>();
        
        // 삭제할 GALLERY 이미지 (유지 목록에 없는 것)
        List<ProductImage> imagesToDelete = galleryImages.stream()
                .filter(img -> !keptIds.contains(img.getImageId()))
                .collect(Collectors.toList());
        productImageDAO.deleteAll(imagesToDelete);
        
        // 유지할 이미지의 isMain 초기화 (나중에 mainImageIndex에 따라 설정)
        List<ProductImage> keptImages = galleryImages.stream()
                .filter(img -> keptIds.contains(img.getImageId()))
                .collect(Collectors.toList());
        
        for (ProductImage img : keptImages) {
            img.setIsMain(0);
            productImageDAO.save(img);
        }
        
        // 새로운 이미지 파일 저장
        List<ProductImage> newImages = new ArrayList<>();
        if (newImageFiles != null && !newImageFiles.isEmpty()) {
            for (MultipartFile file : newImageFiles) {
                if (!file.isEmpty()) {
                    ProductImage productImage = createProductImageEntity(post, file, "GALLERY");
                    productImage.setIsMain(0);
                    newImages.add(productImage);
                }
            }
            if (!newImages.isEmpty()) {
                productImageDAO.saveAll(newImages);
            }
        }
        
        // 전체 이미지 목록 (유지된 이미지 + 새로 추가된 이미지)
        // 유지된 이미지는 keptIds의 순서대로 정렬, 새로 추가된 이미지는 뒤에 추가
        List<ProductImage> allKeptImages = new ArrayList<>();
        
        // 유지된 이미지를 keptIds 순서대로 추가
        for (Integer keptId : keptIds) {
            keptImages.stream()
                    .filter(img -> img.getImageId() == keptId)
                    .findFirst()
                    .ifPresent(allKeptImages::add);
        }
        
        // 새로 추가된 이미지는 뒤에 추가
        allKeptImages.addAll(newImages);
        
        // mainImageIndex에 따라 isMain 설정
        if (mainImageIndex != null && mainImageIndex >= 0 && mainImageIndex < allKeptImages.size()) {
            for (int i = 0; i < allKeptImages.size(); i++) {
                ProductImage image = allKeptImages.get(i);
                image.setIsMain(i == mainImageIndex ? 1 : 0);
                productImageDAO.save(image);
            }
        } else if (!allKeptImages.isEmpty()) {
            // mainImageIndex가 없으면 첫 번째 이미지를 isMain = 1로 설정
            ProductImage firstImage = allKeptImages.get(0);
            firstImage.setIsMain(1);
            productImageDAO.save(firstImage);
        }
        
        // DESCRIPTION 이미지 처리
        List<ProductImage> descriptionImages = allImages.stream()
                .filter(img -> "DESCRIPTION".equalsIgnoreCase(img.getImageType()))
                .collect(Collectors.toList());
        
        List<Integer> keptDescIds = keptDescriptionImageIds != null ? keptDescriptionImageIds : new ArrayList<>();
        
        // 삭제할 DESCRIPTION 이미지
        List<ProductImage> descImagesToDelete = descriptionImages.stream()
                .filter(img -> !keptDescIds.contains(img.getImageId()))
                .collect(Collectors.toList());
        productImageDAO.deleteAll(descImagesToDelete);
        
        // 새로운 DESCRIPTION 이미지 저장
        if (newDescriptionImages != null && !newDescriptionImages.isEmpty()) {
            productImageService.saveProductImages(post, newDescriptionImages, "DESCRIPTION");
        }
    }
    
    // ProductImage 엔티티 생성
    private ProductImage createProductImageEntity(ProductPost post, MultipartFile file, String imageType) throws IOException {
        String imageUrl = imageService.saveImageFile(file);
        
        ProductImage productImage = new ProductImage();
        productImage.setProductPost(post);
        productImage.setImageUrl(imageUrl);
        productImage.setImageType(imageType);
        productImage.setIsMain(0);
        
        return productImage;
    }
    
    // 게시물 ID로 게시물 조회
    public ProductPost findById(int postId) {
        return productPostDAO.findById(postId);
    }
    
    // 모든 게시물 목록 조회
    public List<ProductPost> findAll() {
        return productPostDAO.findAll();
    }
    
    // 판매자 ID로 게시물 목록 조회
    public List<ProductPost> findBySellerId(int sellerId) {
        return productPostDAO.findBySellerId(sellerId);
    }
    
    // 브랜드로 게시물 목록 조회 (이미지 및 최소 가격 포함)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findByBrand(String brand) {
        List<ProductPost> productPosts = productPostDAO.findByBrand(brand);
        
        return productPosts.stream().map(post -> {
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
            item.put("categoryId", post.getCategoryId());
            item.put("categoryName", categoryName);
            item.put("status", convertStatusFromDb(post.getStatus()));
            item.put("viewCount", post.getViewCount() != null ? post.getViewCount() : 0);
            item.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);
            // Timestamp를 String으로 변환
            item.put("createdAt", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = getGalleryImages(post.getPostId());
            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                    .findFirst()
                    .orElse(images.get(0)); // isMain=1인 이미지가 없으면 첫 번째 GALLERY 이미지 사용
                mainImageUrl = mainImage != null ? mainImage.getImageUrl() : null;
            }
            item.put("imageUrl", mainImageUrl);
            
            // 최소 가격 조회 (할인가 우선, 없으면 원가)
            Integer minPrice = null;
            Integer minDiscountPrice = null;
            List<Product> products = productDAO.findByPostId(post.getPostId());
            if (products != null && !products.isEmpty()) {
                Product minPriceProduct = products.stream()
                    .min((p1, p2) -> {
                        Integer price1 = (p1.getDiscountPrice() != null) ? p1.getDiscountPrice() : p1.getPrice();
                        Integer price2 = (p2.getDiscountPrice() != null) ? p2.getDiscountPrice() : p2.getPrice();
                        if (price1 == null && price2 == null) return 0;
                        if (price1 == null) return 1;
                        if (price2 == null) return -1;
                        return price1.compareTo(price2);
                    })
                    .orElse(null);
                
                if (minPriceProduct != null) {
                    minPrice = minPriceProduct.getPrice();
                    minDiscountPrice = minPriceProduct.getDiscountPrice();
                }
            }
            item.put("price", minPrice);
            item.put("discountPrice", minDiscountPrice);
            
            return item;
        }).collect(Collectors.toList());
    }
    
    // 인기순 조회 (찜수 기준, 이미지 및 최소 가격 포함) - WISHCOUNT 컬럼 사용
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAllOrderByPopularity() {
        List<ProductPost> productPosts = productPostDAO.findAllOrderByPopularity();
        
        // 디버깅: 찜수 확인
        System.out.println("=== 인기순 조회 결과 (총 " + productPosts.size() + "개) ===");
        for (ProductPost post : productPosts) {
            System.out.println("POSTID: " + post.getPostId() + ", POSTNAME: " + post.getPostName() + ", WISHCOUNT: " + post.getWishCount());
        }
        
        return productPosts.stream().map(post -> {
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
            item.put("categoryId", post.getCategoryId());
            item.put("categoryName", categoryName);
            item.put("status", convertStatusFromDb(post.getStatus()));
            item.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = getGalleryImages(post.getPostId());
            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                    .findFirst()
                    .orElse(images.get(0));
                mainImageUrl = mainImage.getImageUrl();
                System.out.println("POSTID " + post.getPostId() + " 이미지 URL: " + mainImageUrl);
            } else {
                System.out.println("POSTID " + post.getPostId() + " 이미지 없음");
            }
            item.put("imageUrl", mainImageUrl);
            
            // 최소 가격 조회 (할인가 우선, 없으면 원가)
            Integer minPrice = null;
            Integer minDiscountPrice = null;
            List<Product> products = productDAO.findByPostId(post.getPostId());
            if (products != null && !products.isEmpty()) {
                Product minPriceProduct = products.stream()
                    .min((p1, p2) -> {
                        Integer price1 = (p1.getDiscountPrice() != null) ? p1.getDiscountPrice() : p1.getPrice();
                        Integer price2 = (p2.getDiscountPrice() != null) ? p2.getDiscountPrice() : p2.getPrice();
                        return price1.compareTo(price2);
                    })
                    .orElse(null);
                
                if (minPriceProduct != null) {
                    minPrice = minPriceProduct.getPrice();
                    minDiscountPrice = minPriceProduct.getDiscountPrice();
                }
            }
            item.put("price", minPrice);
            item.put("discountPrice", minDiscountPrice);
            
            return item;
        }).collect(Collectors.toList());
    }
    
    // 최신순 조회 (생성일 기준, 이미지 및 최소 가격 포함)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findAllOrderByCreatedAtDesc() {
        List<ProductPost> productPosts = productPostDAO.findAllOrderByCreatedAtDesc();
        
        return productPosts.stream().map(post -> {
            Map<String, Object> item = new HashMap<>();
            item.put("postId", post.getPostId());
            item.put("postName", post.getPostName());
            item.put("brand", post.getBrand());
            String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
            item.put("categoryId", post.getCategoryId());
            item.put("categoryName", categoryName);
            item.put("status", convertStatusFromDb(post.getStatus()));
            
            // 대표 이미지 조회 (ISMAIN = 1인 이미지, 없으면 첫 번째 이미지)
            String mainImageUrl = null;
            List<ProductImage> images = getGalleryImages(post.getPostId());
            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                    .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                    .findFirst()
                    .orElse(images.get(0));
                mainImageUrl = mainImage.getImageUrl();
            }
            item.put("imageUrl", mainImageUrl);
            
            // 최소 가격 조회 (할인가 우선, 없으면 원가)
            Integer minPrice = null;
            Integer minDiscountPrice = null;
            List<Product> products = productDAO.findByPostId(post.getPostId());
            if (products != null && !products.isEmpty()) {
                Product minPriceProduct = products.stream()
                    .min((p1, p2) -> {
                        Integer price1 = (p1.getDiscountPrice() != null) ? p1.getDiscountPrice() : p1.getPrice();
                        Integer price2 = (p2.getDiscountPrice() != null) ? p2.getDiscountPrice() : p2.getPrice();
                        return price1.compareTo(price2);
                    })
                    .orElse(null);
                
                if (minPriceProduct != null) {
                    minPrice = minPriceProduct.getPrice();
                    minDiscountPrice = minPriceProduct.getDiscountPrice();
                }
            }
            item.put("price", minPrice);
            item.put("discountPrice", minDiscountPrice);
            
            return item;
        }).collect(Collectors.toList());
    }
    
    // 필터링된 게시물 목록 조회 (카테고리, 성별, 검색어, 컬러, 사이즈, 계절 필터링 지원)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> findWithFilters(String category, String gender, String search, 
                                                      List<String> colors, List<String> sizes, List<String> seasons) {
        // 모든 게시물 조회 (SELLING 상태만, DB에는 1로 저장됨)
        List<ProductPost> allPosts = productPostDAO.findByStatus(STATUS_SELLING);
        
        return allPosts.stream()
            .filter(post -> {
                // 카테고리 필터링
                if (category != null && !category.isEmpty()) {
                    String postCategoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
                    if (postCategoryName == null || !postCategoryName.startsWith(category)) {
                        return false;
                    }
                }
                
                // 성별 필터링
                if (gender != null && !gender.isEmpty() && !gender.equals("전체")) {
                    String dbGender = convertGenderToDb(gender);
                    String postGender = post.getGender();
                    if (postGender == null || (!postGender.equals(dbGender) && !GENDER_UNISEX.equals(postGender))) {
                        return false;
                    }
                }
                
                // 검색어 필터링 (게시물명 및 브랜드명)
                if (search != null && !search.isEmpty()) {
                    // % 제거하고 검색어 정리
                    String searchTerm = search.replace("%", "").trim();
                    if (searchTerm.isEmpty()) {
                        // %만 입력된 경우는 모든 결과 반환
                    } else {
                        String searchTermLower = searchTerm.toLowerCase();
                        String postNameLower = post.getPostName() != null ? post.getPostName().toLowerCase() : "";
                        // BRAND 컬럼에서 값 가져오기 (null 체크 및 공백 제거)
                        String brandValue = post.getBrand();
                        String brandLower = (brandValue != null && !brandValue.trim().isEmpty()) 
                            ? brandValue.trim().toLowerCase() : "";
                        
                        // 게시물명 또는 브랜드명에 검색어가 포함되어 있는지 확인 (LIKE 검색)
                        boolean matchesPostName = !postNameLower.isEmpty() && postNameLower.contains(searchTermLower);
                        boolean matchesBrand = !brandLower.isEmpty() && brandLower.contains(searchTermLower);
                        
                        // 디버깅: 브랜드 검색 확인
                        if (searchTermLower.length() > 0) {
                            System.out.println("[검색 디버깅] 검색어: '" + searchTermLower + "', 게시물명: '" + postNameLower + "', 브랜드: '" + brandLower + "', 게시물명매칭: " + matchesPostName + ", 브랜드매칭: " + matchesBrand);
                        }
                        
                        if (!matchesPostName && !matchesBrand) {
                            return false;
                        }
                    }
                }
                
                // 계절 필터링
                if (seasons != null && !seasons.isEmpty()) {
                    List<String> dbSeasons = seasons.stream()
                        .map(this::convertSeasonToDb)
                        .collect(Collectors.toList());
                    if (post.getSeason() == null || !dbSeasons.contains(post.getSeason())) {
                        return false;
                    }
                }
                
                return true;
            })
            .map(post -> {
                Map<String, Object> item = new HashMap<>();
                item.put("postId", post.getPostId());
                item.put("postName", post.getPostName());
                item.put("brand", post.getBrand());
                String categoryName = post.getCategory() != null ? post.getCategory().getCategoryName() : null;
            item.put("categoryId", post.getCategoryId());
            item.put("categoryName", categoryName);
                item.put("status", convertStatusFromDb(post.getStatus()));
                item.put("gender", convertGenderFromDb(post.getGender()));
                item.put("season", convertSeasonFromDb(post.getSeason()));
                item.put("wishCount", post.getWishCount() != null ? post.getWishCount() : 0);
                // Timestamp를 String으로 변환하여 JSON 직렬화 문제 해결
                item.put("createdAt", post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
                
                // 대표 이미지 조회
                String mainImageUrl = null;
                List<ProductImage> images = getGalleryImages(post.getPostId());
                if (images != null && !images.isEmpty()) {
                    ProductImage mainImage = images.stream()
                        .filter(img -> img.getIsMain() != null && img.getIsMain() == 1)
                        .findFirst()
                        .orElse(images.get(0));
                    mainImageUrl = mainImage.getImageUrl();
                }
                item.put("imageUrl", mainImageUrl);
                
                // 최소 가격 조회 (할인가 우선, 없으면 원가)
                Integer minPrice = null;
                Integer minDiscountPrice = null;
                List<Product> products = productDAO.findByPostId(post.getPostId());
                
                // 컬러/사이즈 필터링
                if (products != null && !products.isEmpty()) {
                    List<Product> filteredProducts = products;
                    
                    // 컬러 필터링
                    if (colors != null && !colors.isEmpty()) {
                        filteredProducts = filteredProducts.stream()
                            .filter(p -> p.getColor() != null && colors.contains(p.getColor().toLowerCase()))
                            .collect(Collectors.toList());
                    }
                    
                    // 사이즈 필터링
                    if (sizes != null && !sizes.isEmpty()) {
                        filteredProducts = filteredProducts.stream()
                            .filter(p -> p.getProductSize() != null && sizes.contains(p.getProductSize()))
                            .collect(Collectors.toList());
                    }
                    
                    // 필터링된 상품 중 최소 가격 찾기
                    if (!filteredProducts.isEmpty()) {
                        Product minPriceProduct = filteredProducts.stream()
                            .min((p1, p2) -> {
                                Integer price1 = (p1.getDiscountPrice() != null) ? p1.getDiscountPrice() : p1.getPrice();
                                Integer price2 = (p2.getDiscountPrice() != null) ? p2.getDiscountPrice() : p2.getPrice();
                                return price1.compareTo(price2);
                            })
                            .orElse(null);
                        
                        if (minPriceProduct != null) {
                            minPrice = minPriceProduct.getPrice();
                            minDiscountPrice = minPriceProduct.getDiscountPrice();
                        }
                    }
                }
                
                item.put("price", minPrice);
                item.put("discountPrice", minDiscountPrice);
                
                return item;
            })
            .filter(item -> {
                // 컬러/사이즈 필터링 후 가격이 있는 상품만 반환
                return item.get("price") != null;
            })
            .collect(Collectors.toList());
    }
    
    // 게시물 삭제
    @Transactional
    public void deleteProductPost(int postId) {
        ProductPost post = productPostDAO.findById(postId);
        if (post == null) {
            throw new IllegalArgumentException("게시물을 찾을 수 없습니다.");
        }
        
        // 관련 Product 삭제
        List<Product> products = productDAO.findByPostId(postId);
        if (products != null && !products.isEmpty()) {
            productDAO.deleteAll(products);
        }
        
        // 관련 ProductImage 삭제
        List<ProductImage> images = productImageDAO.findByPostId(postId);
        if (images != null && !images.isEmpty()) {
            productImageDAO.deleteAll(images);
        }
        
        // ProductPost 삭제
        productPostDAO.deleteById(postId);
    }
    
    // Product STATUS 변환: String → Integer (DB 저장용)
    private Integer convertProductStatusToDb(String status) {
        if (status == null) return 1; // 기본값: SELLING
        String upper = status.trim().toUpperCase(Locale.ROOT);
        if ("SELLING".equals(upper) || "1".equals(status)) {
            return 1;
        } else if ("SOLD_OUT".equals(upper) || "SOLDOUT".equals(upper) || "0".equals(status)) {
            return 0;
        }
        return 1; // 기본값: SELLING
    }
    
    // Product STATUS 변환: Integer → String (API 응답용)
    private String convertProductStatusFromDb(Integer status) {
        if (status == null) return "SELLING";
        return status == 1 ? "SELLING" : "SOLD_OUT";
    }
}

