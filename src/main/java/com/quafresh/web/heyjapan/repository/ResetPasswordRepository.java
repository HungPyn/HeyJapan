package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResetPasswordRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByEmailAndCodeAndStatusIsFalse(String email, String code);

    void deleteByEmail(String email);
}
