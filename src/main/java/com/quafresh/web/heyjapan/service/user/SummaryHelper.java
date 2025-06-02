package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.result.SummaryDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public class SummaryHelper {
    public static <T> SummaryDTO calculateSummary(
            List<T> list,
            Instant fromDate,
            Instant toDate,
            Function<T, Instant> getCreatedAt,
            Function<T, BigDecimal> getAccuracyPercent,
            Function<T, BigDecimal> getCompletionPercent,
            Function<T, Integer> getStudyTime
    ) {
        // Lọc theo khoảng thời gian nếu fromDate/toDate được truyền
        List<T> filteredList = list.stream()
                .filter(item -> {
                    Instant createdAt = Optional.ofNullable(getCreatedAt.apply(item)).orElse(null);
                    if (createdAt == null) return false;
                    if (fromDate != null && createdAt.isBefore(fromDate)) return false;
                    if (toDate != null && createdAt.isAfter(toDate)) return false;
                    return true;
                })
                .collect(Collectors.toList());

        BigDecimal accuracySum = BigDecimal.ZERO;
        BigDecimal completionSum = BigDecimal.ZERO;
        int totalStudyTime = 0;
        int count = filteredList.size();

        for (T item : filteredList) {
            BigDecimal accuracy = Optional.ofNullable(getAccuracyPercent.apply(item)).orElse(BigDecimal.ZERO);
            BigDecimal completion = Optional.ofNullable(getCompletionPercent.apply(item)).orElse(BigDecimal.ZERO);
            int studyTime = Optional.ofNullable(getStudyTime.apply(item)).orElse(0);

            accuracySum = accuracySum.add(accuracy);
            completionSum = completionSum.add(completion);
            totalStudyTime += studyTime;
        }

        BigDecimal accuracyPercent = count > 0
                ? accuracySum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal completionAverage = count > 0
                ? completionSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new SummaryDTO(accuracyPercent, completionAverage, totalStudyTime, count, fromDate, toDate);
    }
}
