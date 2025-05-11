package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.service.user.GrammarService;
import com.quafresh.web.heyjapan.service.user.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/theory")
@PreAuthorize("hasRole('USER')")
public class TheoryController {
    private final GrammarService grammarService;
    private final VocabularyService vocabularyService;
    @GetMapping("/grammar")
    public ResponseEntity<List<ResponseGrammarDTO>> getGrammarByTopics(@RequestBody TheoryDTO theoryDTO) {
        return ResponseEntity.ok(grammarService.getAllByTopic(theoryDTO));

    }

    @GetMapping("/vocabulary")
    public ResponseEntity<List<ResponseVocabularyDTO>> getVocabularyByTopics(@RequestBody TheoryDTO theoryDTO) {
        return ResponseEntity.ok(vocabularyService.getAllByTopic(theoryDTO));
    }
}
