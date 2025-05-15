package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.theory.RequestGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;

import java.util.List;

public interface GrammarService {
    List<ResponseGrammarDTO> getAllByTopic(TheoryDTO theoryDTO);

    //admin
    void createGrammar(Integer topicId,RequestGrammarDTO dto);
    void updateGrammar(RequestGrammarDTO dto);
    ResponseGrammarDTO getById(Long id);
    void deleteGrammar(Long id);
}
