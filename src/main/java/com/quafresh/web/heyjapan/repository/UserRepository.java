package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository  extends JpaRepository<User, String> {

    // Kiểm tra email đã tồn tại chưa
    boolean existsByEmail(String email);
    Optional<User> findByOauthSubjectId(String googleId);
    Optional<User> findByEmail(String email);

    //admin
    @Query("SELECT u FROM User u WHERE u.role = false ORDER BY u.dayCreation DESC")
    List<User> getAllUsers();

    //Tìm kiếm
    @Query("SELECT u FROM User u WHERE u.role = false and u.username like %:keyword% ORDER BY u.dayCreation DESC")
    List<User> search(@Param("keyword") String keyword);
}
