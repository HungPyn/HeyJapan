package com.quafresh.web.heyjapan.dto.user.result;

import jakarta.persistence.Column;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestLessonResultDTO {

    private Integer studyTime;

    private BigDecimal completionPercent;

    private Integer studyAttempt;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Integer lessonId;

    private String userId;

}
