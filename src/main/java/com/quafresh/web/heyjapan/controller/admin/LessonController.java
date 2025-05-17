package com.quafresh.web.heyjapan.controller.admin;


import com.quafresh.web.heyjapan.dto.user.lesson.RequestLessonDTO;
import com.quafresh.web.heyjapan.entity.Lesson;
import com.quafresh.web.heyjapan.service.user.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/lesson")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonController {
    private final LessonService lessonService;
    @GetMapping
    private ResponseEntity<?> getLessons(@RequestParam Integer topicId) {
        return ResponseEntity.ok(lessonService.getAll(topicId));
    }

    @GetMapping("/{lessonId}")
    private ResponseEntity<?> getLessonById(@PathVariable Integer lessonId) {
        return ResponseEntity.ok(lessonService.getById(lessonId));
    }

    @PostMapping("/create")
    private ResponseEntity<?> createLesson(@Valid @RequestBody RequestLessonDTO requestLessonDTO) {
        lessonService.create(requestLessonDTO);
        return ResponseEntity.ok("Thêm bài học thành công");
    }

    @PutMapping("/update")
    private ResponseEntity<?> updateLesson(@RequestParam Integer lessonId , @Valid @RequestBody RequestLessonDTO requestLessonDTO) {
        lessonService.update(lessonId,requestLessonDTO);
        return ResponseEntity.ok("Cập nhập bài học thành công");
    }
    @PutMapping("/delete")
    private ResponseEntity<?> deleteLesson(@RequestParam Integer lessonId){
        lessonService.delete(lessonId);
        return ResponseEntity.ok("Xoa thanh cong");
    }
}
