package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import com.quafresh.web.heyjapan.service.user.LessonResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/result")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ResultAdminController {
    private final LessonResultService lessonResultService;
    private final ExamResultService examResultService;

    @GetMapping("/lesson-result")
    public ResponseEntity<List<ResponseLessonResultDTO>> getAllLessonResult(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(lessonResultService.getAllLessonResultByuserId(userId));
    }
    @GetMapping("/lesson-result/id")
    public ResponseEntity<ResponseLessonResultDTO> getLessonResultById(@RequestParam("userId") String userId,@RequestParam("lessonId") Integer lessonId) {
        return ResponseEntity.ok(lessonResultService.getLessonResultByLessonId(userId,lessonId));
    }

    @GetMapping("lesson-result/search")
    public ResponseEntity<?> searchLessonResult(@RequestParam("userId") String userId,@RequestParam("lessonName") String lessonName) {
        return ResponseEntity.ok(lessonResultService.search(userId,lessonName));
    }

    //exam
    @GetMapping("/exam-result")
    public ResponseEntity<List<ResponseExamResultDTO>> getAllExamResult(@RequestParam("userId") String userId) {
        return ResponseEntity.ok(examResultService.getAllById(userId));
    }
    @GetMapping("/exam-result/id")
    public ResponseEntity<ResponseExamResultDTO> getExamResultId(@RequestParam("userId") String userId,@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(examResultService.getById(userId,topicId));
    }

    @GetMapping("exam-result/search")
    public ResponseEntity<?> searchExamResult(@RequestParam("userId") String userId,@RequestParam("topicId") String topicId) {
        return ResponseEntity.ok(examResultService.search(userId,topicId));
    }
}
