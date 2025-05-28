package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestLessonQuesDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.entity.Lesson;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.repository.LessonRepository;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonQuestionServiceImpl implements LessonQuestionService {

    private final LessonRepository lessonRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final QuestionChoicesService questionChoicesService;// Inject đúng cách

    public ResponseLessonQuesDTO mapLessonQuestionToDTO(LessonQuestion lessonQuestion) {
        if (lessonQuestion == null) {
            return null;
        }
        ResponseLessonQuesDTO dto = new ResponseLessonQuesDTO();
        dto.setId(lessonQuestion.getId());
        dto.setOptionsLanguageCode(lessonQuestion.getOptionsLanguageCode());
        dto.setPromptTextTemplate(lessonQuestion.getPromptTextTemplate());
        dto.setQuestionType(lessonQuestion.getQuestionType());
        dto.setAudioUrlQuestions(lessonQuestion.getAudioUrlQuestions());
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

    // Tạo mới câu hỏi và lưu choices kèm theo
    @Override
    @Transactional
    public void create(RequestLessonQuesDTO dto) {
        Lesson lesson = lessonRepository.findById(dto.getLessonId())
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LESSON_QUESTION.getMessage()));
        LessonQuestion question = new LessonQuestion();
        question.setLesson(lesson);
        question.setOptionsLanguageCode(dto.getOptionsLanguageCode());
        question.setPromptTextTemplate(dto.getPromptTextTemplate());
        question.setQuestionType(QuestionType.valueOf(dto.getQuestionType()));
        question.setAudioUrlQuestions(dto.getAudioUrlQuestions());
        question.setTargetLanguageCode(dto.getTargetLanguageCode());
        question.setTargetWordNative(dto.getTargetWordNative());

        // Lưu question trước để có ID
        LessonQuestion savedQuestion = lessonQuestionRepository.save(question);

        // Lưu choices qua QuestionChoicesService
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
                        rc.setImageFile(choice.getImageFile()); // MultipartFile hay String thì xử lý ở service khác
                        return rc;
                    })
                    .collect(Collectors.toList());

            questionChoicesService.saveChoices(choiceDTOs, savedQuestion);
        }
    }

    // Cập nhật câu hỏi và choices kèm theo
    @Override
    @Transactional
    public void update(Integer id, RequestLessonQuesDTO dto) {
        LessonQuestion question = lessonQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_LESSON_QUESTION.getMessage()));

        question.setOptionsLanguageCode(dto.getOptionsLanguageCode());
        question.setPromptTextTemplate(dto.getPromptTextTemplate());
        question.setQuestionType(QuestionType.valueOf(dto.getQuestionType()));
        question.setAudioUrlQuestions(dto.getAudioUrlQuestions());
        question.setTargetLanguageCode(dto.getTargetLanguageCode());
        question.setTargetWordNative(dto.getTargetWordNative());

        LessonQuestion updatedQuestion = lessonQuestionRepository.save(question);

        // Cập nhật choices
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
    public ResponseLessonQuesDTO getById(Integer id) {
        LessonQuestion lessonQuestion = lessonQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_LESSON_QUESTION.getMessage()));
        return mapLessonQuestionToDTO(lessonQuestion);
    }

    @Override
    public void deleteById(Integer id) {
        LessonQuestion lessonQuestion = lessonQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_LESSON_QUESTION.getMessage()));
        lessonQuestionRepository.delete(lessonQuestion);
    }
}
