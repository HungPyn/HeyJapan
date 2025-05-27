package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.alphabet.RequestAlphabetDTO;
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
    public void createNew(RequestAlphabetDTO dto) {
        Topic topic = topicRepository.findById(dto.getTopic())
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        Alphabets alphabets = new Alphabets();
        alphabets.setTopic(topic);
        alphabets.setAlphabetCharacter(dto.getAlphabetCharacter());
        alphabets.setAlphabetType(dto.getAlphabetType());
        alphabets.setUrlAudio(dto.getUrlAudio());
        alphabets.setPronunciations(dto.getPronunciations());
        alphabetsRepository.save(alphabets);
    }

    @Override
    public void updateAlphabetById(Long id, RequestAlphabetDTO dto) {
        Topic topic = topicRepository.findById(dto.getTopic())
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        Alphabets alphabets = alphabetsRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_ALPHABET.getMessage()));
        alphabets.setTopic(topic);
        alphabets.setAlphabetCharacter(dto.getAlphabetCharacter());
        alphabets.setAlphabetType(dto.getAlphabetType());
        alphabets.setUrlAudio(dto.getUrlAudio());
        alphabets.setPronunciations(dto.getPronunciations());
        alphabetsRepository.save(alphabets);
    }

    @Override
    public ResponseAlphabetDTO getAlphabetById(Long id) {
        Alphabets alphabets = alphabetsRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_ALPHABET.getMessage()));
        return userMapper.toResponseAlphabetDTO(alphabets);
    }

    @Override
    public List<ResponseAlphabetDTO> search(Integer topicId, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            keyword = "";
        }
        List<Alphabets> results = alphabetsRepository.searchByTopicAndKeywordOrderByNewest(topicId, keyword);
        return results.stream().map(userMapper::toResponseAlphabetDTO).toList();
    }

    @Override
    public void deleteAlphabet(Long id) {
        alphabetsRepository.deleteById(id);
    }
}
