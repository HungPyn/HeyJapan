package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO;
import com.quafresh.web.heyjapan.entity.ExamResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

    //admin

    @Query("SELECT er FROM ExamResult er WHERE er.user.id = :userId")
    List<ExamResult> findAllByUserId(@Param("userId") String userId);

    @Query("""
            SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO(
                er.id,
                :userId,
                t.id,
                (
                    SELECT COUNT(er2)
                    FROM ExamResult er2
                    WHERE er2.topic.id = t.id AND er2.user.id = :userId
                ),
                er.endDatetime,
                er.examTime,
                t.name,
                er.scorePercent,
                er.totalQuestions,
                er.correctAnswers
            )
            FROM ExamResult er
            JOIN er.topic t
            WHERE er.user.id = :userId
            AND er.scorePercent = (
                SELECT MAX(er2.scorePercent)
                FROM ExamResult er2
                WHERE er2.topic.id = t.id AND er2.user.id = :userId
                ORDER BY er2.scorePercent DESC, er2.endDatetime DESC
                LIMIT 1
            )
            ORDER BY t.id ASC
            """)
    List<ResponseExamResultDTO> getAllExamResultByUserId(@Param("userId") String userId);


    Optional<ExamResult> findFirstByUserIdAndTopicIdOrderByScorePercentDesc(String userId, Integer topicId);


    @Query("""
                SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO(
                    er.id,
                    :userId,
                    t.id,
                    (
                        SELECT COUNT(er2)
                        FROM ExamResult er2
                        WHERE er2.topic.id = t.id AND er2.user.id = :userId
                    ),
                    er.endDatetime,
                    MAX(er.examTime),
                    t.name,
                    MAX(er.scorePercent),
                    MAX(er.totalQuestions),
                    MAX(er.correctAnswers)
                )
                FROM ExamResult er
                JOIN er.topic t
                JOIN er.user u
                WHERE er.user.id = :userId AND er.topic.id = :topicId
                GROUP BY er.id, u.id, t.id, t.name
                ORDER BY er.startDatetime DESC
            """)
    Optional<ResponseExamResultDTO> getExamResultByTopicId(
            @Param("userId") String userId,
            @Param("topicId") Integer topicId
    );


    @Query("""
                SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO(
                    MIN(er.id),
                    :userId,
                    t.id,
                    (
                        SELECT COUNT(er2)
                        FROM ExamResult er2
                        WHERE er2.topic.id = t.id AND er2.user.id = :userId
                    ),
                    er.endDatetime,
                    MAX(er.examTime),
                    t.name,
                    MAX(er.scorePercent),
                    MAX(er.totalQuestions),
                    MAX(er.correctAnswers)
                )
                FROM Topic t
                JOIN ExamResult er ON t.id = er.topic.id AND er.user.id = :userId
                WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                GROUP BY t.id, t.name
                ORDER BY t.id ASC
            """)
    List<ResponseExamResultDTO> searchExamResultsByUserIdAndKeyword(
            @Param("userId") String userId,
            @Param("keyword") String keyword
    );


}