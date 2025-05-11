package com.quafresh.web.heyjapan.dto.user.theory;

import lombok.AllArgsConstructor;
import lombok.Data;



@Data
@AllArgsConstructor
public class ResponseVocabularyDTO {

    private Long id;

    private String word;

    private String meaning;

    private String pronunciation;

}
