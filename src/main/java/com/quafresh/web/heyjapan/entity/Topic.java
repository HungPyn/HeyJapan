package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "topics")
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "topic_code", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "topic_name", nullable = false)
    private String topicName;

    @Size(max = 255)
    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "quantity_lesson")
    private Integer quantityLesson;

    @Column(name = "day_creation")
    private LocalDateTime dayCreation;

    @PrePersist
    protected void onCreate() {
        dayCreation = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_code")
    private Level levelCode;

    @OneToMany(mappedBy = "topicCode")
    private Set<Exam> exams = new LinkedHashSet<>();

    @OneToMany(mappedBy = "topicCode")
    private Set<Lesson> lessons = new LinkedHashSet<>();

}