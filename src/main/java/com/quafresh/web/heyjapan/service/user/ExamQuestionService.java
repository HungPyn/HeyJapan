package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.exam.ResponseExamDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestExamQuestionDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuestionDTO;

import java.util.List;

public interface ExamQuestionService {
    List<?> getExamQuesWithTopicId(Integer topicID);
    List<ResponseExamQuestionDTO> getExamQuestionDESC(Integer topicID);

    //admin
    void createNewExam(RequestExamQuestionDTO requestExamQuestion);

    void updateExam(Integer id, RequestExamQuestionDTO requestExamQuestion);

    void deleteById(Integer id);
    ResponseExamQuestionDTO getExamById(Integer id);

}
