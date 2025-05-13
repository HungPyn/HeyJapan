package com.quafresh.web.heyjapan.dto.user.result;

import com.quafresh.web.heyjapan.entity.Topic;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseExamResultDTO {
    private Integer id;

    private String userId;

    private Integer topicId;

    private Integer total_attempts;

    private Integer examTime;

    private String topicName;

    private BigDecimal scorePercent;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Instant startDatetime;

    private Instant endDatetime;

}
