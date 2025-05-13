package com.quafresh.web.heyjapan.service.auth.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.auth.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceimpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public User processOAuthUser(Payload payload) {
        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String pictureUrl = (String) payload.get("picture");
        String name = (String) payload.get("name");
        Optional<User> userOptional = userRepository.findByOauthSubjectId(googleId);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setEmail(email);
            user.setName(name);
            user.setImageUrl(pictureUrl);
        } else {
            if (userRepository.existsByEmail(email)) {
            }
            user = new User();
            user.setId(String.valueOf(UUID.randomUUID()));
            user.setOauthSubjectId(googleId);
            user.setEmail(email);
            user.setName(name);
            user.setRole(false);
            user.setImageUrl(pictureUrl);

        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User findOrCreateUser(String googleId, String email, String name) {
        return userRepository.findByOauthSubjectId(googleId)
                .map(existingUser -> {
                    existingUser.setEmail(email);
                    existingUser.setName(name);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(UUID.randomUUID().toString());
                    newUser.setOauthSubjectId(googleId);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setRole(false);
                    
                    return userRepository.save(newUser);
                });
    }
}