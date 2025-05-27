package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.alphabet.RequestAlphabetDTO;
import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.service.user.AlphabetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/admin/alphabets")
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AlphabetsController {
    private final AlphabetService alphabetService;

    @GetMapping
    public ResponseEntity<?> getAllAlphabetByTopicId(@RequestParam Integer topicID) {
        return ResponseEntity.ok(alphabetService.getAllByTopicID(topicID));
    }

    @GetMapping()
    public ResponseEntity<?> getById(@RequestParam Long id) {
        return ResponseEntity.ok(alphabetService.getAlphabetById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam Integer topicId, @RequestParam String keyword) {
        return ResponseEntity.ok(alphabetService.search(topicId, keyword));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewAlphabet(@RequestBody RequestAlphabetDTO alphabets) {
        alphabetService.createNew(alphabets);
        return ResponseEntity.ok("Thêm thành công");
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateAlphabet(@RequestParam Long id, @RequestBody RequestAlphabetDTO alphabets) {
        alphabetService.updateAlphabetById(id, alphabets);
        return ResponseEntity.ok("Cập nhập thành công");
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteAlphabets(@RequestParam Long id) {
        alphabetService.deleteAlphabet(id);
        return ResponseEntity.ok("Xóa thành công");
    }
}
