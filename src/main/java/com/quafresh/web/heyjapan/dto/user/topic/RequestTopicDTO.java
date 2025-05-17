package com.quafresh.web.heyjapan.dto.user.topic;

import com.quafresh.web.heyjapan.entity.*;
import com.quafresh.web.heyjapan.util.NotEmptyFile;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;


import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestTopicDTO {

        @NotBlank(message = "Tên chủ đề không được để trống")
        private String name;

        private Instant dayCreation;

        private Integer levelId;

}
