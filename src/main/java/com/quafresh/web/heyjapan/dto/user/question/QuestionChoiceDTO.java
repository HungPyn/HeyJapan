package com.quafresh.web.heyjapan.dto.user.question;

import com.quafresh.web.heyjapan.dto.user.exam.ResponseExamDTO;
import com.quafresh.web.heyjapan.entity.ExamQuestion;
import com.quafresh.web.heyjapan.entity.QuestionChoice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionChoiceDTO {
        private Integer id;

        private String textForeign;

        private String textRomaji;

        private String imageUrl;

        private String audioUrlForeign;

        private String textBlock;

        private Boolean isCorrect;
}
