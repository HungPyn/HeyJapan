package com.quafresh.web.heyjapan.dto.user.theory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestGrammarDTO {
    private Long id;

    private String structure;

    private String explanation;

    private String example;

    private String urlAudio;
}
