package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;
import com.quafresh.web.heyjapan.entity.Lesson;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {

    // truy vấn xem bài học người dùng đã làm và làm chưa để hien thị
    @Query(value = """
                SELECT
                    l.lesson_id AS id,
                    l.lesson_name AS name,
            IF(lr.lesson_id is not null AND lr.completion_percent >= 50, true, false) as isComplete
                FROM lessons l
                LEFT JOIN(
                    SELECT lesson_id, MAX(completion_percent) AS completion_percent
                    FROM lesson_results
                    WHERE user_id = :userId
                    GROUP BY lesson_id
                )lr ON l.lesson_id = lr.lesson_id
                WHERE l.topic_id = :topicId
                ORDER BY l.day_creation
            """, nativeQuery = true)
    List<ResponseLessonDTO> findLessonsWithStatusByTopicIdAndUserId(
            @Param("topicId") Integer topicId,
            @Param("userId") String userId);


    @Query("select l from Lesson l where l.topic.id = :topicId order by l.dayCreation DESC ")
    List<Lesson> getAllLessonsByTopicId(@Param("topicId") Integer topicId);

}