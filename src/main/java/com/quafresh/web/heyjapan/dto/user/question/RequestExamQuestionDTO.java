package com.quafresh.web.heyjapan.dto.user.question;

import com.quafresh.web.heyjapan.util.validation.ValidChoiceForQuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ValidChoiceForQuestionType
public class RequestExamQuestionDTO {

    private Integer topicId;

    @NotBlank(message = "Loại câu hỏi không được để trống")
    private String questionType;

    @NotBlank(message = "Câu hoi không được trống")
    private String promptTextTemplate;

    @NotBlank(message = "Từ khóa không được để trống")
    private String targetWordNative;

    private String targetLanguageCode;

    private String optionsLanguageCode;

    @NotBlank(message = "Audio không được trống")
    private String audioUrlExam;

    @NotEmpty(message = "Câu hỏi phải có ít nhất một lựa chọn")
    @Size(min = 2, message = "Câu hỏi phải có ít nhất 2 lựa chọn")
    @Valid
    private List<RequestChoiceDTO> questionChoices;
}
