package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Test;

public interface TestRepository extends JpaRepository<Test, Integer> {
}

