package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamQuestionServiceImpl implements ExamQuestionService {

    private final ExamQuestionRepository examQuestionRepository;
    private final UserMapper userMapper;

    @Override
    public List<ResponseExamQuesDTO> getExamQuesWithTopicId(Integer topicID) {
        List<ExamQuestion> list = examQuestionRepository.findQuestionsByTopicId(topicID);
        return list.stream().map(userMapper::toResponseExamQuesDTO).collect(Collectors.toList());
    }
}
