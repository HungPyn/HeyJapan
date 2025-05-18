package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.exam.RequestExamQuestion;
import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
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
    private final TopicRepository topicRepository;
    @Override
    public List<ResponseExamQuesDTO> getExamQuesWithTopicId(Integer topicID) {
        List<ExamQuestion> list = examQuestionRepository.findQuestionsByTopicId(topicID);
        return list.stream().map(userMapper::toResponseExamQuesDTO).collect(Collectors.toList());
    }

    @Override
    public void createNewExam(RequestExamQuestion requestExamQuestion) {
        Topic topicID = topicRepository.findById(requestExamQuestion.getTopicId()).get();
        ExamQuestion examQuestion = new ExamQuestion();
        examQuestion.setTopic(topicID);
        examQuestion.setOptionsLanguageCode(requestExamQuestion.getOptinasLanguageCode());
        examQuestion.setPromptTextTemplate(requestExamQuestion.getPromptTextTemplate());
        examQuestion.setQuestionType(QuestionType.valueOf(requestExamQuestion.getQuestionType()));
        examQuestion.setTargetLanguageCode(requestExamQuestion.getTargetLanguageCode());
        examQuestion.setTargetWordNative(requestExamQuestion.getTargetWordNative());
        examQuestion.setAudioUrlExam(requestExamQuestion.getAudioUrlExam());
        examQuestionRepository.save(examQuestion);
    }

    @Override
    public void updateExam(Integer id, RequestExamQuestion requestExamQuestion) {
        ExamQuestion examQuestion = examQuestionRepository.findById(id).orElseThrow(()->new RuntimeException("Khong tim thay"));
        Topic topicID = topicRepository.findById(requestExamQuestion.getTopicId()).orElseThrow(()-> new RuntimeException("Khong tim thay Topic"));
        examQuestion.setTopic(topicID);
        examQuestion.setOptionsLanguageCode(requestExamQuestion.getOptinasLanguageCode());
        examQuestion.setPromptTextTemplate(requestExamQuestion.getPromptTextTemplate());
        examQuestion.setQuestionType(QuestionType.valueOf(requestExamQuestion.getQuestionType()));
        examQuestion.setTargetLanguageCode(requestExamQuestion.getTargetLanguageCode());
        examQuestion.setTargetWordNative(requestExamQuestion.getTargetWordNative());
        examQuestion.setAudioUrlExam(requestExamQuestion.getAudioUrlExam());
        examQuestionRepository.save(examQuestion);
    }

    @Override
    public void deleteById(Integer id) {
        examQuestionRepository.deleteById(id);
    }
}
