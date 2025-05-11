package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;

import java.util.List;

public interface ExamQuestionService {
    List<ResponseExamQuesDTO> getExamQuesWithTopicId(Integer topicID);
}
