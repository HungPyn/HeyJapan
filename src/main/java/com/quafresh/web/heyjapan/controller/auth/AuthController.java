package com.quafresh.web.heyjapan.controller.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.quafresh.web.heyjapan.dto.user.auth.*;
import com.quafresh.web.heyjapan.entity.AuthProvider;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.security.JwtTokenUtil;
import com.quafresh.web.heyjapan.security.UserPrincipal;
import com.quafresh.web.heyjapan.service.auth.GoogleTokenVerifierService;
import com.quafresh.web.heyjapan.service.auth.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// Bỏ @Autowired nếu dùng final và @RequiredArgsConstructor
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // Sử dụng final để Lombok inject qua constructor
    private final GoogleTokenVerifierService tokenVerifierService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String userId = userPrincipal.getId();
        User user = userRepository.findById(userPrincipal.getId()).get();
        String token = tokenProvider.createToken(authentication,user);
        AuthResponse authResponse = new AuthResponse(token, userId);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Email is already taken!"));
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        Long dayCreation =System.currentTimeMillis();
        user.setDayCreation(dayCreation);
        user.setRole(false);
        user.setProvider(AuthProvider.LOCAL);
        user.setRole(false);
        User result = userRepository.save(user);
        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/user/me")
                .buildAndExpand(result.getId()).toUri();

        return ResponseEntity.created(location)
                .body(new ApiResponse(true, "User registered successfully"));
    }

    @PostMapping("/google/token")
    public ResponseEntity<?> authenticateWithGoogleToken(@Valid @RequestBody AuthRequest authRequest) {
        try {
            logger.info("Received ID token for verification.");
            GoogleIdToken.Payload payload = tokenVerifierService.verify(authRequest.getIdToken());

            if (payload == null) {
                logger.warn("Invalid ID token: Verification returned null payload.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false,"Error: Invalid ID Token."));
            }
            String email = payload.getEmail();
            logger.info("ID token verified successfully for email: {}", email);
            User user = userService.processOAuthUser(payload);
            String userId = user.getId();
            String appToken = tokenProvider.createTokenForUser(user);
            logger.info("Generated application JWT for user: {}", email);
            AuthResponse responsePayload = new AuthResponse(appToken, userId);
            return ResponseEntity.ok(responsePayload);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid ID token processing: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false,"Error: Invalid ID Token. " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error during Google token authentication for token [{}...]: {}", authRequest.getIdToken().substring(0,10), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false,"Error: Authentication failed. " + e.getMessage()));
        }
    }
}