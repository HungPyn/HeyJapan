package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.alphabet.RequestAlphabetDTO;
import com.quafresh.web.heyjapan.dto.user.alphabet.ResponseAlphabetDTO;
import com.quafresh.web.heyjapan.entity.Alphabets;

import java.util.List;

public interface AlphabetService {

    List<ResponseAlphabetDTO> getAllByTopicID(Integer topicID);

    void createNew(RequestAlphabetDTO dto);

    void updateAlphabetById(Long id, RequestAlphabetDTO dto);

    ResponseAlphabetDTO getAlphabetById(Long id);

    List<ResponseAlphabetDTO> search(Integer topicId, String keyword);

    void deleteAlphabet(Long id);
}
