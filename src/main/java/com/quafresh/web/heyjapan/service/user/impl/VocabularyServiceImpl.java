package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Vocabulary;
import com.quafresh.web.heyjapan.repository.VocabularyRepository;
import com.quafresh.web.heyjapan.service.user.VocabularyService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {
    private final VocabularyRepository vocabularyRepository;
    private final UserMapper userMapper;
    @Override
    public List<ResponseVocabularyDTO> getAllByTopic(TheoryDTO theoryDTO) {
        List<Vocabulary> list = vocabularyRepository.findByTopicIdOrderByWordAsc(theoryDTO.getId());
        return list.stream().map(userMapper::toVocabularyDTO).collect(Collectors.toList());
    }
}
