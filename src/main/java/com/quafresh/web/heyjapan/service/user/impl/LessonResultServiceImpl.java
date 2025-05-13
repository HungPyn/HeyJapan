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

import java.time.Duration;
import java.time.Instant;
import java.util.List;
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
