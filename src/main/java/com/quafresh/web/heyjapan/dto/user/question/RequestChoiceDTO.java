package com.quafresh.web.heyjapan.dto.user.question;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestChoiceDTO {

    private Integer id;

    private String textForeign;

    private String textRomaji;

    private MultipartFile imageFile;

    private String audioUrlForeign;

    private String textBlock;

    @NotNull(message = "Cần xác định lựa chọn đúng hay sai")
    private Boolean isCorrect;

}
