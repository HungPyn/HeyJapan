package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.alphabet.ResponseAlphabetDTO;
import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.repository.AlphabetsRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.AlphabetService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class AlphabetServiceImpl implements AlphabetService {
    private final AlphabetsRepository alphabetsRepository;
    private final UserMapper userMapper;
    private final TopicRepository topicRepository;

    @Override
    public List<ResponseAlphabetDTO> getAllByTopicID(Integer topicID) {
        List<Alphabets> alphabetsList = alphabetsRepository.findAllByTopic_IdOrderByIdDesc(topicID);
        return alphabetsList.stream().map(userMapper::toResponseAlphabetDTO).toList();
    }

    @Override
    public void createNew(Alphabets alphabets) {
        alphabetsRepository.save(alphabets);
    }

    @Override
    public void updateAlphabetById(Integer id, Alphabets alphabets) {
        Alphabets alphabets1 = alphabetsRepository.findById(id)
                        .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_ALPHABET.getMessage()));
        alphabets1.setAlphabetCharacter(alphabets.getAlphabetCharacter());
        alphabets1.setPronunciations(alphabets.getPronunciations());
        alphabets1.setAlphabetType(alphabets.getAlphabetType());
        alphabets1.setUrlAudio(alphabets.getUrlAudio());
        alphabetsRepository.save(alphabets1);
    }

    @Override
    public void deleteAlphabet(Integer id) {
        alphabetsRepository.deleteById(id);
    }
}
