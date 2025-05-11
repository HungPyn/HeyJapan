package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    @Query(
            "SELECT v from Vocabulary v where v.topic.id = :topicId ORDER BY v.word ASC "
    )
    List<Vocabulary> findByTopicIdOrderByWordAsc(@Param("topicId") Integer topicID);
}