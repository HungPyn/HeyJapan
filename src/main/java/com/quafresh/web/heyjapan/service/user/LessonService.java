package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.lesson.RequestLessonDTO;
import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;

import java.util.List;

public interface LessonService {
    List<ResponseLessonDTO> getAll(Integer topicId );
    List<ResponseLessonDTO> getAllASC(Integer topicId );
    
    void create(RequestLessonDTO requestLessonDTO);
    void update(Integer lessonId,RequestLessonDTO requestLessonDTO);
    ResponseLessonDTO getById(Integer lessonId);
    void delete(Integer lessonId);

}
