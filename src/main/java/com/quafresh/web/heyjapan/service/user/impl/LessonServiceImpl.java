package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.lesson.RequestLessonDTO;
import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;
import com.quafresh.web.heyjapan.entity.Lesson;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.repository.LessonRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.service.user.LessonService;
import com.quafresh.web.heyjapan.service.user.TopicService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    @Override
    public List<ResponseLessonDTO> getAll(Integer topicId) {
        List<Lesson> lessonList = lessonRepository.getAllLessonsByTopicId(topicId);
        return lessonList.stream()
                .map(lesson
                        -> new ResponseLessonDTO(lesson.getId(),lesson.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseLessonDTO> getAllASC(Integer topicId) {
        List<Lesson> lessonList = lessonRepository.findAllByTopic_IdOrderByDayCreationAsc(topicId);
        return lessonList.stream()
                .map(lesson
                        -> new ResponseLessonDTO(lesson.getId(),lesson.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public void create(RequestLessonDTO requestLessonDTO) {
        Topic topic = topicRepository.findById(requestLessonDTO.getTopicId())
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_TOPIC.getMessage()));

        Lesson lesson = new Lesson();
        lesson.setName(requestLessonDTO.getName());
        Instant createDay = Instant.now();
        lesson.setTopic(topic);
        lesson.setDayCreation(createDay);
        lessonRepository.save(lesson);
    }

    @Override
    public void update(Integer lessonId,RequestLessonDTO requestLessonDTO) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LESSON.getMessage()));
        lesson.setName(requestLessonDTO.getName());
        lessonRepository.save(lesson);

    }

    @Override
    public ResponseLessonDTO getById(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LESSON.getMessage()));
        return new ResponseLessonDTO(lesson.getId(),lesson.getName());
    }

    @Override
    public void delete(Integer lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_LESSON.getMessage()));
        lessonRepository.delete(lesson);
    }
}
