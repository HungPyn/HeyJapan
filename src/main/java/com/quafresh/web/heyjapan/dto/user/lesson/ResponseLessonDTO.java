package com.quafresh.web.heyjapan.dto.user.lesson;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseLessonDTO {
    private Integer id;
    private String name;
    private Boolean isComplete;

    public ResponseLessonDTO(Integer id, String name) {
        this.id = id;
        this.name = name;
    }
}
