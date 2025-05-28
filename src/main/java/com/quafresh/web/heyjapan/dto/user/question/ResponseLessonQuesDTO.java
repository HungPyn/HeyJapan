package com.quafresh.web.heyjapan.dto.user.question;


import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseLessonQuesDTO {
        private Integer id;

        private QuestionType questionType;

        private String promptTextTemplate;

        private String targetWordNative;

        private String targetLanguageCode;

        private String optionsLanguageCode;

        private String audioUrlQuestions;


        private List<QuestionChoiceDTO> questionChoices;
}
