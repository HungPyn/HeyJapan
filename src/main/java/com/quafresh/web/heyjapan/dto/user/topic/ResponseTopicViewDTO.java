package com.quafresh.web.heyjapan.dto.user.topic;

import com.quafresh.web.heyjapan.dto.user.exam.ExamResponseDTO;
import com.quafresh.web.heyjapan.dto.user.lesson.ResponseLessonDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseTopicViewDTO {
    private Integer id;
    private String name;
    private TheoryDTO theoryDTO;
    private List<ResponseLessonDTO> lessons;
    private ExamResponseDTO examResponseDTO;
}
