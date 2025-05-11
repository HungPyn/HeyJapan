package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicViewDTO;

import java.util.List;

public interface TopicService {
    ResponseLevelDTO getLevelWithTopics(Integer levelID);
    ResponseTopicViewDTO getTopicWithTopics(Integer topicID,String idUser);
}
