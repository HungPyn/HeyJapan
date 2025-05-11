package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.repository.LevelRepository;
import com.quafresh.web.heyjapan.service.user.LevelService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LevelServiceImpl implements LevelService {
    private final LevelRepository levelRepository;
    private final UserMapper userMapper;
    @Override
    public List<ResponseLevelDTO> getAllLevel() {
        List<Level> levels = levelRepository.findAll();
        return levels.stream().map(userMapper::toResponseLevelDTO).collect(Collectors.toList());
    }
}
