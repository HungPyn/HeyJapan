package com.quafresh.web.heyjapan.controller.admin;

import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.service.user.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestPart("topicMetaData") RequestTopicDTO topicMetaData,
            @RequestPart("avatarFile") MultipartFile avatarFile
    ) {
        if (avatarFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Ảnh không được để trống");
        }

        ResponseTopicDTO response = topicService.create(topicMetaData, avatarFile);
        return ResponseEntity.ok(response);
    }
    @PutMapping(value = "/update",consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> update(
            @RequestPart("topicMetaData") RequestTopicDTO requestTopicDTO,
            @RequestPart("avatarFile") MultipartFile avatarFile) {
        if (avatarFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Ảnh không được để trống");
        }
        ResponseTopicDTO response = topicService.update(requestTopicDTO, avatarFile);
        return ResponseEntity.ok(response);
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
