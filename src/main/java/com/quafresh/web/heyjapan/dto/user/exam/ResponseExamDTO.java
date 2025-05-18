package com.quafresh.web.heyjapan.dto.user.exam;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
