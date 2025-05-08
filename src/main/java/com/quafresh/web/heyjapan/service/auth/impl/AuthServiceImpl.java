package com.quafresh.web.heyjapan.service.auth.impl;

import com.quafresh.web.heyjapan.dto.user.auth.SignUpRequest;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.exception.EmailAlreadyExistsException;
import com.quafresh.web.heyjapan.exception.InvalidCredentialsException;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.security.JwtTokenUtil;
import com.quafresh.web.heyjapan.service.auth.AuthService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    @Override
    public String register(SignUpRequest requestSignUp) {
        return "";
    }

    @Override
    public String login(SignUpRequest requestLogin) {
        return "";
    }
//    private final UserRepository userRepository;
//
//    private final PasswordEncoder passwordEncoder;
//    private final JwtTokenUtil jwtTokenUtil;
//    private final UserMapper userMapper;
//
//    @Override
//    public String register(RequestSignUp requestSignUp) {
//
//        if (userRepository.existsByEmail(requestSignUp.getEmail())) {
//            throw new EmailAlreadyExistsException(ErrorMessages.EMAIL_ALREADY_EXISTS.getMessage());
//        }
//        User user = userMapper.convertUser(requestSignUp);
//        String userCode = UUID.randomUUID().toString();
//        user.setUserCode(userCode);
//        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
//        user.setUserRole(false);
//        userRepository.save(user);
//        return "Đăng ký thành công";
//    }
//    @Override
//    public String login(RequestLogin requestLogin) {
//        User user = userRepository.findByEmail(requestLogin.getEmail())
//                .orElseThrow(() -> new InvalidCredentialsException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
//        System.out.println(user.getUserName());
//        if (!passwordEncoder.matches(requestLogin.getUserPassword(), user.getUserPassword())){
//            throw new InvalidCredentialsException(ErrorMessages.INVALID_PASSWORD.getMessage());
//        }
//        return jwtTokenUtil.generateToken(user);
//    }
}
