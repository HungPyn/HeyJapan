package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.theory.RequestVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.Vocabulary;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.repository.VocabularyRepository;
import com.quafresh.web.heyjapan.service.user.VocabularyService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {
    private final VocabularyRepository vocabularyRepository;
    private final TopicRepository topicRepository;
    private final UserMapper userMapper;
    @Override
    public List<ResponseVocabularyDTO> getAllByTopic(Integer topicId) {
        List<Vocabulary> list = vocabularyRepository.findByTopicIdOrderByWordAsc(topicId);
        return list.stream().map(userMapper::toVocabularyDTO).collect(Collectors.toList());
    }

    //admin
    @Override
    public void create(Integer topicID,RequestVocabularyDTO requestVocabularyDTO) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(()-> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        Vocabulary vocabulary = new Vocabulary();
        vocabulary.setWord(requestVocabularyDTO.getWord());
        vocabulary.setMeaning(requestVocabularyDTO.getMeaning());
        vocabulary.setPronunciation(requestVocabularyDTO.getPronunciation());
        vocabulary.setUrlAudio(requestVocabularyDTO.getUrlAudio());
        vocabulary.setTopic(topic);
        vocabularyRepository.save(vocabulary);
    }

    @Override
    public void update(RequestVocabularyDTO requestVocabularyDTO) {
        Vocabulary vocabulary = vocabularyRepository.findById(requestVocabularyDTO.getId())
                .orElseThrow(() -> new RuntimeException("Từ vựng không tồn tại"));
        vocabulary.setWord(requestVocabularyDTO.getWord());
        vocabulary.setMeaning(requestVocabularyDTO.getMeaning());
        vocabulary.setPronunciation(requestVocabularyDTO.getPronunciation());
        vocabulary.setUrlAudio(requestVocabularyDTO.getUrlAudio());
        vocabularyRepository.save(vocabulary);
    }

    @Override
    public void delete(Long id) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Từ vựng không tồn tại"));
        vocabularyRepository.delete(vocabulary);
    }

    @Override
    public ResponseVocabularyDTO getById(Long id) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Từ vựng không tồn tại"));
        return userMapper.toVocabularyDTO(vocabulary);
    }

    @Override
    public List<?> getAll() {
        return vocabularyRepository.findAll();
    }
}
