package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.entity.Alphabets;

import java.util.List;

public interface AlphabetService {

    List<Alphabets> getAllByTopicID(Integer topicID);

    void createNew(Alphabets alphabets);

    void updateAlphabetById(Integer id, Alphabets alphabets);

    void deleteAlphabet(Integer id);
}
