package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_code", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "question_type")
    private String questionType;

    @Size(max = 255)
    @Column(name = "title")
    private String title;

    @Lob
    @Column(name = "question_detail")
    private String questionDetail;

    @Size(max = 255)
    @Column(name = "audio_url")
    private String audioUrl;

    @Size(max = 255)
    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_code")
    private Exam examCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_code")
    private com.quafresh.web.heyjapan.entity.Skill skillCode;

}