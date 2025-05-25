package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.exam.RequestExamQuestion;
import com.quafresh.web.heyjapan.dto.user.exam.ResponseExamDTO;
import com.quafresh.web.heyjapan.service.user.ExamQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/exam")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ExamController {
    private final ExamQuestionService examQuestionService;
    @GetMapping
    private ResponseEntity<?> getExamQuestionByTopicId(@RequestParam Integer topicID){
        return ResponseEntity.ok(examQuestionService.getExamQuesWithTopicId(topicID));
    }

    @PostMapping("/create")
    private ResponseEntity<?> createNewExam (@RequestBody RequestExamQuestion requestExamQuestion){
        examQuestionService.createNewExam(requestExamQuestion);
        return ResponseEntity.ok("Them thanh cong");
    }

    @PutMapping("/update")
    private ResponseEntity<?> updateExam(@RequestParam Integer id, @RequestBody RequestExamQuestion requestExamQuestion){
        examQuestionService.updateExam(id,requestExamQuestion);
        return ResponseEntity.ok("Cap nhat thanh cong exam co id" + id);
    }

    @PostMapping("/updateFull")
    private ResponseEntity<?> updateFull(@RequestParam Integer id,@RequestBody ResponseExamDTO responseExamDTO){
        examQuestionService.updateFull(id,responseExamDTO);
        return ResponseEntity.ok("Cap nhat thanh cong");
    }

    @PutMapping("/delete")
    private ResponseEntity<?> deleteExamById(@RequestParam Integer id){
        examQuestionService.deleteById(id);
        return ResponseEntity.ok("Xoa thanh cong exam id"+ id);
    }

    @PostMapping("/createFull")
    private ResponseEntity<?> createFull(@RequestBody ResponseExamDTO responseExamDTO){
       return examQuestionService.createFull(responseExamDTO);
    }
}
