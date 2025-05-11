package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.entity.LessonQuestion;

import java.util.List;

public interface LessonQuestionService {
     List<ResponseLessonQuesDTO> getQuestionsAndChoicesForLesson(Integer lessonId);
}
