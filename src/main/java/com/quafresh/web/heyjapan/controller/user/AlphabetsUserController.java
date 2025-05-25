package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.service.user.AlphabetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/alphabets")
@PreAuthorize("hasRole('USER')")
public class AlphabetsUserController {
    private final AlphabetService alphabetService;
    @GetMapping
    public ResponseEntity<?> getAlphabets(@RequestParam("topicId") Integer topicId) {
        return ResponseEntity.ok(alphabetService.getAllByTopicID(topicId));
    }
}
