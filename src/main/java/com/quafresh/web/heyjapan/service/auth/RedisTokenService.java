package com.quafresh.web.heyjapan.service.auth;

public interface RedisTokenService {
     void saveRefreshToken(String email, String refreshToken, long expiryInSeconds);
     String getRefreshToken(String email);
     void deleteRefreshToken(String email);
}
