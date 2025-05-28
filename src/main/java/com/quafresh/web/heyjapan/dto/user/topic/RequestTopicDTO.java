package com.quafresh.web.heyjapan.dto.user.topic;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestTopicDTO {

        @NotBlank(message = "Tên chủ đề không được để trống")
        private String name;

        private Instant dayCreation;

        private Integer levelId;

        private Integer topicID;
}
