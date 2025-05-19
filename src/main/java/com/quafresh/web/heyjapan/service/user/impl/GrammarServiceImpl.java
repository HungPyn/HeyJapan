package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.theory.RequestGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Grammar;

import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.repository.GrammarRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.GrammarService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrammarServiceImpl implements GrammarService {
    private final GrammarRepository grammarRepository;
    private  final TopicRepository topicRepository;
    private final UserMapper userMapper;
    @Override
    public List<ResponseGrammarDTO> getAllByTopic(Integer topicId) {
        List<Grammar> list = grammarRepository.findByTopicIdOrderByWordAsc(topicId);
        return list.stream().map(userMapper::toResponseGrammarDTO).collect(Collectors.toList());
    }

    @Override
    public void createGrammar(Integer topicId,RequestGrammarDTO dto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        Grammar grammar = new Grammar();
        grammar.setExample(dto.getExample());
        grammar.setStructure(dto.getStructure());
        grammar.setExplanation(dto.getExplanation());
        grammar.setTopic(topic);

        grammarRepository.save(grammar);
    }

    @Override
    public void updateGrammar(RequestGrammarDTO dto) {
        Grammar grammar = grammarRepository.findById(dto.getId())
                .orElseThrow(()-> new RuntimeException("Grammar không tồn tại"));
        grammar.setExample(dto.getExample());
        grammar.setStructure(dto.getStructure());
        grammar.setExplanation(dto.getExplanation());
        grammarRepository.save(grammar);
    }

    @Override
    public ResponseGrammarDTO getById(Long id) {
        Grammar grammar = grammarRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Grammar không tồn tại"));
        return userMapper.toResponseGrammarDTO(grammar);
    }

    @Override
    public void deleteGrammar(Long id) {
        Grammar grammar = grammarRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Grammar không tồn tại"));
        grammarRepository.delete(grammar);
    }

    @Override
    public List<?> getAll() {
        return grammarRepository.findAll();
    }

}
