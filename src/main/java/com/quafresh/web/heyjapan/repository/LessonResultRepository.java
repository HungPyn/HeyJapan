package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO;
import com.quafresh.web.heyjapan.entity.LessonResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonResultRepository extends JpaRepository<LessonResult, Integer> {

    @Query("""
    SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO(
        lr.id,
        :userId,
        l.id,
        l.name,
        (
            SELECT COUNT(lr2)
            FROM LessonResult lr2
            WHERE lr2.lesson.id = l.id
            AND lr2.user.id = :userId
        ) AS total_attempts,
        MAX(lr.studyTime) AS max_studyTime,
        MAX(lr.completionPercent) AS max_completionPercent,
        MAX(lr.totalQuestions) AS max_totalQuestions,
        MAX(lr.correctAnswers) AS max_correctAnswers
    )
    FROM Lesson l
    LEFT JOIN LessonResult lr ON l.id = lr.lesson.id AND lr.user.id = :userId
    GROUP BY l.id
    ORDER BY l.id ASC
    """)
    List<ResponseLessonResultDTO> getAllLessonResultByID(@Param("userId") String userId);

    @Query("""
    SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO(
        lr.id,
        :userId,
        l.id,
        l.name,
        (
            SELECT COUNT(lr2)
            FROM LessonResult lr2
            WHERE lr2.lesson.id = l.id
            AND lr2.user.id = :userId
        ) AS total_attempts,
        MAX(lr.studyTime) AS max_studyTime,
        MAX(lr.completionPercent) AS max_completionPercent,
        MAX(lr.totalQuestions) AS max_totalQuestions,
        MAX(lr.correctAnswers) AS max_correctAnswers
    )
    FROM Lesson l
    LEFT JOIN LessonResult lr ON l.id = lr.lesson.id AND lr.user.id = :userId
    WHERE (:lessonName IS NULL OR l.name LIKE %:lessonName%)
    GROUP BY l.id
    ORDER BY l.id ASC
    """)
    List<ResponseLessonResultDTO> searchLessonResults(
            @Param("userId") String userId,
            @Param("lessonName") String lessonName
    );

    @Query("""
    SELECT new com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO(
        lr.id,
        :userId,
        l.id,
        l.name,
        (
            SELECT COUNT(lr2)
            FROM LessonResult lr2
            WHERE lr2.lesson.id = l.id
            AND lr2.user.id = :userId
        ) AS total_attempts,
        MAX(lr.studyTime) AS max_studyTime,
        MAX(lr.completionPercent) AS max_completionPercent,
        MAX(lr.totalQuestions) AS max_totalQuestions,
        MAX(lr.correctAnswers) AS max_correctAnswers
    )
    FROM Lesson l
    LEFT JOIN LessonResult lr ON l.id = lr.lesson.id AND lr.user.id = :userId
    WHERE l.id = :lessonId
    GROUP BY l.id
    ORDER BY l.id ASC
    """)
    Optional<ResponseLessonResultDTO> getLessonResultById(@Param("userId") String userId, @Param("lessonId") Integer lessonId);

    List<LessonResult> findByUserIdAndLesson_Topic_Id(String userId, Integer topicId);

}
