package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.theory.RequestVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;

import java.util.List;

public interface VocabularyService {
    List<ResponseVocabularyDTO> getAllByTopic(TheoryDTO theoryDTO);

    //admin
    void create(Integer topicID,RequestVocabularyDTO requestVocabularyDTO);
    void update(RequestVocabularyDTO requestVocabularyDTO);
    void delete(Long id);
    ResponseVocabularyDTO getById(Long id);
}
