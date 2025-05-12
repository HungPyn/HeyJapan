package com.quafresh.web.heyjapan.dto.user.result;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestExamResultDTO {

    private Integer examTime;

    private BigDecimal scorePercent;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Integer topicId;

    private String userId;

}
