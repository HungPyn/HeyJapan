package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.alphabet.ResponseAlphabetDTO;
import com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO;
import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;
import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicViewDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Alphabets;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.*;
import com.quafresh.web.heyjapan.service.GcsStorageService;
import com.quafresh.web.heyjapan.service.user.TopicService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;
    private final LevelRepository levelRepository;
    private final UserMapper userMapper;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final ExamResultRepository examResultRepository;
    private final GcsStorageService gcsStorageService;
    private final AlphabetsRepository alphabetsRepository;

    @Override
    public ResponseLevelDTO getLevelWithTopics(Integer levelID) {
        // Lấy danh sách Topics theo Level từ cũ tới mới
        List<Topic> topics = topicRepository.findAllTopicsByLevelId(levelID);
        // Lấy thông tin Level từ level id
        Level level = levelRepository.findById(levelID)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_LEVEL.getMessage()));

        ResponseLevelDTO responseLevelDTO = userMapper.toResponseLevelDTO(level);
        List<ResponseTopicDTO> responseTopicDTOS = topics.stream().map(userMapper::toResponseTopicDTO).collect(Collectors.toList());
        responseLevelDTO.setTopics(responseTopicDTOS);
        return responseLevelDTO;

    }

    @Override
    public ResponseTopicViewDTO getTopicWithTopics(Integer topicID, String idUser) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        ResponseTopicViewDTO responseTopicViewDTO = new ResponseTopicViewDTO();
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
        responseTopicViewDTO.setId(topic.getId());
        responseTopicViewDTO.setName(topic.getName());

        TheoryDTO theoryDTO = new TheoryDTO(topic.getId(), "Lý thuyết");
        responseTopicViewDTO.setTheoryDTO(theoryDTO);

        List<Alphabets> alphabetList = alphabetsRepository.findAllByTopic_IdOrderByIdDesc(topicID);
        List<ResponseAlphabetDTO> alphabetDTOList = alphabetList.stream().map(userMapper::toResponseAlphabetDTO).toList();
        responseTopicViewDTO.setAlphabets(alphabetDTOList);

        List<ResponseLessonDTO> list = lessonRepository.findLessonsWithStatusByTopicIdAndUserId(topic.getId(), user.getId());
        responseTopicViewDTO.setLessons(list);
        ExamResponseDTO examResponseDTO = examResultRepository.getExamStatusForTopic(user.getId(), topic.getId());
        examResponseDTO.setName("Kiểm tra");
        responseTopicViewDTO.setExamResponseDTO(examResponseDTO);

        return responseTopicViewDTO;
    }

    //admin
    @Override
    public List<ResponseTopicDTO> getAllTopics() {
        List<Topic> topics = topicRepository.getAll();
        return topics.stream().map(userMapper::toResponseTopicDTO).collect(Collectors.toList());
    }

    @Override
    public List<ResponseTopicDTO> search(String keyword) {
        List<Topic> listSearch = topicRepository.searchAll(keyword);
        return listSearch.stream().map(userMapper::toResponseTopicDTO).collect(Collectors.toList());
    }


    @Override
    public ResponseTopicDTO create(RequestTopicDTO topicMetaData, MultipartFile avatarFile) {
        Level level = levelRepository.findById(topicMetaData.getLevelId()).get();
        Topic topic = new Topic();
        topic.setName(topicMetaData.getName());
        topic.setDayCreation(Instant.now());
        topic.setLevel(level);
        if (avatarFile == null || avatarFile.isEmpty()) {
            throw new RuntimeException("File avatar không được để trống.");
        }
        String originalFilename = avatarFile.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String objectName = UUID.randomUUID().toString() + fileExtension;
        try {
            gcsStorageService.uploadFileToPublicBucket(avatarFile, objectName);
        } catch (IOException e) {
            throw new RuntimeException("Cập nhật file thất bại", e);
        }
        String publicUrl = gcsStorageService.getPublicFileUrl(objectName);
        topic.setAvatarUrl(publicUrl);
        topicRepository.save(topic);
        Integer levelIdResponse = (topic.getLevel() != null) ? topic.getLevel().getId() : null;
        return new ResponseTopicDTO(topic.getId(), levelIdResponse, topic.getName(), topic.getAvatarUrl(), topic.getDayCreation());
    }

    @Override
    public ResponseTopicDTO update(RequestTopicDTO requestTopicDTO, MultipartFile avatarFile) {
        Topic topic = topicRepository.findById(requestTopicDTO.getTopicID())
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_LEVEL.getMessage()));
        String oldAvatarUrl = topic.getAvatarUrl();
        topic.setName(requestTopicDTO.getName());
        String originalFilename = avatarFile.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String objectName = UUID.randomUUID().toString() + fileExtension;
        try {
            gcsStorageService.uploadFileToPublicBucket(avatarFile, objectName);
        } catch (IOException e) {
            throw new RuntimeException("Cập nhật file thất bại", e);
        }
        String publicUrl = gcsStorageService.getPublicFileUrl(objectName);
        topic.setAvatarUrl(publicUrl);

        topicRepository.save(topic);
        return new ResponseTopicDTO(topic.getId(), topic.getLevel().getId(), topic.getName(), topic.getAvatarUrl(), topic.getDayCreation());
    }

    @Override
    public ResponseTopicDTO getById(Integer id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        return new ResponseTopicDTO(topic.getId(), topic.getLevel().getId(), topic.getName(), topic.getAvatarUrl(), topic.getDayCreation());
    }

    @Override
    public String delete(Integer topicID) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));

        String oldAvatarUrl = topic.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.isBlank()) {
            String oldObjectName = oldAvatarUrl.substring(oldAvatarUrl.lastIndexOf("/") + 1);
            try {
                gcsStorageService.deleteFile(oldObjectName);
            } catch (Exception e) {
               log.error("Không thể xóa ảnh cũ trên GCS: {}", oldObjectName, e);
                // Có thể bỏ qua hoặc throw nếu muốn rollback toàn bộ
            }
        }

        topicRepository.delete(topic);
        return "Xóa topic thành công";
    }

}
