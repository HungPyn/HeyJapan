package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.entity.QuestionChoice;

import java.util.List;

public interface QuestionChoicesService {

    List<?> getAllByLessonID(Integer lessonId);
    List<?> getAllByExamID(Integer ExamID);

    void updateByID(QuestionChoice questionChoice);

    void deleteByID(Integer id);
}
