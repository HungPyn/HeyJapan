package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.account.RequestUserDTO;
import com.quafresh.web.heyjapan.dto.user.account.ResponseUserDTO;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.LevelRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.UserService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public List<ResponseUserDTO> getAll() {
        List<User> users = userRepository.getAllUsers();
        return users.stream()
                .map(user
                        -> new ResponseUserDTO(user.getId(),user.getUsername(),user.getRole()))
                .collect(Collectors.toList());
    }

    @Override
    public String delete(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
        userRepository.delete(user);
        return ErrorMessages.DELETE_ACCOUNT.getMessage();
    }

    @Override
    public List<ResponseUserDTO> search(String keyword) {
        List<User> users = userRepository.search(keyword);
        return users.stream()
                .map(user
                        -> new ResponseUserDTO(user.getId(),user.getUsername(),user.getRole()))
                .collect(Collectors.toList());
    }
}
