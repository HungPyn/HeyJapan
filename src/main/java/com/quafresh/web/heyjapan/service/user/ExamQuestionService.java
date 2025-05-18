package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.exam.RequestExamQuestion;
import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;

import java.util.List;

public interface ExamQuestionService {
    List<?> getExamQuesWithTopicId(Integer topicID);

    void createNewExam(RequestExamQuestion requestExamQuestion);

    void updateExam(Integer id, RequestExamQuestion requestExamQuestion);

    void deleteById(Integer id);
}
