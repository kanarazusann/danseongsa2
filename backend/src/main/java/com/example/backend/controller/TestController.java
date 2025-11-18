package com.example.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.TestDTO;
import com.example.backend.entity.Test;
import com.example.backend.service.TestService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TestController {

	@Autowired
	private TestService testService;

	@GetMapping("/test")
	public Map<String, Object> getTest() {
		Test test = testService.findById(2);
		
		Map<String, Object> map = new HashMap<String, Object>();

		if (test != null) {
			map.put("rt", "OK");
			map.put("item", test);
		} else {
			map.put("rt", "FAIL");
			map.put("message", "데이터를 찾을 수 없습니다.");
		}

		return map;
	}
}

