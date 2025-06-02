package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestExamQuestionDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuestionDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamQuestionServiceImpl implements ExamQuestionService {

    private final ExamQuestionRepository examQuestionRepository;
    private final TopicRepository topicRepository;
    private final QuestionChoicesService questionChoicesService;

    // Mapper entity -> DTO
    public ResponseExamQuestionDTO mapExamQuestionToDTO(ExamQuestion examQuestion) {
        if (examQuestion == null) return null;

        ResponseExamQuestionDTO dto = new ResponseExamQuestionDTO();
        dto.setId(examQuestion.getId());
        dto.setOptionsLanguageCode(examQuestion.getOptionsLanguageCode());
        dto.setPromptTextTemplate(examQuestion.getPromptTextTemplate());
        dto.setQuestionType(String.valueOf(examQuestion.getQuestionType()));
        dto.setAudioUrlExam(examQuestion.getAudioUrlExam());
        dto.setTargetLanguageCode(examQuestion.getTargetLanguageCode());
        dto.setTargetWordNative(examQuestion.getTargetWordNative());

        if (examQuestion.getQuestionChoices() != null) {
            List<QuestionChoiceDTO> choiceDTOs = examQuestion.getQuestionChoices().stream()
                    .map(choiceEntity -> {
                        QuestionChoiceDTO choiceDto = new QuestionChoiceDTO();
                        choiceDto.setId(choiceEntity.getId());
                        choiceDto.setTextForeign(choiceEntity.getTextForeign());
                        choiceDto.setTextBlock(choiceEntity.getTextBlock());
                        choiceDto.setAudioUrlForeign(choiceEntity.getAudioUrlForeign());
                        choiceDto.setIsCorrect(choiceEntity.getIsCorrect());
                        choiceDto.setTextRomaji(choiceEntity.getTextRomaji());
                        choiceDto.setImageUrl(choiceEntity.getImageUrl());
                        return choiceDto;
                    })
                    .collect(Collectors.toList());
            dto.setQuestionChoices(choiceDTOs);
        }
        return dto;
    }

    @Override
    public List<ResponseExamQuestionDTO> getExamQuestionDESC(Integer topicID) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        List<ExamQuestion> list = examQuestionRepository.findAllByTopicOrderByIdDesc(topic);
        return list.stream()
                .map(this::mapExamQuestionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseExamQuestionDTO> getExamQuesWithTopicId(Integer topicID) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        List<ExamQuestion> list = examQuestionRepository.findAllByTopic(topic);
        return list.stream()
                .map(this::mapExamQuestionToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createNewExam(RequestExamQuestionDTO dto) {
        Topic topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));

        ExamQuestion question = new ExamQuestion();
        question.setTopic(topic);
        question.setOptionsLanguageCode(dto.getOptionsLanguageCode());
        question.setPromptTextTemplate(dto.getPromptTextTemplate());
        question.setQuestionType(QuestionType.valueOf(dto.getQuestionType()));
        question.setAudioUrlExam(dto.getAudioUrlExam());
        question.setTargetLanguageCode(dto.getTargetLanguageCode());
        question.setTargetWordNative(dto.getTargetWordNative());

        ExamQuestion savedQuestion = examQuestionRepository.save(question);

        if (dto.getQuestionChoices() != null && !dto.getQuestionChoices().isEmpty()) {
            List<RequestChoiceDTO> choiceDTOs = dto.getQuestionChoices().stream()
                    .map(choice -> {
                        RequestChoiceDTO rc = new RequestChoiceDTO();
                        rc.setId(choice.getId());
                        rc.setTextForeign(choice.getTextForeign());
                        rc.setTextRomaji(choice.getTextRomaji());
                        rc.setAudioUrlForeign(choice.getAudioUrlForeign());
                        rc.setIsCorrect(choice.getIsCorrect());
                        rc.setTextBlock(choice.getTextBlock());
                        rc.setImageFile(choice.getImageFile());
                        return rc;
                    })
                    .collect(Collectors.toList());

            questionChoicesService.saveChoices(choiceDTOs, savedQuestion);
        }
    }

    @Override
    @Transactional
    public void updateExam(Integer id, RequestExamQuestionDTO dto) {
        ExamQuestion question = examQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_EXAM_QUESTION.getMessage()));

        Topic topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));

        question.setTopic(topic);
        question.setOptionsLanguageCode(dto.getOptionsLanguageCode());
        question.setPromptTextTemplate(dto.getPromptTextTemplate());
        question.setQuestionType(QuestionType.valueOf(dto.getQuestionType()));
        question.setAudioUrlExam(dto.getAudioUrlExam());
        question.setTargetLanguageCode(dto.getTargetLanguageCode());
        question.setTargetWordNative(dto.getTargetWordNative());

        ExamQuestion updatedQuestion = examQuestionRepository.save(question);

        if (dto.getQuestionChoices() != null && !dto.getQuestionChoices().isEmpty()) {
            List<RequestChoiceDTO> choiceDTOs = dto.getQuestionChoices().stream()
                    .map(choice -> {
                        RequestChoiceDTO rc = new RequestChoiceDTO();
                        rc.setId(choice.getId());
                        rc.setTextForeign(choice.getTextForeign());
                        rc.setTextRomaji(choice.getTextRomaji());
                        rc.setAudioUrlForeign(choice.getAudioUrlForeign());
                        rc.setIsCorrect(choice.getIsCorrect());
                        rc.setTextBlock(choice.getTextBlock());
                        rc.setImageFile(choice.getImageFile());
                        return rc;
                    })
                    .collect(Collectors.toList());

            questionChoicesService.saveChoices(choiceDTOs, updatedQuestion);
        }
    }

    @Override
    public ResponseExamQuestionDTO getExamById(Integer id) {

        ExamQuestion examQuestion = examQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_EXAM_QUESTION.getMessage()));
        return mapExamQuestionToDTO(examQuestion);
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {

        ExamQuestion examQuestion = examQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_EXAM_QUESTION.getMessage()));

        examQuestionRepository.delete(examQuestion);
    }
}
