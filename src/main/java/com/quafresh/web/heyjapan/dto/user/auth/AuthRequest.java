package com.quafresh.web.heyjapan.dto.user.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "ID token cannot be blank")
    private String idToken;
}