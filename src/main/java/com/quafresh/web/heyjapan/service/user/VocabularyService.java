package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;

import java.util.List;

public interface VocabularyService {
    List<ResponseVocabularyDTO> getAllByTopic(TheoryDTO theoryDTO);
}
