package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.User;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, String> {

    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
