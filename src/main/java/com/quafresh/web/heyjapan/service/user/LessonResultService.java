package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.dto.user.result.RequestLessonResultDTO;

public interface LessonResultService {
    String create(RequestLessonResultDTO requestLessonResultDTO);
}
