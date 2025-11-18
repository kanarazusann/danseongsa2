package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.dao.ProductPostDAO;
import com.example.backend.dao.ProductDAO;
import com.example.backend.dao.ProductImageDAO;
import com.example.backend.dto.ProductPostDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.entity.ProductPost;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import java.util.List;
import java.util.ArrayList;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProductPostService {
    
    @Autowired
    private ProductPostDAO productPostDAO;
    
    @Autowired
    private ProductDAO productDAO;
    
    @Autowired
    private ProductImageDAO productImageDAO;
    
    @Autowired
    private UserRepository userRepository;
    
    // 이미지 저장 경로 (실제로는 application.properties에서 설정)
    private static final String UPLOAD_DIR = "uploads/images/";
    
    @Transactional
    public ProductPost createProductPost(ProductPostDTO dto, int sellerId, List<MultipartFile> imageFiles) {
        // 1. 판매자(User) 조회
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("판매자를 찾을 수 없습니다. sellerId: " + sellerId));
        
        // 2. 게시물 생성
        ProductPost productPost = new ProductPost();
        productPost.setSeller(seller);  // seller 객체 설정 (sellerId는 자동으로 설정됨)
        productPost.setCategoryName(dto.getCategoryName());
        productPost.setPostName(dto.getPostName());
        productPost.setDescription(dto.getDescription());
        productPost.setBrand(dto.getBrand());
        productPost.setMaterial(dto.getMaterial());
        productPost.setGender(dto.getGender());
        productPost.setSeason(dto.getSeason());
        productPost.setStatus(dto.getStatus());
        productPost.setViewCount(0);
        
        ProductPost savedPost = productPostDAO.save(productPost);
        int postId = savedPost.getPostId();
        
        // 2. 상품 옵션들 생성
        if (dto.getProducts() != null && !dto.getProducts().isEmpty()) {
            List<Product> products = new ArrayList<>();
            for (ProductDTO productDto : dto.getProducts()) {
                Product product = new Product();
                product.setProductPost(savedPost);  // productPost 객체 설정 (postId는 자동으로 설정됨)
                product.setColor(productDto.getColor());
                product.setProductSize(productDto.getProductSize());
                product.setPrice(productDto.getPrice());
                product.setDiscountPrice(productDto.getDiscountPrice());
                product.setStock(productDto.getStock() != null ? productDto.getStock() : 0);
                product.setStatus(productDto.getStatus() != null ? productDto.getStatus() : "SELLING");
                products.add(product);
            }
            productDAO.saveAll(products);
        }
        
        // 3. 이미지들 저장
        if (imageFiles != null && !imageFiles.isEmpty()) {
            List<ProductImage> productImages = new ArrayList<>();
            for (int i = 0; i < imageFiles.size(); i++) {
                MultipartFile file = imageFiles.get(i);
                if (!file.isEmpty()) {
                    try {
                        // 파일 저장
                        String fileName = saveImageFile(file);
                        
                        // ProductImage 엔티티 생성
                        ProductImage productImage = new ProductImage();
                        productImage.setProductPost(savedPost);  // productPost 객체 설정 (postId는 자동으로 설정됨)
                        productImage.setImageUrl(fileName);
                        productImage.setIsMain(i == 0 ? 1 : 0); // 첫 번째 이미지를 대표 이미지로
                        productImages.add(productImage);
                    } catch (IOException e) {
                        throw new RuntimeException("이미지 저장 중 오류 발생: " + e.getMessage());
                    }
                }
            }
            if (!productImages.isEmpty()) {
                productImageDAO.saveAll(productImages);
            }
        }
        
        return savedPost;
    }
    
    // 게시물 조회 (단일)
    public ProductPost findById(int postId) {
        return productPostDAO.findById(postId);
    }
    
    // 게시물 목록 조회 (전체)
    public List<ProductPost> findAll() {
        return productPostDAO.findAll();
    }
    
    // 판매자별 게시물 목록 조회
    public List<ProductPost> findBySellerId(int sellerId) {
        return productPostDAO.findBySellerId(sellerId);
    }
    
    // 이미지 파일 저장 메서드
    private String saveImageFile(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        // 고유한 파일명 생성
        String originalFileName = file.getOriginalFilename();
        String extension = originalFileName != null && originalFileName.contains(".") 
            ? originalFileName.substring(originalFileName.lastIndexOf(".")) 
            : "";
        String fileName = UUID.randomUUID().toString() + extension;
        
        // 파일 저장
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.write(filePath, file.getBytes());
        
        // 실제로는 전체 URL을 반환해야 함 (예: "/images/" + fileName)
        return "/images/" + fileName;
    }
}

