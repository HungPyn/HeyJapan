package com.quafresh.web.heyjapan.controller.auth;

import com.quafresh.web.heyjapan.security.CurrentUser;
import com.quafresh.web.heyjapan.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class MobileAuthController {

    @GetMapping("/mobile/google-auth-url")
    public ResponseEntity<?> getGoogleAuthUrl() {
        // Tạo state ngẫu nhiên để bảo vệ khỏi CSRF
        String state = UUID.randomUUID().toString();
        // Lưu state vào cache/session để sau đó có thể xác thực
        // cacheService.put("oauth2_state_" + state, state, 10, TimeUnit.MINUTES);
        // Tạo URL xác thực Google với state
        String authUrl = "/oauth2/authorize/google?redirect_uri=com.quafresh.heyjapan:/oauth2callback&state=" + state;
        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        response.put("state", state);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/mobile/token")
    public ResponseEntity<?> getTokenFromCode(@RequestBody Map<String, String> request) {
        String authCode = request.get("code");
        String state = request.get("state");

        // Xác thực state
        // if (!cacheService.get("oauth2_state_" + state).equals(state)) {
        //    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid state parameter");
        // }

        // Đổi authCode thành token
        // Implement logic để exchange auth code sang access token

        // Trả về JWT token
        // String token = jwtTokenProvider.createToken(authentication);

        // Map<String, String> tokenResponse = new HashMap<>();
        // tokenResponse.put("token", token);

        // return ResponseEntity.ok(tokenResponse);

        // Triển khai tạm thời - chỉ mẫu
        return ResponseEntity.ok("Implement exchange code to token here");
    }
}