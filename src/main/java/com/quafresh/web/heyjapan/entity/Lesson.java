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
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_code", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "lesson_name", nullable = false)
    private String lessonName;

    @Lob
    @Column(name = "lesson_description")
    private String lessonDescription;

    @Column(name = "quantity_content")
    private Integer quantityContent;

    @Column(name = "day_creation")
    private LocalDateTime dayCreation;

    @PrePersist
    protected void onCreate() {
        dayCreation = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_code")
    private com.quafresh.web.heyjapan.entity.Topic topicCode;

    @OneToMany(mappedBy = "lessonCode")
    private Set<Content> contents = new LinkedHashSet<>();

    @OneToMany(mappedBy = "lessonCode")
    private Set<LessonResult> lessonResults = new LinkedHashSet<>();

}