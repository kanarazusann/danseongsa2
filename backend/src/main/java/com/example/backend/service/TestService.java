package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dao.TestDAO;
import com.example.backend.dto.TestDTO;
import com.example.backend.entity.Test;

@Service
public class TestService {

	@Autowired
	private TestDAO testDAO;
	
	public Test findById(int id) {
		return testDAO.findById(id);
	}
}

