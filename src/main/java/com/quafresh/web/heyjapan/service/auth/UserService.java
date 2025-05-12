package com.quafresh.web.heyjapan.service.auth;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;

import com.quafresh.web.heyjapan.entity.User;

public interface UserService {
    User processOAuthUser(Payload payload);
    User findOrCreateUser(String googleId, String email, String name);
}
