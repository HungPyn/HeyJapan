package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;

import java.util.List;

public interface LessonQuestionService {
     List<ResponseLessonQuesDTO> getQuestionsAndChoicesForLesson(Integer lessonId);
}
