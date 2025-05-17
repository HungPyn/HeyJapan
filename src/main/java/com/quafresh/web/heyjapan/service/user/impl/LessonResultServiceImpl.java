package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.result.RequestLessonResultDTO;
import com.quafresh.web.heyjapan.dto.user.result.ResponseLessonResultDTO;
import com.quafresh.web.heyjapan.entity.Lesson;
import com.quafresh.web.heyjapan.entity.LessonResult;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.LessonRepository;
import com.quafresh.web.heyjapan.repository.LessonResultRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.LessonResultService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonResultServiceImpl implements LessonResultService {
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final LessonResultRepository lessonResultRepository;
    @Override
    public String create(RequestLessonResultDTO requestLessonResultDTO) {
        Lesson lesson = lessonRepository.findById(requestLessonResultDTO.getLessonId())
                .orElseThrow(()->new RuntimeException("Bài học không tồn tại"));

        User user = userRepository.findById(requestLessonResultDTO.getUserId())
                .orElseThrow(()->new RuntimeException("Người dùng không tồn tại"));

        LessonResult lessonResult = new LessonResult();
        lessonResult.setLesson(lesson);
        lessonResult.setUser(user);
        Instant startTime = Instant.now();
        Instant endTime = startTime.plus(Duration.ofMinutes(requestLessonResultDTO.getStudyTime()));
        lessonResult.setStartDatetime(startTime);
        lessonResult.setEndDatetime(endTime);
        lessonResult.setStudyTime(requestLessonResultDTO.getStudyTime());
        lessonResult.setCompletionPercent(requestLessonResultDTO.getCompletionPercent());
        lessonResult.setCorrectAnswers(requestLessonResultDTO.getCorrectAnswers());
        lessonResult.setTotalQuestions(requestLessonResultDTO.getTotalQuestions());
        lessonResultRepository.save(lessonResult);

        return "Kết quả bài học được thêm thành công";
    }

    @Override
    public List<ResponseLessonResultDTO> getLessonResultByTopic(String userId, Integer topicId) {
        List<Lesson> lessons = lessonRepository.findByTopicId(topicId);
        List<LessonResult> lessonResults = lessonResultRepository.findByUserIdAndLesson_Topic_Id(userId, topicId);
        Map<Integer, LessonResult> resultMap = lessonResults.stream()
                .collect(Collectors.toMap(lr -> lr.getLesson().getId(), lr -> lr));
        List<ResponseLessonResultDTO> dtos = new ArrayList<>();

        for (Lesson lesson : lessons) {
            ResponseLessonResultDTO dto = new ResponseLessonResultDTO();
            dto.setLessonId(lesson.getId());
            dto.setName(lesson.getName());

            LessonResult lr = resultMap.get(lesson.getId());

            int totalQuestions = 0;
            int correctAnswers = 0;
            int studyTime = 0;
            BigDecimal completionPercent = BigDecimal.ZERO;

            if (lr != null) {
                totalQuestions = lr.getTotalQuestions() != null ? lr.getTotalQuestions() : 0;
                correctAnswers = lr.getCorrectAnswers() != null ? lr.getCorrectAnswers() : 0;
                studyTime = lr.getStudyTime() != null ? lr.getStudyTime() : 0;

                if (totalQuestions > 0) {
                    completionPercent = BigDecimal.valueOf(correctAnswers)
                            .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));
                }
            }

            dto.setTotalQuestions(totalQuestions);
            dto.setCorrectAnswers(correctAnswers);
            dto.setStudyTime(studyTime);
            dto.setCompletionPercent(completionPercent);

            dtos.add(dto);
        }

        return dtos;
    }


    // Phần admin
    @Override
    public List<ResponseLessonResultDTO> getAllLessonResultByuserId(String userId) {
        List<ResponseLessonResultDTO> list = lessonResultRepository.getAllLessonResultByID(userId);
        if (list.isEmpty()) {
            throw new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage());
        }
        return list;
    }

    @Override
    public ResponseLessonResultDTO getLessonResultByLessonId(String userId, Integer lessonId) {
        return lessonResultRepository.getLessonResultById(userId, lessonId)
                .orElseThrow(() -> new RuntimeException(ErrorMessages.INVALID_ACCOUNT.getMessage()));
    }

    @Override
    public List<ResponseLessonResultDTO> search(String userId, String lessonName) {
        return lessonResultRepository.searchLessonResults(userId,lessonName);
    }
}
