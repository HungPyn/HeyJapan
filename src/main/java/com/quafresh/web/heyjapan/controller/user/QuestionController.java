package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseExamQuesDTO;
import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/question")
@PreAuthorize("hasRole('USER')")
public class QuestionController {
    private final LessonQuestionService lessonQuestionService;
    private final ExamQuestionService examQuestionService;
    private final QuestionChoiceRepository questionChoiceRepository;
    @GetMapping("/lesson-question")
    public ResponseEntity<List<?>> getLessonQuestion(@RequestParam("lessonID") Integer lessonID) {
        return ResponseEntity.ok(lessonQuestionService.getQuestionsAndChoicesForLesson(lessonID));
    }

    @GetMapping("/exam-question")
    public ResponseEntity<List<?>> getExamQuestion(@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(examQuestionService.getExamQuesWithTopicId(topicId));
    }

}
