package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entity.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    // 카테고리명으로 조회
    Optional<Category> findByCategoryName(String categoryName);
    
    // 대분류로 조회
    List<Category> findByMainCategory(String mainCategory);
    
    // 중분류로 조회
    List<Category> findByMidCategory(String midCategory);
    
    // 대분류와 중분류로 조회
    List<Category> findByMainCategoryAndMidCategory(String mainCategory, String midCategory);
    
    // 대분류, 중분류, 소분류로 조회
    Optional<Category> findByMainCategoryAndMidCategoryAndSubCategory(String mainCategory, String midCategory, String subCategory);
}

