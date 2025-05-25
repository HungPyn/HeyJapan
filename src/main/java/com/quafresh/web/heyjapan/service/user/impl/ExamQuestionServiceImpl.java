package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.exam.RequestExamQuestion;
import com.quafresh.web.heyjapan.dto.user.exam.ResponseExamDTO;
import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamQuestionServiceImpl implements ExamQuestionService {

    private final ExamQuestionRepository examQuestionRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final UserMapper userMapper;
    private final TopicRepository topicRepository;

    private final QuestionChoiceRepository questionChoiceRepository;
    private ResponseExamDTO convertToDTO(ExamQuestion examQuestion) {
        ResponseExamDTO responseExamDTO = new ResponseExamDTO();
        responseExamDTO.setTopicID(examQuestion.getTopic().getId());
        responseExamDTO.setExamID(examQuestion.getId());
        responseExamDTO.setAudioUrlExam(examQuestion.getAudioUrlExam());
        responseExamDTO.setOptionsLanguageCode(examQuestion.getOptionsLanguageCode());
        responseExamDTO.setTargetWordNative(examQuestion.getTargetWordNative());
        responseExamDTO.setQuestionType(String.valueOf(examQuestion.getQuestionType()));
        responseExamDTO.setPromptTextTemplate(examQuestion.getPromptTextTemplate());
        responseExamDTO.setTargetLanguageCode(examQuestion.getTargetLanguageCode());
        responseExamDTO.setQuestionChoices(
                examQuestion.getQuestionChoices().stream()
                        .map(this::convertToQuestionChoiceDTO)
                        .collect(Collectors.toList())
        );
        return responseExamDTO;
    }

    private QuestionChoiceDTO convertToQuestionChoiceDTO(QuestionChoice questionChoice) {
        QuestionChoiceDTO dto = new QuestionChoiceDTO();
        dto.setId(questionChoice.getId());
        dto.setTextForeign(questionChoice.getTextForeign());
        dto.setTextRomaji(questionChoice.getTextRomaji());
        dto.setImageUrl(questionChoice.getImageUrl());
        dto.setTextBlock(questionChoice.getTextBlock());
        dto.setAudioUrlForeign(questionChoice.getAudioUrlForeign());
        dto.setIsCorrect(questionChoice.getIsCorrect());
        return dto;
    }
    @Override
    public List<?> getExamQuesWithTopicId(Integer topicID) {
        Topic topic = topicRepository.findById(topicID).orElseThrow(()-> new RuntimeException("Loi khong tim thay topic"));
        List<ExamQuestion> list = examQuestionRepository.findAllByTopic(topic);
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

    @Override
    public void updateFull(Integer id, ResponseExamDTO responseExamDTO) {
        if (responseExamDTO == null) {
            throw new IllegalArgumentException("ResponseExamDTO cannot be null");
        }
        ExamQuestion examQuestion = examQuestionRepository.findById(responseExamDTO.getExamID())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ExamQuestion với ID: " + responseExamDTO.getExamID()));
        examQuestion.setAudioUrlExam(responseExamDTO.getAudioUrlExam());
        examQuestion.setOptionsLanguageCode(responseExamDTO.getOptionsLanguageCode());
        String questionTypeStr = responseExamDTO.getQuestionType();
        if (questionTypeStr != null) {
            try {
                examQuestion.setQuestionType(QuestionType.valueOf(questionTypeStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Loại câu hỏi không hợp lệ: " + questionTypeStr);
            }
        } else {
            examQuestion.setQuestionType(QuestionType.MULTIPLE_CHOICE_TEXT_ONLY);
        }
        examQuestion.setTargetLanguageCode(responseExamDTO.getTargetLanguageCode());
        examQuestion.setTargetWordNative(responseExamDTO.getTargetWordNative());
        if (responseExamDTO.getQuestionChoices() != null) {
            responseExamDTO.getQuestionChoices().forEach(choice -> {
                if (choice == null || choice.getId() == null) {
                    throw new IllegalArgumentException("QuestionChoice hoặc ID của QuestionChoice không hợp lệ");
                }
                QuestionChoice questionChoice = questionChoiceRepository.findById(choice.getId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy QuestionChoice với ID: " + choice.getId()));
                if (choice.getAudioUrlForeign()!= null){
                    questionChoice.setAudioUrlForeign(choice.getAudioUrlForeign());
                }
                if (choice.getImageUrl() != null){
                    questionChoice.setImageUrl(choice.getImageUrl());
                }
                if (choice.getIsCorrect() != null){
                    questionChoice.setIsCorrect(choice.getIsCorrect());
                }
                if (choice.getTextBlock()!= null){
                    questionChoice.setTextBlock(choice.getTextBlock());
                }
                if (choice.getTextForeign()!= null){
                    questionChoice.setTextForeign(choice.getTextForeign());
                }
                if (choice.getTextRomaji()!= null){
                    questionChoice.setTextRomaji(choice.getTextRomaji());
                }
                questionChoiceRepository.save(questionChoice);
            });
        }
        examQuestionRepository.save(examQuestion);
    }

    @Override
    public ResponseEntity<?> createFull(ResponseExamDTO responseExamDTO) {
        Topic topicID = topicRepository.findById(responseExamDTO.getTopicID()).get();
        ExamQuestion examQuestion = new ExamQuestion();
        examQuestion.setTopic(topicID);
        examQuestion.setOptionsLanguageCode(responseExamDTO.getOptionsLanguageCode());
        examQuestion.setPromptTextTemplate(responseExamDTO.getPromptTextTemplate());
        examQuestion.setQuestionType(QuestionType.valueOf(responseExamDTO.getQuestionType()));
        examQuestion.setTargetLanguageCode(responseExamDTO.getTargetLanguageCode());
        examQuestion.setTargetWordNative(responseExamDTO.getTargetWordNative());
        examQuestion.setAudioUrlExam(responseExamDTO.getAudioUrlExam());

        if (responseExamDTO.getQuestionChoices() != null) {
            responseExamDTO.getQuestionChoices().forEach(choice -> {
                if (choice == null) {
                    throw new IllegalArgumentException("QuestionChoice không hợp lệ");
                }
                QuestionChoice questionChoice = new QuestionChoice();
                if (choice.getAudioUrlForeign()!= null){
                    questionChoice.setAudioUrlForeign(choice.getAudioUrlForeign());
                }

                if (choice.getExamQuestion()!= null){
                    questionChoice.setExamQuestion(examQuestionRepository.findById(choice.getExamQuestion()).orElseThrow(()->new RuntimeException("Khong tim thay")));
                }

                if (choice.getLessonQuestion()!= null){
                    questionChoice.setLessonQuestion(lessonQuestionRepository.findById(choice.getLessonQuestion()).orElseThrow(()->new RuntimeException("Khong tim thay")));
                }

                if (choice.getImageUrl() != null){
                    questionChoice.setImageUrl(choice.getImageUrl());
                }
                if (choice.getIsCorrect() != null){
                    questionChoice.setIsCorrect(choice.getIsCorrect());
                }
                if (choice.getTextBlock()!= null){
                    questionChoice.setTextBlock(choice.getTextBlock());
                }
                if (choice.getTextForeign()!= null){
                    questionChoice.setTextForeign(choice.getTextForeign());
                }
                if (choice.getTextRomaji()!= null){
                    questionChoice.setTextRomaji(choice.getTextRomaji());
                }
                questionChoiceRepository.save(questionChoice);
            });
        }
        examQuestionRepository.save(examQuestion);
        return ResponseEntity.ok(examQuestion);
    }
}
