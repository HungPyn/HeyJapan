package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;

public interface ExamResultService {
    String create(RequestExamResultDTO examResultDTO);
}
