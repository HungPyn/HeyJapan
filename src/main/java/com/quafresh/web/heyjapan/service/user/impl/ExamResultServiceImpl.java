package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO;
import com.quafresh.web.heyjapan.entity.ExamResult;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.ExamResultRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamResultServiceImpl implements ExamResultService {
    private final ExamResultRepository examResultRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Override
    public String create(RequestExamResultDTO examResultDTO) {
        Topic topic = topicRepository.findById(examResultDTO.getTopicId())
                .orElseThrow(()->new RuntimeException("Topic không tồn tại"));

        User user = userRepository.findById(examResultDTO.getUserId())
                .orElseThrow(()->new RuntimeException("Người dùng không tồn tại"));

        ExamResult examResult = new ExamResult();
        examResult.setTopic(topic);
        examResult.setUser(user);
        examResult.setExamTime(examResultDTO.getExamTime());
        examResult.setScorePercent(examResultDTO.getScorePercent());
        examResult.setCorrectAnswers(examResultDTO.getCorrectAnswers());
        examResult.setTotalQuestions(examResultDTO.getTotalQuestions());
        Instant startTime = Instant.now();
        Instant endTime = startTime.plus(Duration.ofMinutes(examResultDTO.getExamTime()));
        examResult.setStartDatetime(startTime);
        examResult.setEndDatetime(endTime);
        examResultRepository.save(examResult);
        return "Kết quả kiểm tra thêm thành công";
    }
    @Override
    public ResponseExamResultDTO getExamResultByID(String userId, Integer topicId) {
        ExamResult examResult = examResultRepository.findByUserIdAndTopicId(userId,topicId).orElse(null);
        ResponseExamResultDTO dto = new ResponseExamResultDTO();
        if (examResult == null) {
            dto.setTotalQuestions(0);
            dto.setScorePercent(BigDecimal.ZERO);
            dto.setCorrectAnswers(0);
            dto.setExamTime(0);
        } else {
            dto.setTotalQuestions(examResult.getTotalQuestions());
            dto.setScorePercent(examResult.getScorePercent());
            dto.setCorrectAnswers(examResult.getCorrectAnswers());
            dto.setExamTime(examResult.getExamTime());
        }

        return dto;
    }

    //admin
    @Override
    public List<ResponseExamResultDTO> getAllById(String userId) {
        List<ResponseExamResultDTO> list = examResultRepository.getAllExamResultByUserId(userId);
        if (list.isEmpty()) {
            throw new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage());
        }
        return list;
    }

    @Override
    public ResponseExamResultDTO getById(String useId, Integer idTopic) {
        ResponseExamResultDTO dto = examResultRepository.getExamResultByTopicId(useId,idTopic)
                .orElseThrow(()->new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
        return dto;
    }

    @Override
    public List<ResponseExamResultDTO> search(String userId, String keyword) {
        return examResultRepository.searchExamResultsByUserIdAndKeyword(userId,keyword);
    }
}
