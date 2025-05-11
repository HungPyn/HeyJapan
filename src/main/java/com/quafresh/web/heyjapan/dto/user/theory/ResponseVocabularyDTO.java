package com.quafresh.web.heyjapan.dto.user.theory;

import com.quafresh.web.heyjapan.entity.Topic;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;


@Data
@AllArgsConstructor
public class ResponseVocabularyDTO {

    private Long id;

    private String word;

    private String meaning;

    private String pronunciation;

}
