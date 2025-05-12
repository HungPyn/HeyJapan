package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.RequestLessonResultDTO;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import com.quafresh.web.heyjapan.service.user.LessonResultService;
import com.quafresh.web.heyjapan.service.user.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/result")
@PreAuthorize("hasRole('USER')")
public class ResultController {

    private final ExamResultService examResultService;
    private final LessonResultService lessonResultService;

    @PostMapping("/lesson-result")
    public ResponseEntity<String> createLessonResult(@RequestBody RequestLessonResultDTO requestLessonResultDTO) {
        String result = lessonResultService.create(requestLessonResultDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/exam-result")
    public ResponseEntity<String> createExamResultResult(@RequestBody RequestExamResultDTO requestExamResultDTO) {
        String result = examResultService.create(requestExamResultDTO);
        return ResponseEntity.ok(result);
    }
}
