package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.IOException;

@SpringBootApplicationd
public class BackendApplication {

	public static void main(String[] args) {
		// Oracle Wallet TNS_ADMIN 설정
		setTnsAdmin();
		
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Oracle Wallet을 사용하기 위한 TNS_ADMIN 환경변수 설정
	 * wallet 파일들은 src/main/resources/wallet 폴더에 있어야 합니다
	 */
	private static void setTnsAdmin() {
		try {
			ClassPathResource walletResource = new ClassPathResource("wallet");
			File walletDir = walletResource.getFile();
			
			if (walletDir.exists() && walletDir.isDirectory()) {
				String walletPath = walletDir.getAbsolutePath();
				System.setProperty("oracle.net.tns_admin", walletPath);
				System.setProperty("oracle.net.wallet_location", "(SOURCE=(METHOD=FILE)(METHOD_DATA=(DIRECTORY=" + walletPath + ")))");
				System.out.println("Oracle Wallet TNS_ADMIN 설정 완료: " + walletPath);
			} else {
				System.err.println("경고: wallet 폴더를 찾을 수 없습니다. 경로: " + walletDir.getAbsolutePath());
			}
		} catch (IOException e) {
			System.err.println("경고: wallet 폴더 설정 중 오류 발생: " + e.getMessage());
		}
	}

}
