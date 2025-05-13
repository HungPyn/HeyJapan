package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/account")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AccountController {

    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAccount() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.search(keyword));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(userService.delete(userId));
    }
}
