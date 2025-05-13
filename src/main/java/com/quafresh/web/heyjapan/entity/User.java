package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @Size(max = 36)
    @Column(name = "user_id", nullable = false, length = 36)
    private String id;

    @Size(max = 255)
    @Column(name = "oauth_subject_id")
    private String oauthSubjectId;

    @ColumnDefault("0")
    @Column(name = "current_streak")
    private Integer currentStreak;

    @ColumnDefault("0")
    @Column(name = "longest_streak")
    private Integer longestStreak;

    @Size(max = 255)
    @Column(name = "username")
    private String username;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Size(max = 255)
    @Column(name = "user_password")
    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id")
    private Level level;

    @Column(name = "user_role")
    private Boolean role;

    // Thêm các trường cần thiết cho OAuth2
    @Size(max = 255)
    @Column(name = "profile_picture_url")
    private String imageUrl;

    @Column(name = "day_creation")
    private Long dayCreation;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    private AuthProvider provider;

    @Size(max = 255)
    @Column(name = "provider_id")
    private String providerId;

    @OneToMany(mappedBy = "id")
    private Set<ExamResult> examResults = new LinkedHashSet<>();

    @OneToMany(mappedBy = "id")
    private Set<LessonResult> lessonResults = new LinkedHashSet<>();

    // Thêm các phương thức bổ sung để tương thích với OAuth2UserService
    public String getName() {
        return this.username;
    }

    public void setName(String name) {
        this.username = name;
    }

}