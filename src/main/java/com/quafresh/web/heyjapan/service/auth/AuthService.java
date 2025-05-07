package com.quafresh.web.heyjapan.service.auth;

import com.quafresh.web.heyjapan.dto.user.auth.RequestLogin;
import com.quafresh.web.heyjapan.dto.user.auth.RequestSignUp;

public interface AuthService {
    String register(RequestSignUp requestSignUp);
    String login(RequestLogin requestLogin);
}
