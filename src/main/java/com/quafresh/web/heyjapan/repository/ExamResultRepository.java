package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO;
import com.quafresh.web.heyjapan.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamResultRepository extends JpaRepository<ExamResult, Integer> {

    // Truy vấn để lấy bài kiểm tra và trạng thái đã làm của người dùng
    @Query("SELECT new com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO(" +
           "t.id, " +
           "CASE WHEN MAX(er.scorePercent) >= 50 THEN TRUE ELSE FALSE END) " +
           "FROM Topic t " +
           "LEFT JOIN ExamResult er ON t.id = er.topic.id AND er.user.id = :userId " +
           "WHERE t.id = :topicId " +
           "GROUP BY t.id")
    ExamResponseDTO getExamStatusForTopic(@Param("userId") String userId, @Param("topicId") Integer topicId);
}