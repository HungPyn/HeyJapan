package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "exam_results")
public class ExamResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_code", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_code")
    private com.quafresh.web.heyjapan.entity.Exam examCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_code")
    private com.quafresh.web.heyjapan.entity.User userCode;

    @Column(name = "exam_time")
    private Integer examTime;

    @Column(name = "score_percent", precision = 5, scale = 2)
    private BigDecimal scorePercent;

    @Column(name = "exam_attempt")
    private Integer examAttempt;

    @Column(name = "start_datetime")
    private Instant startDatetime;

    @Column(name = "end_datetime")
    private Instant endDatetime;

}