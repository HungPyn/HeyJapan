package com.quafresh.web.heyjapan.repository;

import com.quafresh.web.heyjapan.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Integer> {
    // Lay tat ca topic cua level va sap xep theo cu -> moi
    @Query("SELECT t FROM Topic t JOIN FETCH t.level WHERE t.level.id = :levelId ORDER BY t.dayCreation ASC")
    List<Topic> findAllTopicsByLevelId(@Param("levelId") Integer levelId);


    //admin
    @Query("SELECT t FROM Topic t  ORDER BY t.dayCreation ASC")
    List<Topic> getAll();

    @Query("SELECT t FROM Topic t where t.name like %:keyword% ORDER BY t.dayCreation ASC")
    List<Topic> searchAll(@Param("keyword") String keyword);

}
