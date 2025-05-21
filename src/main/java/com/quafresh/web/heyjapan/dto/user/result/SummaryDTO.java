package com.quafresh.web.heyjapan.dto.user.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryDTO {
    private BigDecimal accuracyPercent;
    private BigDecimal completionAverage;
    private Integer totalStudyTime;
    private Integer totalSum;
}
