package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO;
import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;
import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicViewDTO;
import com.quafresh.web.heyjapan.dto.user.topic.TheoryDTO;
import com.quafresh.web.heyjapan.entity.Level;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.*;
import com.quafresh.web.heyjapan.service.GcsStorageService;
import com.quafresh.web.heyjapan.service.user.TopicService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;
    private final LevelRepository levelRepository;
    private final UserMapper userMapper;
    private final LessonRepository lessonRepository;
    private final UserRepository  userRepository;
    private final ExamResultRepository examResultRepository;
    private final GcsStorageService gcsStorageService;
    @Override
    public ResponseLevelDTO getLevelWithTopics(Integer levelID) {
        // Lấy danh sách Topics theo Level từ cũ tới mới
        List<Topic> topics = topicRepository.findAllTopicsByLevelId(levelID);
        // Lấy thông tin Level từ level id
        Level level = levelRepository.findById(levelID)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LEVEL.getMessage()));

        ResponseLevelDTO responseLevelDTO = userMapper.toResponseLevelDTO(level);
        List<ResponseTopicDTO> responseTopicDTOS = topics.stream().map(userMapper::toResponseTopicDTO).collect(Collectors.toList());
        responseLevelDTO.setTopics(responseTopicDTOS);
        return responseLevelDTO;

    }

    @Override
    public ResponseTopicViewDTO getTopicWithTopics(Integer topicID, String idUser) {
        Topic topic = topicRepository.findById(topicID)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));
        ResponseTopicViewDTO responseTopicViewDTO = new ResponseTopicViewDTO();
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
        responseTopicViewDTO.setId(topic.getId());
        responseTopicViewDTO.setName(topic.getName());

        TheoryDTO theoryDTO = new TheoryDTO(topic.getId(),"Lý thuyết");
        responseTopicViewDTO.setTheoryDTO(theoryDTO);

        List<ResponseLessonDTO> list = lessonRepository.findLessonsWithStatusByTopicIdAndUserId(topic.getId(),user.getId());
        responseTopicViewDTO.setLessons(list);
        ExamResponseDTO examResponseDTO = examResultRepository.getExamStatusForTopic(user.getId(),topic.getId());
        examResponseDTO.setName("Kiểm tra");
        responseTopicViewDTO.setExamResponseDTO(examResponseDTO);
        return responseTopicViewDTO;
    }

    //admin
    @Override
    public ResponseTopicDTO create(RequestTopicDTO requestTopicDTO) {
        Topic topic = new Topic();
        topic.setName(requestTopicDTO.getName());
        topic.setDayCreation(Instant.now());
        String originalFilename = requestTopicDTO.getAvatar().getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String objectName = UUID.randomUUID().toString() + fileExtension;

        try {
            gcsStorageService.uploadFileToPublicBucket(requestTopicDTO.getAvatar(), objectName);
        } catch (IOException e) {
            throw new RuntimeException("Cập nhập file thất bại", e);
        }
        String publicUrl = gcsStorageService.getPublicFileUrl(objectName);
        topic.setAvatarUrl(publicUrl);
        topicRepository.save(topic);
        return new ResponseTopicDTO(topic.getId(),topic.getName(),topic.getAvatarUrl(),topic.getDayCreation());
    }

    @Override
    public ResponseTopicDTO update(RequestTopicDTO requestTopicDTO) {
        return null;
    }

    @Override
    public RequestTopicDTO getById(Integer id) {
        return null;
    }

    @Override
    public String delete(Integer topicID) {
        return "";
    }
}
