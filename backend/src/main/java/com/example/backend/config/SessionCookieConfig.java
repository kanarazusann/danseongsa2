package com.example.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class SessionCookieConfig {

    @Bean
    public FilterRegistrationBean<Filter> sessionCookieFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SessionCookieFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(1);
        return registration;
    }

    private static class SessionCookieFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            // 세션 쿠키가 있으면 SameSite=None; Secure 설정
            HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                Cookie[] cookies = httpRequest.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("JSESSIONID".equals(cookie.getName())) {
                            // 쿠키 속성 재설정
                            Cookie newCookie = new Cookie("JSESSIONID", cookie.getValue());
                            newCookie.setPath("/");
                            newCookie.setHttpOnly(true);
                            newCookie.setSecure(true); // HTTPS에서만 전송
                            newCookie.setAttribute("SameSite", "None"); // 크로스 도메인 허용
                            newCookie.setMaxAge(-1); // 세션 쿠키
                            httpResponse.addCookie(newCookie);
                            break;
                        }
                    }
                }
            }

            chain.doFilter(request, response);
        }
    }
}

