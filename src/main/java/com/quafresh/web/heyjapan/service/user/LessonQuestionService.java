package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.RequestLessonQuesDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;

import java.util.List;

public interface LessonQuestionService {
     List<ResponseLessonQuesDTO> getQuestionsAndChoicesForLesson(Integer lessonId);

     //admin
     void create(RequestLessonQuesDTO dto);
     void update(Integer id,RequestLessonQuesDTO dto);
     ResponseLessonQuesDTO getById(Integer id);
     void deleteById(Integer id);
}
