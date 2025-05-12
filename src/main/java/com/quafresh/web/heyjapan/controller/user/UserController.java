package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.account.RequestUserDTO;
import com.quafresh.web.heyjapan.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/update")
@PreAuthorize("hasRole('USER')")
public class UserController {
    private final UserService userService;

    @PutMapping("level")
    public ResponseEntity<String> updateLevel(@RequestBody RequestUserDTO requestUserDTO) {
        String result = userService.updateLevel(requestUserDTO);
        return ResponseEntity.ok(result);
    }
}