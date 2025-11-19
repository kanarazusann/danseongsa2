package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.backend.entity.ProductPost;
import java.util.List;

public interface ProductPostRepository extends JpaRepository<ProductPost, Integer> {
    
    // 판매자 ID로 게시물 목록 조회
    List<ProductPost> findBySellerId(int sellerId);
    
    // 상태로 게시물 목록 조회
    List<ProductPost> findByStatus(String status);
    
    // 인기순 조회 (찜수 기준) - WISHCOUNT 컬럼 사용
    // 찜수가 많은 순서대로 정렬 (DESC: 내림차순)
    @Query(value = "SELECT pp.* FROM PRODUCTPOST pp " +
           "WHERE pp.STATUS = 'SELLING' " +
           "ORDER BY NVL(pp.WISHCOUNT, 0) DESC, pp.CREATEDAT DESC", 
           nativeQuery = true)
    List<ProductPost> findAllOrderByPopularity();
    
    // 최신순 조회 (생성일 기준)
    @Query(value = "SELECT pp.* FROM PRODUCTPOST pp " +
           "WHERE pp.STATUS = 'SELLING' " +
           "ORDER BY pp.CREATEDAT DESC", 
           nativeQuery = true)
    List<ProductPost> findAllOrderByCreatedAtDesc();
}

