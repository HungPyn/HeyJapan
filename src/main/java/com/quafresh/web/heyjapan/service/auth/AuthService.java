package com.quafresh.web.heyjapan.service.auth;


import com.quafresh.web.heyjapan.dto.user.auth.SignUpRequest;

public interface AuthService {
    String register(SignUpRequest requestSignUp);
    String login(SignUpRequest requestLogin);
}
