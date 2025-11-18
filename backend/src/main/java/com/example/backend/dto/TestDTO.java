package com.example.backend.dto;

import com.example.backend.entity.Test;

import lombok.Data;

@Data
public class TestDTO {

	private int id;
	private String name;

	public Test toEntity() {
		return new Test(id, name);
	}
}

