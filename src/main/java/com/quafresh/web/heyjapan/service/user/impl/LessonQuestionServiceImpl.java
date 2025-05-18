package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.entity.LessonQuestion;
import com.quafresh.web.heyjapan.repository.LessonQuestionRepository;
import com.quafresh.web.heyjapan.service.user.LessonQuestionService;
import com.quafresh.web.heyjapan.util.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonQuestionServiceImpl implements LessonQuestionService {

    private final LessonQuestionRepository lessonQuestionRepository;
    private final UserMapper userMapper;

    @Override
    public List<ResponseLessonQuesDTO> getQuestionsAndChoicesForLesson(Integer lessonId) {
        List<LessonQuestion> list = lessonQuestionRepository.findQuestionsAndChoicesByLessonId(lessonId);
        return list.stream().map(userMapper::toResponseLessonQuesDTO).collect(Collectors.toList());
    }

    //admin
    @Override
    public void create(ResponseLessonQuesDTO responseLessonQuesDTO) {
    }

    @Override
    public void update(ResponseLessonQuesDTO responseLessonQuesDTO) {

    }

    @Override
    public void getById(Integer id) {

    }

    @Override
    public void deleteById(Integer id) {

    }


}
