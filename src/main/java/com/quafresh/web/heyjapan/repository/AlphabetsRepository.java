package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AlphabetsRepository extends JpaRepository<Alphabets, Long> {
    List<Alphabets> findAllByTopic_IdOrderByIdDesc(Integer topic);

    @Query("SELECT a FROM Alphabets a " +
            "WHERE a.topic.id = :topicId " +
            "AND (" +
            "LOWER(a.alphabetCharacter) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.pronunciations) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ") " +
            "ORDER BY a.id DESC")
    List<Alphabets> searchByTopicAndKeywordOrderByNewest(@Param("topicId") Integer topicId,
                                                         @Param("keyword") String keyword);
}
