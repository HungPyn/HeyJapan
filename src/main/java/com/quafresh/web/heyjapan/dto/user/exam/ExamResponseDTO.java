package com.quafresh.web.heyjapan.dto.user.exam;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamResponseDTO {
    private Integer id;

    private Boolean isComplete;
    private String name;
    public ExamResponseDTO(Integer id, Boolean isComplete) {
        this.id = id;
        this.isComplete = isComplete;
    }
}
