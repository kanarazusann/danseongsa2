package com.example.backend.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Test;
import com.example.backend.repository.TestRepository;

@Repository
public class TestDAO {

	@Autowired
	private TestRepository testRepository;

	public Test findById(int id) {
		return testRepository.findById(id).orElse(null);
	}
}

