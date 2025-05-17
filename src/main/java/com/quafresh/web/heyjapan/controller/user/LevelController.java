package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.UpdateLevelRequest;
import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.LevelRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/level")
public class LevelController {

    private final LevelService levelService;
    private final UserRepository userRepository;
    private final LevelRepository levelRepository;
    @GetMapping
    public ResponseEntity<List<ResponseLevelDTO>> getAll() {
        return ResponseEntity.ok(levelService.getAllLevel());
    }
    @PostMapping
    public ResponseEntity<User> updateLevelByUserID(@RequestBody UpdateLevelRequest request) {
        Level level = levelRepository.findById(request.getLevelId()).get();
        User user = userRepository.findById(request.getId()).get();
        user.setLevel(level);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
