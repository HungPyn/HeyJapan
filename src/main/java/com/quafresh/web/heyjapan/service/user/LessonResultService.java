package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.question.ResponseLessonQuesDTO;
import com.quafresh.web.heyjapan.dto.user.result.RequestLessonResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO;

import java.util.List;

public interface LessonResultService {
    String create(RequestLessonResultDTO requestLessonResultDTO);

    //admin
    List<ResponseLessonResultDTO> getAllLessonResultByuserId(String userId);
    ResponseLessonResultDTO getLessonResultByLessonId(String userId,Integer lessonId);
    List<ResponseLessonResultDTO> search(String userId,String lessonName);
}
