package com.quafresh.web.heyjapan.controller.admin;

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
    public ResponseEntity<?> getAllAlphabetByTopicId(@RequestParam Integer topicID){
        return ResponseEntity.ok(alphabetService.getAllByTopicID(topicID));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewAlphabet(@RequestBody Alphabets alphabets){
        alphabetService.createNew(alphabets);
        return ResponseEntity.ok("them thanh cong");
    }
    @PostMapping("/update")
    public ResponseEntity<?> updateAlphabet(@RequestParam Integer id, @RequestBody Alphabets alphabets){
        alphabetService.updateAlphabetById(id,alphabets);
        return ResponseEntity.ok("Cap nhat thanh cong");
    }
    @PostMapping("/delete")
    public ResponseEntity<?> deleteAlphabets(@RequestParam Integer id){
        alphabetService.deleteAlphabet(id);
        return ResponseEntity.ok("xoa thanh cong");
    }
}
