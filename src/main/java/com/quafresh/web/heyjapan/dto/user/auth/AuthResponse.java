package com.quafresh.web.heyjapan.dto.user.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String userId;
    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
    public AuthResponse(String accessToken, String userId) { // Kiểu userId phải khớp với Controller
        this.accessToken = accessToken;
        this.userId = userId;
    }
}