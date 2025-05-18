package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.repository.ExamQuestionRepository;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionChoicesServiceImpl implements QuestionChoicesService {
    private final QuestionChoiceRepository questionChoiceRepository;
    private final LessonQuestionRepository lessonQuestionRepository;
    private final ExamQuestionRepository examQuestionRepository;
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
}
