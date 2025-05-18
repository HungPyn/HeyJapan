package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lesson-question")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonQuestionController {
    private final QuestionChoicesService questionChoicesService;
    @GetMapping("/lesson")
    private ResponseEntity<List<?>> getQuestionChoicesByLessonId(@RequestParam Integer lessonId){
        return ResponseEntity.ok(questionChoicesService.getAllByLessonID(lessonId));
    }
    @GetMapping("/exam")
    private ResponseEntity<List<?>> getQuestionChoicesByExamID(@RequestParam Integer examID){
        return ResponseEntity.ok(questionChoicesService.getAllByExamID(examID));
    }

    @PostMapping("/update")
    private ResponseEntity<?> updateQuestionChoices(@RequestBody QuestionChoice questionChoice){
        questionChoicesService.updateByID(questionChoice);
        return ResponseEntity.ok("Cap nhat thanh cong questionChoices co id"+questionChoice.getId());
    }

    @PostMapping("/create")
    private ResponseEntity<?> createQuestionChoices(@RequestBody QuestionChoice questionChoice){
        questionChoicesService.updateByID(questionChoice);
        return ResponseEntity.ok("Them moi thanh cong questionChoices co id"+questionChoice.getId());
    }

    @PutMapping("/delete")
    private ResponseEntity<?> deleteByQuestionChoices(@RequestParam Integer id){
        questionChoicesService.deleteByID(id);
        return ResponseEntity.ok("Xoa thanh cong questionsChoices co id la "+id);
    }
}
