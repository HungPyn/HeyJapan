package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Integer> {
  }