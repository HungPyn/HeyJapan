package com.quafresh.web.heyjapan.dto.user.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestLessonQuesDTO {

    private String questionType;

    private String promptTextTemplate;

    private String targetWordNative;

    private String targetLanguageCode;

    private String optionsLanguageCode;

    private List<QuestionChoiceDTO> questionChoices;
}
