package com.quafresh.web.heyjapan.controller.user;

import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicViewDTO;
import com.quafresh.web.heyjapan.service.user.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/topic")
@PreAuthorize("hasRole('USER')")
public class TopicController {
    private final TopicService topicService;

    @GetMapping("/{levelID}/topics")
    public ResponseEntity<ResponseLevelDTO> getLevelWithTopics(@PathVariable Integer levelID) {
        return ResponseEntity.ok(topicService.getLevelWithTopics(levelID));
    }

    @GetMapping("/view")
    public ResponseEntity<ResponseTopicViewDTO> getTopicView(
            @RequestParam("topicId") Integer topicId,
            @RequestParam("idUser") String idUser) {
        return ResponseEntity.ok(topicService.getTopicWithTopics(topicId, idUser));
    }
}
