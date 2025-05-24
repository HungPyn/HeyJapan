package com.quafresh.web.heyjapan.dto.user.exam;

import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseExamDTO {
    private Integer topicID;
    private String questionType;
    private String promptTextTemplate;
    private String targetWordNative;
    private String targetLanguageCode;
    private String optionsLanguageCode;
    private String audioUrlExam;
    private List<QuestionChoiceDTO> questionChoices;
}
