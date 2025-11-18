package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_table")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Test {

	@Id
	private int id;

	@Column(name = "name")
	private String name;
}

