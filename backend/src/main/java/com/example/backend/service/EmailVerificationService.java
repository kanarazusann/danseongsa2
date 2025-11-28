package com.example.backend.service;

import com.example.backend.dto.EmailVerificationResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private Map<String, VerificationInfo> verificationStorage;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${mail.verification.subject:[단성사] 이메일 인증 코드}")
    private String subject;

    @Value("${mail.verification.from:kanarazusann@gmail.com}")
    private String fromAddress;

    @Value("${mail.verification.expire-minutes:5}")
    private long expireMinutes;

    public EmailVerificationService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    private void initStorage() {
        this.verificationStorage = new ConcurrentHashMap<>();
        System.out.println("=== EmailVerificationService 초기화 ===");
        System.out.println("발신자 이메일 주소: " + fromAddress);
        System.out.println("Brevo API 키 (처음 4자): " + (brevoApiKey != null && brevoApiKey.length() > 4 ? brevoApiKey.substring(0, 4) + "..." : "null"));
        System.out.println("================================");
    }

    public EmailVerificationResponse sendVerificationCode(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }

        String verificationId = UUID.randomUUID().toString();
        String code = generateCode();
        long expiresAt = Instant.now().plusSeconds(expireMinutes * 60).toEpochMilli();

        sendEmail(email, code);
        verificationStorage.put(verificationId, new VerificationInfo(email, code, expiresAt));

        EmailVerificationResponse response = new EmailVerificationResponse();
        response.setVerificationId(verificationId);
        response.setExpiresAt(expiresAt);

        return response;
    }

    public boolean verifyCode(String email, String verificationId, String code) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(verificationId) || !StringUtils.hasText(code)) {
            throw new IllegalArgumentException("이메일, 인증번호, 인증 ID는 필수 값입니다.");
        }

        VerificationInfo info = verificationStorage.get(verificationId);
        if (info == null) {
            return false;
        }

        if (!info.email.equalsIgnoreCase(email.trim())) {
            return false;
        }

        if (Instant.now().toEpochMilli() > info.expiresAt) {
            verificationStorage.remove(verificationId);
            return false;
        }

        if (!info.code.equals(code.trim())) {
            return false;
        }

        verificationStorage.remove(verificationId);
        return true;
    }

    private void sendEmail(String email, String code) {
        String sanitizedEmail = email != null ? email.trim() : "";
        if (!StringUtils.hasText(sanitizedEmail)) {
            throw new IllegalArgumentException("수신 이메일 정보가 비어 있습니다.");
        }

        if (!StringUtils.hasText(brevoApiKey)) {
            throw new IllegalStateException("Brevo API 키가 설정되지 않았습니다.");
        }

        // 디버깅: API 키 확인 (처음 몇 글자만 로그)
        String apiKeyPreview = brevoApiKey != null && brevoApiKey.length() > 4 
            ? brevoApiKey.substring(0, 4) + "..." 
            : "null";
        System.out.println("Brevo API 키 사용 중: " + apiKeyPreview);

        try {
            // Brevo API 요청 본문 구성
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, String> sender = new HashMap<>();
            sender.put("email", fromAddress != null ? fromAddress.trim() : "kanarazusann@gmail.com");
            sender.put("name", "단성사");
            requestBody.put("sender", sender);

            // to는 배열 형식
            Map<String, String> toRecipient = new HashMap<>();
            toRecipient.put("email", sanitizedEmail);
            requestBody.put("to", java.util.Arrays.asList(toRecipient));

            requestBody.put("subject", resolveSubject());
            requestBody.put("htmlContent", buildEmailBodyHtml(code));
            requestBody.put("textContent", buildEmailBody(code));

            // JSON 변환
            String jsonBody = objectMapper.writeValueAsString(requestBody);

            // HTTP 요청 생성
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey.trim()) // 공백 제거
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();
            
            System.out.println("=== Brevo 이메일 전송 시도 ===");
            System.out.println("발신자: " + (fromAddress != null ? fromAddress.trim() : "kanarazusann@gmail.com"));
            System.out.println("수신자: " + sanitizedEmail);
            System.out.println("Brevo API 요청 URL: https://api.brevo.com/v3/smtp/email");
            System.out.println("Brevo API 요청 본문: " + jsonBody);

            // 요청 전송
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("Brevo API 응답 상태: " + response.statusCode());
            System.out.println("Brevo API 응답 본문: " + response.body());
            System.out.println("=== Brevo 이메일 전송 완료 ===");

            // 응답 확인
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(
                    String.format("Brevo API 오류: %d - %s", response.statusCode(), response.body())
                );
            }
        } catch (Exception e) {
            throw new IllegalStateException("이메일 전송 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private String resolveSubject() {
        if (StringUtils.hasText(subject)) {
            return subject;
        }
        return "[단성사] 이메일 인증 코드";
    }

    private String buildEmailBody(String code) {
        return """
                단성사 이메일 인증 요청이 접수되었습니다.

                아래 인증번호를 5분 이내에 입력해주세요.

                인증번호: %s

                본 메일은 발신전용입니다. 문의는 고객센터를 이용해주세요.
                """.formatted(code);
    }

    private String buildEmailBodyHtml(String code) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>단성사 이메일 인증 요청</h2>
                    <p>이메일 인증 요청이 접수되었습니다.</p>
                    <p>아래 인증번호를 <strong>5분 이내</strong>에 입력해주세요.</p>
                    <div style="background-color: #f0f0f0; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold;">
                        %s
                    </div>
                    <p style="color: #666; font-size: 12px;">본 메일은 발신전용입니다. 문의는 고객센터를 이용해주세요.</p>
                </body>
                </html>
                """.formatted(code);
    }

    private String generateCode() {
        int number = secureRandom.nextInt(900_000) + 100_000;
        return String.valueOf(number);
    }

    private record VerificationInfo(String email, String code, long expiresAt) {}
}

