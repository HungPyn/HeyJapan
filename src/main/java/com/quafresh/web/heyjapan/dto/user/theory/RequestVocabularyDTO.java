package com.quafresh.web.heyjapan.dto.user.theory;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestVocabularyDTO {
    private Long id;

    @NotBlank(message = "Từ không được để trống")
    private String word;

    @NotBlank(message = "Nghĩa không được trống")
    private String meaning;

    @NotBlank(message = "Phát âm không được trống")
    private String pronunciation;

    @NotBlank(message = "Am thanh khong duoc de trong")
    private String urlAudio;
}
