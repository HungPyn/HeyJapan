package com.quafresh.web.heyjapan.dto.user.result;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseLessonResultDTO {
    private Integer id;
    private String userId;
    private Integer lessonId;

    private String name;

    private Long total_attempts;

    private Integer studyTime;

    private BigDecimal completionPercent;

    private Integer totalQuestions;

    private Integer correctAnswers;

}
