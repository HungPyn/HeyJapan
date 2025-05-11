package com.quafresh.web.heyjapan.dto.user.level;

import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseLevelDTO {
    private Integer id;
    private String name;

    private List<ResponseTopicDTO> topics;
}