package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.result.SummaryDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public class SummaryHelper {
    public static <T> SummaryDTO calculateSummary(
            List<T> list,
            Function<T, BigDecimal> getAccuracyPercent,
            Function<T, BigDecimal> getCompletionPercent,
            Function<T, Integer> getStudyTime
    ) {
        BigDecimal accuracySum = BigDecimal.ZERO;
        BigDecimal completionSum = BigDecimal.ZERO;
        int totalStudyTime = 0;
        int count = list.size(); // Giả định list đã lọc sẵn

        for (T item : list) {
            BigDecimal accuracy = Optional.ofNullable(getAccuracyPercent.apply(item)).orElse(BigDecimal.ZERO);
            BigDecimal completion = Optional.ofNullable(getCompletionPercent.apply(item)).orElse(BigDecimal.ZERO);
            int studyTime = Optional.ofNullable(getStudyTime.apply(item)).orElse(0);

            accuracySum = accuracySum.add(accuracy);
            completionSum = completionSum.add(completion);
            totalStudyTime += studyTime;
        }

        BigDecimal accuracyPercent = accuracySum;
        BigDecimal completionAverage = count > 0
                ? completionSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new SummaryDTO(accuracyPercent, completionAverage, totalStudyTime, count);
    }
}
