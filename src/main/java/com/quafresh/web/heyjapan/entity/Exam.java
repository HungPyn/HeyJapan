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
@Table(name = "exams")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_code", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "quantity_question")
    private Integer quantityQuestion;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "day_creation")
    private Instant dayCreation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_code")
    private com.quafresh.web.heyjapan.entity.Topic topicCode;

    @OneToMany(mappedBy = "examCode")
    private Set<ExamResult> examResults = new LinkedHashSet<>();

    @OneToMany(mappedBy = "examCode")
    private Set<com.quafresh.web.heyjapan.entity.Question> questions = new LinkedHashSet<>();

}