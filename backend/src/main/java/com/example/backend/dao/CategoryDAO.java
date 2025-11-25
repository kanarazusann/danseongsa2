package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import java.util.List;
import java.util.Optional;

@Repository
public class CategoryDAO {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public Category save(Category category) {
        return categoryRepository.save(category);
    }
    
    public Category findById(int categoryId) {
        return categoryRepository.findById(categoryId).orElse(null);
    }
    
    public Category findByCategoryName(String categoryName) {
        return categoryRepository.findByCategoryName(categoryName).orElse(null);
    }
    
    public List<Category> findByMainCategory(String mainCategory) {
        return categoryRepository.findByMainCategory(mainCategory);
    }
    
    public List<Category> findByMidCategory(String midCategory) {
        return categoryRepository.findByMidCategory(midCategory);
    }
    
    public List<Category> findByMainCategoryAndMidCategory(String mainCategory, String midCategory) {
        return categoryRepository.findByMainCategoryAndMidCategory(mainCategory, midCategory);
    }
    
    public Category findByMainCategoryAndMidCategoryAndSubCategory(String mainCategory, String midCategory, String subCategory) {
        return categoryRepository.findByMainCategoryAndMidCategoryAndSubCategory(mainCategory, midCategory, subCategory).orElse(null);
    }
    
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
}

