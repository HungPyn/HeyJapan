package com.quafresh.web.heyjapan.dto.user.exam;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestExamQuestion {
    private Integer topicId;
    private String questionType;
    private String promptTextTemplate;
    private String targetWordNative;
    private String targetLanguageCode;
    private String optinasLanguageCode;
    private String audioUrlExam;
}
