package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
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
    @GetMapping("/lesson-question")
    public ResponseEntity<List<?>> getLessonQuestion(@RequestParam("lessonID") Integer lessonID) {
        return ResponseEntity.ok(lessonQuestionService.getQuestionsByLessonASC(lessonID));
    }

    @GetMapping("/exam-question")
    public ResponseEntity<List<?>> getExamQuestion(@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(examQuestionService.getExamQuesWithTopicId(topicId));
    }

}
