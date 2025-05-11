package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.LessonQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Integer> {
    //Lấy tất cả câu hỏi ở bài học đó
    @Query("SELECT q FROM LessonQuestion q LEFT JOIN FETCH q.questionChoices WHERE q.lesson.id = :lessonId ORDER BY q.id,q.lesson.id ASC")
    List<LessonQuestion> findQuestionsAndChoicesByLessonId(@Param("lessonId") Integer lessonId);
}