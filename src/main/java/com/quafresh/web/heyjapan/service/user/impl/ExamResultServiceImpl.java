package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseExamResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.SummaryDTO;
import com.quafresh.web.heyjapan.entity.ExamResult;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.ExamResultRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import com.quafresh.web.heyjapan.service.user.SummaryHelper;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

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
        Optional<ExamResult> examResult = examResultRepository.findFirstByUserIdAndTopicIdOrderByScorePercentDesc(userId, topicId);
        ResponseExamResultDTO dto = new ResponseExamResultDTO();

        if (examResult.isPresent()) {
            ExamResult er = examResult.get();
            dto.setTotalQuestions(er.getTotalQuestions());
            dto.setScorePercent(er.getScorePercent());
            dto.setCorrectAnswers(er.getCorrectAnswers());
            dto.setExamTime(er.getExamTime());
        } else {
            dto.setTotalQuestions(0);
            dto.setScorePercent(BigDecimal.ZERO);
            dto.setCorrectAnswers(0);
            dto.setExamTime(0);
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
    public SummaryDTO getExamResultSummary(String userId) {
        List<ResponseExamResultDTO> results = getAllById(userId).stream()
                .filter(dto -> dto.getExamTime() != null && dto.getExamTime() > 0)
                .toList();

        return SummaryHelper.calculateSummary(
                results,
                dto -> {
                    int totalQuestions = dto.getTotalQuestions();
                    int correctAnswers = Optional.ofNullable(dto.getCorrectAnswers()).orElse(0);
                    return totalQuestions > 0
                            ? BigDecimal.valueOf((double) correctAnswers * 100 / totalQuestions).setScale(2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                },
                dto -> Optional.ofNullable(dto.getScorePercent()).orElse(BigDecimal.ZERO),
                dto -> Optional.ofNullable(dto.getExamTime()).orElse(0)
        );
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
