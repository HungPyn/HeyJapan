package com.quafresh.web.heyjapan.dto.user.lesson;

import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestLessonQuestionDTO {
    private Integer lessonId;
    private Integer lessonQuestionID;
    private String questionType;
    private String promptTextTemplate;
    private String targetWordNative;
    private String targetLanguageCode;
    private String optionsLanguageCode;
    private List<QuestionChoiceDTO> questionChoices;
    private String audioUrlQuestions;
}
