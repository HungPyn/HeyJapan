package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonQuestionServiceImpl implements LessonQuestionService {

    private final LessonQuestionRepository lessonQuestionRepository;


    public ResponseLessonQuesDTO mapLessonQuestionToDTO(LessonQuestion lessonQuestion) {
        if (lessonQuestion == null) {
            return null;
        }
        ResponseLessonQuesDTO dto = new ResponseLessonQuesDTO();
        dto.setId(lessonQuestion.getId());
        dto.setOptionsLanguageCode(lessonQuestion.getOptionsLanguageCode());
        dto.setPromptTextTemplate(lessonQuestion.getPromptTextTemplate());
        dto.setQuestionType(lessonQuestion.getQuestionType());
        dto.setAudio_url_questions(lessonQuestion.getAudioUrlQuestions());
        dto.setTargetLanguageCode(lessonQuestion.getTargetLanguageCode());
        dto.setTargetWordNative(lessonQuestion.getTargetWordNative());

        if (lessonQuestion.getQuestionChoices() != null) {
            List<QuestionChoiceDTO> choiceDTOs = lessonQuestion.getQuestionChoices().stream()
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
    public List<ResponseLessonQuesDTO> getQuestionsAndChoicesForLesson(Integer lessonId) {
        List<LessonQuestion> lessonQuestions = lessonQuestionRepository.findQuestionsAndChoicesByLessonId(lessonId);
        return lessonQuestions.stream()
                .map(this::mapLessonQuestionToDTO)
                .collect(Collectors.toList());
    }

}
