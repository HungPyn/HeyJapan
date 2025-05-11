package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Integer> {
    @Query(
           " select e from ExamQuestion  e left join fetch QuestionChoice q where e.topic.id = :topicId order by e.id,q.id ASC "
    )
    List<ExamQuestion> findQuestionsByTopicId(@Param("topicId") Integer topicId);
  }