package com.quafresh.web.heyjapan.dto.user.lesson;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.checkerframework.checker.units.qual.A;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestLessonDTO {
    @NotBlank(message = "Bài học không được trống")
    String name;
    Integer topicId;
}
