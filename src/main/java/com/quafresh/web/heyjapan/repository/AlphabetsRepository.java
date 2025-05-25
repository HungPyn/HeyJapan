package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface AlphabetsRepository extends JpaRepository<Alphabets,Integer> {
    List<Alphabets> findAllByTopic_IdOrderByIdDesc(Integer topic);
}
