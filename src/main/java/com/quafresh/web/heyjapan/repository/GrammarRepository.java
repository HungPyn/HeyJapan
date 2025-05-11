package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.Grammar;
import com.quafresh.web.heyjapan.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GrammarRepository extends JpaRepository<Grammar, Long> {
    @Query(
            "SELECT g from Grammar g where g.topic.id = :topicId ORDER BY g.structure ASC "
    )
    List<Grammar> findByTopicIdOrderByWordAsc(@Param("topicId") Integer topicID);
}