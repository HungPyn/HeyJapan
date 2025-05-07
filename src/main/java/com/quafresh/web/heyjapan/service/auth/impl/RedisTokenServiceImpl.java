package com.quafresh.web.heyjapan.service.auth.impl;

import com.quafresh.web.heyjapan.service.auth.RedisTokenService;

public class RedisTokenServiceImpl  implements RedisTokenService {
    @Override
    public void saveRefreshToken(String email, String refreshToken, long expiryInSeconds) {

    }

    @Override
    public String getRefreshToken(String email) {
        return "";
    }

    @Override
    public void deleteRefreshToken(String email) {

    }
}
