package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.RequestLessonResultDTO;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import com.quafresh.web.heyjapan.service.user.LessonResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/lesson-result")
    public ResponseEntity<?> getLessonResultByTopic(@RequestParam("userId") String userId,@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(lessonResultService.getLessonResultByTopic(userId,topicId));
    }
    @PostMapping("/exam-result")
    public ResponseEntity<String> createExamResultResult(@RequestBody RequestExamResultDTO requestExamResultDTO) {
        String result = examResultService.create(requestExamResultDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("exam-result")
    public ResponseEntity<?> getExamResultByTopic(@RequestParam("userId") String userId,@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(examResultService.getExamResultByID(userId,topicId));
    }
}
