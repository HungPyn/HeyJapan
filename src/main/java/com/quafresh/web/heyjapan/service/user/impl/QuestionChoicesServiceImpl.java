package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.lesson.RequestLessonQuestionDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.repository.LessonRepository;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionChoicesServiceImpl implements QuestionChoicesService {
    private final QuestionChoiceRepository questionChoiceRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final LessonRepository lessonRepository;

    @Override
    public List<?> getAllByLessonID(Integer lessonId) {
        LessonQuestion lessonQuestion = lessonQuestionRepository.findById(lessonId).orElseThrow(()->new RuntimeException("Khong tim thay LessonID"));
        return questionChoiceRepository.findAllByLessonQuestion(lessonQuestion);
    }

    @Override
    public List<?> getAllByExamID(Integer ExamID) {
        ExamQuestion examQuestion = examQuestionRepository.findById(ExamID).orElseThrow(()-> new RuntimeException("Khong tim thay Exam ID "));
        return questionChoiceRepository.findAllByExamQuestion(examQuestion);
    }

    @Override
    public void updateByID(QuestionChoice questionChoice) {
        questionChoiceRepository.save(questionChoice);
    }

    @Override
    public void deleteByID(Integer id) {
        questionChoiceRepository.deleteById(id);
    }

    @Override
    public ResponseEntity<?> updateFullLesson(RequestLessonQuestionDTO questionChoice) {
        LessonQuestion lessonQuestion = lessonQuestionRepository.findById(questionChoice.getLessonQuestionID()).orElseThrow(()->new RuntimeException("Khong tim thay lessonQuestion tai api updateFullLesson"));
        if (questionChoice.getAudioUrlQuestions() != null){
            lessonQuestion.setAudioUrlQuestions(questionChoice.getAudioUrlQuestions());
        }
        if (questionChoice.getOptionsLanguageCode()!= null){
            lessonQuestion.setOptionsLanguageCode(questionChoice.getOptionsLanguageCode());
        }
        if (questionChoice.getPromptTextTemplate() != null){
            lessonQuestion.setPromptTextTemplate(questionChoice.getPromptTextTemplate());
        }
        if (questionChoice.getQuestionType()!= null){
            lessonQuestion.setQuestionType(QuestionType.valueOf(questionChoice.getQuestionType()));
        }
        if (questionChoice.getTargetLanguageCode()!= null){
            lessonQuestion.setTargetLanguageCode(questionChoice.getTargetLanguageCode());
        }
        if (questionChoice.getTargetWordNative()!= null){
            lessonQuestion.setTargetWordNative(questionChoice.getTargetWordNative());
        }
        if (questionChoice.getQuestionChoices() != null) {
            questionChoice.getQuestionChoices().forEach(choice -> {
                if (choice == null || choice.getId() == null) {
                    throw new IllegalArgumentException("QuestionChoice hoặc ID của QuestionChoice không hợp lệ");
                }
                QuestionChoice questionChoice1 = questionChoiceRepository.findById(choice.getId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy QuestionChoice với ID: " + choice.getId()));
                if (choice.getAudioUrlForeign()!= null){
                    questionChoice1.setAudioUrlForeign(choice.getAudioUrlForeign());
                }
                if (choice.getImageUrl() != null){
                    questionChoice1.setImageUrl(choice.getImageUrl());
                }
                if (choice.getIsCorrect() != null){
                    questionChoice1.setIsCorrect(choice.getIsCorrect());
                }
                if (choice.getTextBlock()!= null){
                    questionChoice1.setTextBlock(choice.getTextBlock());
                }
                if (choice.getTextForeign()!= null){
                    questionChoice1.setTextForeign(choice.getTextForeign());
                }
                if (choice.getTextRomaji()!= null){
                    questionChoice1.setTextRomaji(choice.getTextRomaji());
                }
                questionChoiceRepository.save(questionChoice1);
            });
        }


        return ResponseEntity.ok(lessonQuestionRepository.save(lessonQuestion));
    }

    @Override
    public ResponseEntity<?> createFullQuestion(RequestLessonQuestionDTO questionChoice) {
        LessonQuestion lessonQuestion = new LessonQuestion();
        if (questionChoice.getAudioUrlQuestions() != null){
            lessonQuestion.setAudioUrlQuestions(questionChoice.getAudioUrlQuestions());
        }
        lessonQuestion.setLesson(lessonRepository.findById(questionChoice.getLessonId()).orElseThrow(()-> new RuntimeException("loi khong tim thay")));
        if (questionChoice.getOptionsLanguageCode()!= null){
            lessonQuestion.setOptionsLanguageCode(questionChoice.getOptionsLanguageCode());
        }
        if (questionChoice.getPromptTextTemplate() != null){
            lessonQuestion.setPromptTextTemplate(questionChoice.getPromptTextTemplate());
        }
        if (questionChoice.getQuestionType()!= null){
            lessonQuestion.setQuestionType(QuestionType.valueOf(questionChoice.getQuestionType()));
        }
        if (questionChoice.getTargetLanguageCode()!= null){
            lessonQuestion.setTargetLanguageCode(questionChoice.getTargetLanguageCode());
        }
        if (questionChoice.getTargetWordNative()!= null){
            lessonQuestion.setTargetWordNative(questionChoice.getTargetWordNative());
        }
        if (questionChoice.getQuestionChoices() != null) {
            questionChoice.getQuestionChoices().forEach(choice -> {
                if (choice == null) {
                    throw new IllegalArgumentException("QuestionChoice không hợp lệ");
                }
                QuestionChoice questionChoice1 = new QuestionChoice();
                if (choice.getAudioUrlForeign()!= null){
                    questionChoice1.setAudioUrlForeign(choice.getAudioUrlForeign());
                }

                if (choice.getExamQuestion()!= null){
                    questionChoice1.setExamQuestion(examQuestionRepository.findById(choice.getExamQuestion()).orElseThrow(()->new RuntimeException("Khong tim thay")));
                }

                if (choice.getLessonQuestion()!= null){
                    questionChoice1.setLessonQuestion(lessonQuestionRepository.findById(choice.getLessonQuestion()).orElseThrow(()->new RuntimeException("Khong tim thay")));
                }

                if (choice.getImageUrl() != null){
                    questionChoice1.setImageUrl(choice.getImageUrl());
                }
                if (choice.getIsCorrect() != null){
                    questionChoice1.setIsCorrect(choice.getIsCorrect());
                }
                if (choice.getTextBlock()!= null){
                    questionChoice1.setTextBlock(choice.getTextBlock());
                }
                if (choice.getTextForeign()!= null){
                    questionChoice1.setTextForeign(choice.getTextForeign());
                }
                if (choice.getTextRomaji()!= null){
                    questionChoice1.setTextRomaji(choice.getTextRomaji());
                }
                questionChoiceRepository.save(questionChoice1);
            });
        }
        return null;
    }
}
