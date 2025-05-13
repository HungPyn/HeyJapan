package com.quafresh.web.heyjapan.dto.user.topic;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseTopicDTO {
        private Integer id;

        private Integer levelId;

        private String name;

        private String avatarUrl;

        private Instant dayCreation;


}