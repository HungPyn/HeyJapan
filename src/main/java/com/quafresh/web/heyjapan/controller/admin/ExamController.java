package com.quafresh.web.heyjapan.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quafresh.web.heyjapan.dto.user.question.RequestExamQuestionDTO;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/exam")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ExamController {
    private final ExamQuestionService examQuestionService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<?> getExamQuestionByTopicId(@RequestParam Integer topicID) {
        return ResponseEntity.ok(examQuestionService.getExamQuestionDESC(topicID));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExamById(@PathVariable Integer id) {
        return ResponseEntity.ok(examQuestionService.getExamById(id));
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createNewExam(
            @RequestPart("examQuestion") String examQuestionJson,
            @RequestPart(value = "choiceImages", required = false) List<MultipartFile> choiceImages
    ) throws IOException {
        RequestExamQuestionDTO dto = objectMapper.readValue(examQuestionJson, RequestExamQuestionDTO.class);

        // Gán từng MultipartFile vào từng RequestChoiceDTO
        if (choiceImages != null) {
            for (int i = 0; i < choiceImages.size() && i < dto.getQuestionChoices().size(); i++) {
                dto.getQuestionChoices().get(i).setImageFile(choiceImages.get(i)); // rename setImageFile đúng kiểu MultipartFile
            }
        }

        examQuestionService.createNewExam(dto);
        return ResponseEntity.ok("Thêm thành công");
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateExam(
            @RequestParam Integer id,
            @RequestPart("examQuestion") String examQuestionJson,
            @RequestPart(value = "choiceImages", required = false) List<MultipartFile> choiceImages
    ) throws IOException {
        RequestExamQuestionDTO dto = objectMapper.readValue(examQuestionJson, RequestExamQuestionDTO.class);

        // Gán ảnh nếu có
        if (choiceImages != null) {
            for (int i = 0; i < choiceImages.size() && i < dto.getQuestionChoices().size(); i++) {
                dto.getQuestionChoices().get(i).setImageFile(choiceImages.get(i));
            }
        }

        examQuestionService.updateExam(id, dto);
        return ResponseEntity.ok("Cập nhật thành công exam id " + id);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteExamById(@RequestParam Integer id) {
        examQuestionService.deleteById(id);
        return ResponseEntity.ok("Xóa thành công exam id " + id);
    }
}
