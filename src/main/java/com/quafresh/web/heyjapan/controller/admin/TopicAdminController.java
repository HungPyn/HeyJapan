package com.quafresh.web.heyjapan.controller.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
// Đảm bảo bạn có jackson-datatype-jsr310 trong dependencies nếu RequestTopicDTO dùng Instant
// và bạn cần ObjectMapper hỗ trợ nó (thường Spring Boot tự cấu hình)
// import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.service.user.TopicService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Cho validation thủ công nếu cần
// import jakarta.validation.ConstraintViolation;
// import jakarta.validation.Validation;
// import jakarta.validation.ValidatorFactory;
// import java.util.Set;
// import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin/topic")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TopicAdminController {
    private final TopicService topicService;
    // Khởi tạo ObjectMapper.
    // Nếu bạn có cấu hình ObjectMapper toàn cục (ví dụ, để hỗ trợ JavaTimeModule),
    // bạn có thể inject nó thay vì tạo mới ở đây.
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(TopicAdminController.class);

    /*
    // Constructor để inject ObjectMapper nếu bạn cấu hình nó như một Bean
    // và muốn đăng ký các module như JavaTimeModule tập trung.
    public TopicAdminController(TopicService topicService, ObjectMapper objectMapper) {
        this.topicService = topicService;
        this.objectMapper = objectMapper;
        // Ví dụ: objectMapper.registerModule(new JavaTimeModule());
    }
    */

    @GetMapping()
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(topicService.search(keyword));
    }

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestPart("topicMetaData") String topicMetaDataStr, // << Nhận dưới dạng String
            @RequestPart("avatarFile") MultipartFile avatarFile) {

        RequestTopicDTO topicMetaData;
        try {
            topicMetaData = objectMapper.readValue(topicMetaDataStr, RequestTopicDTO.class);

            // (Tùy chọn) Nếu bạn cần validation cho các trường trong topicMetaData
            // (ví dụ @NotBlank trên DTO), bạn có thể thực hiện ở đây:
            // ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
            // jakarta.validation.Validator validator = factory.getValidator();
            // Set<ConstraintViolation<RequestTopicDTO>> violations = validator.validate(topicMetaData);
            // if (!violations.isEmpty()) {
            //     String errorMessages = violations.stream()
            //         .map(v -> v.getPropertyPath() + ": " + v.getMessage())
            //         .collect(Collectors.joining("; "));
            //     logger.warn("Lỗi validation cho topicMetaData (create): {}", errorMessages);
            //     return ResponseEntity.badRequest().body("Dữ liệu topicMetaData không hợp lệ: " + errorMessages);
            // }

        } catch (JsonProcessingException e) {
            logger.error("Lỗi parse JSON cho topicMetaData (create) từ chuỗi: '{}'. Chi tiết: {}", topicMetaDataStr, e.getMessage());
            return ResponseEntity.badRequest().body("Lỗi định dạng dữ liệu topicMetaData (JSON không hợp lệ).");
        }

        if (avatarFile == null || avatarFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Ảnh không được để trống");
        }

        // Service của bạn sẽ xử lý việc set dayCreation nếu cần
        ResponseTopicDTO response = topicService.create(topicMetaData, avatarFile);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/update", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> update(
            @RequestPart("topicMetaData") String requestTopicDTOStr, // << Nhận dưới dạng String
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) { // avatarFile là optional

        RequestTopicDTO requestTopicDTO;
        try {
            requestTopicDTO = objectMapper.readValue(requestTopicDTOStr, RequestTopicDTO.class);
            // (Tùy chọn) Thực hiện validation tương tự như create
        } catch (JsonProcessingException e) {
            logger.error("Lỗi parse JSON cho requestTopicDTO (update) từ chuỗi: '{}'. Chi tiết: {}", requestTopicDTOStr, e.getMessage());
            return ResponseEntity.badRequest().body("Lỗi định dạng dữ liệu topicMetaData (JSON không hợp lệ).");
        }

        if (requestTopicDTO.getTopicID() == null) {
            return ResponseEntity.badRequest().body("Trường 'topicID' là bắt buộc để cập nhật chủ đề.");
        }

        // Nếu client gửi part 'avatarFile' nhưng file rỗng (không phải là không gửi)
        if (avatarFile != null && avatarFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Nếu có gửi file ảnh khi cập nhật, file không được để trống.");
        }
        // Nếu avatarFile là null (client không gửi part 'avatarFile'),
        // topicService.update nên hiểu là không thay đổi ảnh.

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
        return ResponseEntity.ok("Xóa chủ đề thành công");
    }
}