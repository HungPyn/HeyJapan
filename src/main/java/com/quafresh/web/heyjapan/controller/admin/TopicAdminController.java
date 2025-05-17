package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.service.user.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/topic")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TopicAdminController {
    private final TopicService topicService;

    @GetMapping()
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam("keyword") String keyword) {
    return ResponseEntity.ok(topicService.search(keyword));}

    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody RequestTopicDTO requestTopicDTO) {
        return ResponseEntity.ok(topicService.create(requestTopicDTO));
    }
    @PutMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody RequestTopicDTO requestTopicDTO) {
        return ResponseEntity.ok(topicService.update(requestTopicDTO));
    }

    @GetMapping("/id")
    public ResponseEntity<?> getById(@RequestParam("id") Integer id) {
        return ResponseEntity.ok(topicService.getById(id));
    }
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteById(@RequestParam("id") Integer id) {
        topicService.delete(id);
        return ResponseEntity.ok("Xóa chủ đề than công");
    }
}
