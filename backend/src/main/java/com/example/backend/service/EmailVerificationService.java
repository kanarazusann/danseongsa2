package com.example.backend.service;

import com.example.backend.dto.EmailVerificationResponse;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeUtility;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();
    private Map<String, VerificationInfo> verificationStorage;

    @Value("${mail.verification.subject:[단성사] 이메일 인증 코드}")
    private String subject;

    @Value("${mail.verification.from:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${mail.verification.expire-minutes:5}")
    private long expireMinutes;

    public EmailVerificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    private void initStorage() {
        this.verificationStorage = new ConcurrentHashMap<>();
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    false,
                    StandardCharsets.UTF_8.name()
            );

            String toAddress = sanitizedEmail;
            helper.setTo(toAddress);
            String from = fromAddress != null ? fromAddress.trim() : "";
            if (StringUtils.hasText(from)) {
                helper.setFrom(from);
            }
            helper.setSubject(encodeSubject(resolveSubject()));
            helper.setText(buildEmailBody(code), false);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new IllegalStateException("이메일 전송 중 오류가 발생했습니다.", e);
        }
    }

    private String resolveSubject() {
        if (StringUtils.hasText(subject)) {
            return subject;
        }
        return "[단성사] 이메일 인증 코드";
    }

    private String encodeSubject(String value) {
        String text = StringUtils.hasText(value) ? value : "[단성사] 이메일 인증 코드";
        try {
            return MimeUtility.encodeText(text, StandardCharsets.UTF_8.name(), "B");
        } catch (UnsupportedEncodingException e) {
            return text;
        }
    }

    private String buildEmailBody(String code) {
        return """
                단성사 이메일 인증 요청이 접수되었습니다.

                아래 인증번호를 5분 이내에 입력해주세요.

                인증번호: %s

                본 메일은 발신전용입니다. 문의는 고객센터를 이용해주세요.
                """.formatted(code);
    }

    private String generateCode() {
        int number = secureRandom.nextInt(900_000) + 100_000;
        return String.valueOf(number);
    }

    private record VerificationInfo(String email, String code, long expiresAt) {}
}

