package com.quafresh.web.heyjapan.controller.auth;

import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.security.CurrentUser;
import com.quafresh.web.heyjapan.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProtectedApiController {

    private final UserRepository userRepository;

    /**
     * API này chỉ có thể truy cập với JWT token hợp lệ
     * Trả về thông tin người dùng đang đăng nhập
     */
    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", userPrincipal.getId());
        response.put("name", userPrincipal.getName());
        response.put("email", userPrincipal.getEmail());
        response.put("roles", userPrincipal.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    /**
     * API lấy danh sách người dùng - chỉ có thể truy cập với JWT token hợp lệ
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> response = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getUsername());
                    userMap.put("email", user.getEmail());
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * API chỉ dành cho Admin
     */
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminData() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đây là API chỉ dành cho Admin");
        response.put("totalUsers", userRepository.count());

        return ResponseEntity.ok(response);
    }

    /**
     * API công khai - không yêu cầu xác thực
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublicData() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đây là API công khai, không yêu cầu xác thực");

        return ResponseEntity.ok(response);
    }
}