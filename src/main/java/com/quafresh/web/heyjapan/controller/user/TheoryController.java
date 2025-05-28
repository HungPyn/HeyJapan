package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.theory.ResponseGrammarDTO;
import com.quafresh.web.heyjapan.dto.user.theory.ResponseVocabularyDTO;
import com.quafresh.web.heyjapan.service.user.AlphabetService;
import com.quafresh.web.heyjapan.service.user.GrammarService;
import com.quafresh.web.heyjapan.service.user.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/theory")
@PreAuthorize("hasRole('USER')")
public class TheoryController {
    private final GrammarService grammarService;
    private final VocabularyService vocabularyService;
    private final AlphabetService alphabetService;
    @GetMapping("/grammar")
    public ResponseEntity<List<ResponseGrammarDTO>> getGrammarByTopics(@RequestParam("topicId")Integer topicId) {
        return ResponseEntity.ok(grammarService.getAllByTopic(topicId));

    }

    @GetMapping("/vocabulary")
    public ResponseEntity<List<ResponseVocabularyDTO>> getVocabularyByTopics(@RequestParam("topicId")Integer topicId) {
        return ResponseEntity.ok(vocabularyService.getAllByTopic(topicId));
    }
    @GetMapping("/alphabets")
    public ResponseEntity<?> getAllAlphabetsByTopicId(@RequestParam Integer topicID){
        return ResponseEntity.ok(alphabetService.getAllByTopicID(topicID));
    }
}
