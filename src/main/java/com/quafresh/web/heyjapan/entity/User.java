package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @Size(max = 36)
    @Column(name = "user_code", nullable = false, length = 36)
    private String userCode;

    @Size(max = 255)
    @Column(name = "user_name")
    private String userName;

    @Size(max = 255)
    @Column(name = "email", unique = true)
    private String email;

    @Size(max = 255)
    @Column(name = "user_password")
    private String userPassword;

    @Column(name = "user_role")
    private boolean userRole;

    // Thêm các trường cần thiết cho OAuth2
    @Size(max = 255)
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private AuthProvider provider;

    @Size(max = 255)
    @Column(name = "provider_id")
    private String providerId;

    @OneToMany(mappedBy = "userCode")
    private Set<ExamResult> examResults = new LinkedHashSet<>();

    @OneToMany(mappedBy = "userCode")
    private Set<LessonResult> lessonResults = new LinkedHashSet<>();

    // Thêm các phương thức bổ sung để tương thích với OAuth2UserService
    public String getName() {
        return this.userName;
    }

    public void setName(String name) {
        this.userName = name;
    }
}