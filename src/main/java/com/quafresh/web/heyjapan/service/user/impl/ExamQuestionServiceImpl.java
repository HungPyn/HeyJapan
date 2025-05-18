package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.exam.RequestExamQuestion;
import com.quafresh.web.heyjapan.dto.user.exam.ResponseExamDTO;
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

    private ResponseExamDTO convertToDTO(ExamQuestion examQuestion){
        ResponseExamDTO responseExamDTO = new ResponseExamDTO();
        responseExamDTO.setTopicID(examQuestion.getTopic().getId());
        responseExamDTO.setAudioUrlExam(examQuestion.getAudioUrlExam());
        responseExamDTO.setOptionsLanguageCode(examQuestion.getOptionsLanguageCode());
        responseExamDTO.setTargetWordNative(examQuestion.getTargetWordNative());
        responseExamDTO.setQuestionType(String.valueOf(examQuestion.getQuestionType()));
        responseExamDTO.setPromptTextTemplate(examQuestion.getPromptTextTemplate());
        responseExamDTO.setTargetLanguageCode(examQuestion.getTargetLanguageCode());
        return responseExamDTO;
    }
    @Override
    public List<?> getExamQuesWithTopicId(Integer topicID) {
        Topic topic = topicRepository.findById(topicID).orElseThrow(()-> new RuntimeException("Loi khon tim thay topic"));
        List<ExamQuestion> list = examQuestionRepository.findAllByTopic(topic);
        return list.stream().map(this::convertToDTO).collect(Collectors.toList());
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
