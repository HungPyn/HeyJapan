package com.quafresh.web.heyjapan.controller.storage;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.StorageException;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.GcsStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class TestStorage {

    private final GcsStorageService gcsStorageService;
    private final UserRepository userRepository; // Giả sử bạn có repository

    @PostMapping("/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = UUID.randomUUID().toString() + fileExtension;
            gcsStorageService.uploadFileToPublicBucket(file, objectName);
            String publicUrl = gcsStorageService.getPublicFileUrl(objectName);
            user.setProfilePictureUrl(publicUrl);
            userRepository.save(user);
            return ResponseEntity.ok().body(Map.of(
                    "message", "File uploaded successfully",
                    "objectName", objectName,
                    "tempAccessUrl", publicUrl.toString()
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file: " + e.getMessage());
        } catch (StorageException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("GCS Error: " + e.getMessage());
        }
    }
}
