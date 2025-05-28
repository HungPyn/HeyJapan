package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.RequestChoiceDTO;
import com.quafresh.web.heyjapan.entity.IQuestion;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.repository.QuestionChoiceRepository;
import com.quafresh.web.heyjapan.service.GcsStorageService;
import com.quafresh.web.heyjapan.service.user.QuestionChoicesService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionChoiceImpl implements QuestionChoicesService {
    private final QuestionChoiceRepository choiceRepository;
    private final GcsStorageService gcsStorageService;

    @Override
    @Transactional
    public void saveChoices(List<RequestChoiceDTO> choices, IQuestion question) {
        for (RequestChoiceDTO dto : choices) {
            QuestionChoice choice;

            if (dto.getId() != null) {
                // Cập nhật choice đã tồn tại
                Optional<QuestionChoice> optionalChoice = choiceRepository.findById(dto.getId());
                if (optionalChoice.isEmpty()) {
                    throw new RuntimeException("Choice không tồn tại với id = " + dto.getId());
                }
                choice = optionalChoice.get();
            } else {
                // Tạo mới choice
                choice = new QuestionChoice();

                // Gán question đúng kiểu
                if (question instanceof LessonQuestion lessonQuestion) {
                    choice.setLessonQuestion(lessonQuestion);
                    choice.setExamQuestion(null);
                } else if (question instanceof ExamQuestion examQuestion) {
                    choice.setExamQuestion(examQuestion);
                    choice.setLessonQuestion(null);
                } else {
                    throw new RuntimeException("Loại câu hỏi không hợp lệ");
                }
            }

            // Cập nhật thông tin text và isCorrect
            choice.setTextForeign(dto.getTextForeign());
            choice.setTextRomaji(dto.getTextRomaji());
            choice.setAudioUrlForeign(dto.getAudioUrlForeign());
            choice.setTextBlock(dto.getTextBlock());
            choice.setIsCorrect(dto.getIsCorrect());

            // Xử lý ảnh nếu có
            MultipartFile imageFile = dto.getImageFile();
            if (imageFile != null && !imageFile.isEmpty()) {
                // Nếu choice đã có ảnh cũ, xóa ảnh đó trên GCS
                String oldImageUrl = choice.getImageUrl();
                if (oldImageUrl != null && !oldImageUrl.isBlank()) {
                    String oldObjectName = oldImageUrl.substring(oldImageUrl.lastIndexOf("/") + 1);
                    try {
                        gcsStorageService.deleteFile(oldObjectName);
                    } catch (Exception e) {
                        // Log lỗi mà không làm gián đoạn
                        System.err.println("Không thể xóa ảnh cũ trên GCS: " + oldObjectName);
                    }
                }

                String originalFilename = imageFile.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String objectName = UUID.randomUUID() + fileExtension;
                try {
                    gcsStorageService.uploadFileToPublicBucket(imageFile, objectName);
                } catch (IOException e) {
                    throw new RuntimeException("Tải ảnh lên thất bại", e);
                }
                String publicUrl = gcsStorageService.getPublicFileUrl(objectName);
                choice.setImageUrl(publicUrl);
            }

            // Lưu hoặc cập nhật vào DB
            choiceRepository.save(choice);
        }
    }

    @Override
    @Transactional
    public void deleteChoice(Integer id) {
        Optional<QuestionChoice> optionalChoice = choiceRepository.findById(id);
        if (optionalChoice.isEmpty()) {
            throw new RuntimeException("Choice không tồn tại với id = " + id);
        }
        QuestionChoice choice = optionalChoice.get();

        // Xóa ảnh trên GCS nếu có
        String imageUrl = choice.getImageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            String objectName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            try {
                gcsStorageService.deleteFile(objectName);
            } catch (Exception e) {
                System.err.println("Không thể xóa ảnh trên GCS: " + objectName);
            }
        }

        choiceRepository.delete(choice);
    }
}