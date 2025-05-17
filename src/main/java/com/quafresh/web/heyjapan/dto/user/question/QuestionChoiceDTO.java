package com.quafresh.web.heyjapan.dto.user.question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
