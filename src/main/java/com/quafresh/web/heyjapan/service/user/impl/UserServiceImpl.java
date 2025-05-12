package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.account.RequestUserDTO;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.LevelRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.UserService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final LevelRepository levelRepository;
    @Override
    public String updateLevel(RequestUserDTO dto) {
        Level level = levelRepository.findById(dto.getLevelId())
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LEVEL.getMessage()));
        User user = userRepository.findById(dto.getId())
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
        user.setLevel(level);
        userRepository.save(user);
        return "Cập nhập cấp độ thành công";
    }
}
