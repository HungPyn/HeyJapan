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
    @Query("""
    SELECT new com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO(
        l.id, 
        l.name, 
        CASE WHEN MAX(lr.completionPercent) >= 50 THEN TRUE ELSE FALSE END
    )
    FROM Lesson l
    LEFT JOIN LessonResult lr ON l.id = lr.lesson.id AND lr.user.id = :userId
    WHERE l.topic.id = :topicId
    GROUP BY l.id, l.name
""")
    List<ResponseLessonDTO> findLessonsWithStatusByTopicIdAndUserId(
            @Param("topicId") Integer topicId,
            @Param("userId") String userId);


    @Query("select l from Lesson l where l.topic.id = :topicId order by l.dayCreation DESC ")
    List<Lesson> getAllLessonsByTopicId(@Param("topicId") Integer topicId);

}