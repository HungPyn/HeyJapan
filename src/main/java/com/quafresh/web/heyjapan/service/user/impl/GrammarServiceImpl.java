package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Grammar;

import com.quafresh.web.heyjapan.repository.GrammarRepository;
import com.quafresh.web.heyjapan.service.user.GrammarService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrammarServiceImpl implements GrammarService {
    private final GrammarRepository grammarRepository;
    private final UserMapper userMapper;
    @Override
    public List<ResponseGrammarDTO> getAllByTopic(TheoryDTO theoryDTO) {
        List<Grammar> list = grammarRepository.findByTopicIdOrderByWordAsc(theoryDTO.getId());
        return list.stream().map(userMapper::toResponseGrammarDTO).collect(Collectors.toList());
    }
}
