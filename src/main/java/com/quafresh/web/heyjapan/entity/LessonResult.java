package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "lesson_results")
public class LessonResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_code", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_code")
    private com.quafresh.web.heyjapan.entity.User userCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_code")
    private com.quafresh.web.heyjapan.entity.Lesson lessonCode;

    @Column(name = "study_time")
    private Integer studyTime;

    @Column(name = "completion_percent", precision = 5, scale = 2)
    private BigDecimal completionPercent;

    @Column(name = "study_attempt")
    private Integer studyAttempt;

    @Column(name = "start_datetime")
    private Instant startDatetime;

    @Column(name = "end_datetime")
    private Instant endDatetime;

}