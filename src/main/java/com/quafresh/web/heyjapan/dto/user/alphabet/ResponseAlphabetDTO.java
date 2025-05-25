package com.quafresh.web.heyjapan.dto.user.alphabet;

import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.enums.AlphabetType;
import lombok.Data;

@Data
public class ResponseAlphabetDTO {
    private Long id;

    private String urlAudio;

    private AlphabetType alphabetType;

    private String Pronunciations;

    private String AlphabetCharacter;
}
