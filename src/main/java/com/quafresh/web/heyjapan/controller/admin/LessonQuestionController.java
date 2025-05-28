package com.quafresh.web.heyjapan.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quafresh.web.heyjapan.dto.user.question.RequestLessonQuesDTO;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lesson-question")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonQuestionController {

    private final LessonQuestionService lessonQuestionService;
    private final ObjectMapper objectMapper;

    // Lấy danh sách câu hỏi theo lessonId
    @GetMapping
    public ResponseEntity<?> getAllLessonQuestions(@RequestParam Integer lessonId) {
        return ResponseEntity.ok(lessonQuestionService.getQuestionsAndChoicesForLesson(lessonId));
    }

    // Lấy câu hỏi theo id
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(lessonQuestionService.getById(id));
    }

    // Tạo mới LessonQuestion kèm ảnh choice (multipart/form-data)
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart("lessonQuestion") @Valid String lessonQuestionJson,
            @RequestPart(value = "choiceImages", required = false) List<MultipartFile> choiceImages
    ) throws Exception {
        // Parse JSON sang DTO
        RequestLessonQuesDTO dto = objectMapper.readValue(lessonQuestionJson, RequestLessonQuesDTO.class);

        // Gán ảnh cho từng choice nếu có
        if (choiceImages != null && !choiceImages.isEmpty()) {
            for (int i = 0; i < choiceImages.size() && i < dto.getQuestionChoices().size(); i++) {
                dto.getQuestionChoices().get(i).setImageFile(choiceImages.get(i));
            }
        }

        lessonQuestionService.create(dto);
        return ResponseEntity.ok("Thêm thành công");
    }

    // Cập nhật LessonQuestion kèm ảnh choice (multipart/form-data)
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(
            @RequestParam Integer id,
            @RequestPart("lessonQuestion") @Valid String lessonQuestionJson,
            @RequestPart(value = "choiceImages", required = false) List<MultipartFile> choiceImages
    ) throws Exception {
        RequestLessonQuesDTO dto = objectMapper.readValue(lessonQuestionJson, RequestLessonQuesDTO.class);

        if (choiceImages != null && !choiceImages.isEmpty()) {
            for (int i = 0; i < choiceImages.size() && i < dto.getQuestionChoices().size(); i++) {
                dto.getQuestionChoices().get(i).setImageFile(choiceImages.get(i));
            }
        }

        lessonQuestionService.update(id, dto);
        return ResponseEntity.ok("Cập nhật thành công");
    }

    // Xóa LessonQuestion theo id
    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(@RequestParam Integer id) {
        lessonQuestionService.deleteById(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}
