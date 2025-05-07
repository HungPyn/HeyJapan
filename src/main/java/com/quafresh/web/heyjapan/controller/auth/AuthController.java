package com.quafresh.web.heyjapan.controller.auth;

import com.quafresh.web.heyjapan.dto.user.auth.RequestLogin;
import com.quafresh.web.heyjapan.dto.user.auth.RequestSignUp;
import com.quafresh.web.heyjapan.service.auth.AuthService;
import com.quafresh.web.heyjapan.service.auth.impl.AuthServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RequestSignUp requestSignUp) {
        authService.register(requestSignUp);
        return ResponseEntity.ok("Đăng ký tài khoản thành công");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody RequestLogin requestLogin) {
        String token = authService.login(requestLogin);
        return ResponseEntity.ok(token);
    }
}
