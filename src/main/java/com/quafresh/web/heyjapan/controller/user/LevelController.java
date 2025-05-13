package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.service.user.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/level")
@PreAuthorize("hasRole('ROLE_USER')")
public class LevelController {

    private final LevelService levelService;

    @GetMapping
    public ResponseEntity<List<ResponseLevelDTO>> getAll() {
        return ResponseEntity.ok(levelService.getAllLevel());
    }
}
