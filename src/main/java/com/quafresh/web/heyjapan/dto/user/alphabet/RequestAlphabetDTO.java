package com.quafresh.web.heyjapan.dto.user.alphabet;


import com.quafresh.web.heyjapan.entity.enums.AlphabetType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RequestAlphabetDTO {

    @NotBlank(message = "Link audio không được trống")
    @Size(max = 255, message = "Link audio không được vượt quá 255 ký tự")
    private String urlAudio;

    @NotNull(message = "Loại bảng chữ cái không được để trống")
    private AlphabetType alphabetType;

    @NotBlank(message = "Phát âm không được trống")
    @Size(max = 255, message = "Phát âm không được vượt quá 255 ký tự")
    private String pronunciations;

    @NotBlank(message = "Ký tự không được trống")
    @Pattern(regexp = "^[\\p{IsHiragana}\\p{IsKatakana}\\p{IsHan}ー]+$", message = "Ký tự phải là chữ Nhật")
    @Size(max = 255, message = "Ký tự bảng chữ cái không được vượt quá 255 ký tự")
    private String alphabetCharacter;

    @NotNull(message = "Chủ đề không được để trống")
    @Min(value = 1, message = "Chủ đề không hợp lệ")
    private Integer topic;
}
