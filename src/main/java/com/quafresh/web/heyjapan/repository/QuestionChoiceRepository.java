package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionChoiceRepository extends JpaRepository<QuestionChoice, Integer> {
    List<QuestionChoice> findAllByLessonQuestion(LessonQuestion lessonQuestion);
    List<QuestionChoice> findAllByExamQuestion(ExamQuestion examQuestion);
}