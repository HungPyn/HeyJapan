package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.result.RequestExamResultDTO;
import com.quafresh.web.heyjapan.entity.ExamResult;
import com.quafresh.web.heyjapan.entity.Topic;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.ExamResultRepository;
import com.quafresh.web.heyjapan.repository.TopicRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.ExamResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

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
}
