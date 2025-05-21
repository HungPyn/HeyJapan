package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.SummaryDTO;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamResultService {
    //user
    String create(RequestExamResultDTO examResultDTO);
    ResponseExamResultDTO getExamResultByID(String userId, Integer topicId);

    //admin
    SummaryDTO getExamResultSummary(String userId);
    List<ResponseExamResultDTO> getAllById(String userId);
    ResponseExamResultDTO getById(String useId,Integer idTopic);
    List<ResponseExamResultDTO> search(String userId, String keyword);
}
