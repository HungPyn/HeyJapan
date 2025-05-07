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

    @OneToMany(mappedBy = "userCode")
    private Set<ExamResult> examResults = new LinkedHashSet<>();

    @OneToMany(mappedBy = "userCode")
    private Set<LessonResult> lessonResults = new LinkedHashSet<>();

}