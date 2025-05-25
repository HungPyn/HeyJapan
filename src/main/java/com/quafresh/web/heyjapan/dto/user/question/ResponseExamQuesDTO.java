package com.quafresh.web.heyjapan.dto.user.question;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseExamQuesDTO {

    private Integer id;

    private String questionType;

    private String promptTextTemplate;

    private String targetWordNative;

    private String targetLanguageCode;

    private String optionsLanguageCode;

    private String audioUrlExam;

    private List<QuestionChoiceDTO> questionChoices;
}
