package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.LessonQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, Integer> {
    //Lấy tất cả câu hỏi ở bài học đó
}