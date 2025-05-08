package com.quafresh.web.heyjapan.config;

import com.quafresh.web.heyjapan.security.oauth2.CookieAuthorizationRequestRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OAuthConfig {

    @Bean
    public CookieAuthorizationRequestRepository cookieAuthorizationRequestRepository() {
        // Tạo và cấu hình instance của CookieAuthorizationRequestRepository
        return new CookieAuthorizationRequestRepository();
    }
}