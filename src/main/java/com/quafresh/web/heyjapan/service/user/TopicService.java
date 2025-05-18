package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.level.ResponseLevelDTO;
import com.quafresh.web.heyjapan.dto.user.topic.RequestTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicDTO;
import com.quafresh.web.heyjapan.dto.user.topic.ResponseTopicViewDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TopicService {
    ResponseLevelDTO getLevelWithTopics(Integer levelID);
    ResponseTopicViewDTO getTopicWithTopics(Integer topicID,String idUser);

    //admin
    List<ResponseTopicDTO> getAllTopics();
    List<ResponseTopicDTO> search(String keyword);
    ResponseTopicDTO create(RequestTopicDTO requestTopicDTO, MultipartFile file);
    ResponseTopicDTO update(RequestTopicDTO requestTopicDTO,MultipartFile file);
    ResponseTopicDTO getById(Integer id);
    String delete(Integer topicID);

}
