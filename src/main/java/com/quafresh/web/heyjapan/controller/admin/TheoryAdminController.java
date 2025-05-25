package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.theory.RequestGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.RequestVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.service.user.GrammarService;
import com.quafresh.web.heyjapan.service.user.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/theory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TheoryAdminController {
    private final VocabularyService vocabularyService;
    private final GrammarService grammarService;

    @PostMapping("/vocabulary/by-topic")
    public ResponseEntity<?> getVocabulary(@RequestBody TheoryDTO  dto) {
        return ResponseEntity.ok(vocabularyService.getAllByTopic(dto));
    }

    @GetMapping("/vocabulary")
    public ResponseEntity<?> getVocabularyById(@RequestParam("vocabularyId") Long id) {
        return ResponseEntity.ok(vocabularyService.getById(id));
    }

    @PostMapping("/vocabulary/create")
    public ResponseEntity<?> createVocabulary(@RequestParam("topicId") Integer topicId,@Valid @RequestBody RequestVocabularyDTO dto) {
        vocabularyService.create(topicId,dto);
        return ResponseEntity.ok("Tạo từ vựng thành công");
    }

    @PutMapping("/vocabulary/update")
    public ResponseEntity<?> updateVocabulary(@Valid @RequestBody RequestVocabularyDTO dto) {
        vocabularyService.update(dto);
        return ResponseEntity.ok("Cập nhập từ vựng thành công");
    }

    @DeleteMapping("/vocabulary/delete")
    public ResponseEntity<?> deleteVocabulary(@RequestParam("vocabularyId") Long vocabularyId) {
        vocabularyService.delete(vocabularyId);
        return ResponseEntity.ok("Từ vựng đã được xóa");
    }

    //Grammar
    @PostMapping("/grammar/by-topic")
    public ResponseEntity<?> getGrammars(@RequestBody TheoryDTO  dto) {
        return ResponseEntity.ok(grammarService.getAllByTopic(dto));
    }

    @GetMapping("/grammar")
    public ResponseEntity<?> getGrammarById(@RequestParam("grammarId") Long id) {
        return ResponseEntity.ok(grammarService.getById(id));
    }

    @PostMapping("/grammar/create")
    public ResponseEntity<?> createGrammar(@RequestParam("topicId")Integer topicId,@Valid @RequestBody RequestGrammarDTO dto) {
        grammarService.createGrammar(topicId,dto);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/grammar/update")
    public ResponseEntity<?> updateGrammar(@Valid @RequestBody RequestGrammarDTO dto) {
        grammarService.updateGrammar(dto);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("grammar/delete")
    public ResponseEntity<?> deleteGrammar(@RequestParam("grammarId")Long grammarId) {
        grammarService.deleteGrammar(grammarId);
        return ResponseEntity.ok("Ngữ pháp đã được xóa");
    }
    @GetMapping("grammar-get-all")
    public ResponseEntity<?> getAllGrammars(){
        return ResponseEntity.ok(grammarService.getAll());
    }

    @GetMapping("vocabularies-get-all")
    public ResponseEntity<?> getAllVocabularis(){
        return ResponseEntity.ok(vocabularyService.getAll());
    }
}
