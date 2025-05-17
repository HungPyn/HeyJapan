package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "lesson_name", nullable = false)
    private String name;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "day_creation")
    private Instant dayCreation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private com.quafresh.web.heyjapan.entity.Topic topic;

    @OneToMany(mappedBy = "lesson",cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<LessonQuestion> lessonQuestions = new LinkedHashSet<>();

    @OneToMany(mappedBy = "lesson",cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<LessonResult> lessonResults = new LinkedHashSet<>();

}