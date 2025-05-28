package com.quafresh.web.heyjapan.service.user;


import com.quafresh.web.heyjapan.dto.user.question.QuestionChoiceDTO;
import com.quafresh.web.heyjapan.dto.user.question.RequestChoiceDTO;
import com.quafresh.web.heyjapan.entity.IQuestion;
import com.quafresh.web.heyjapan.entity.LessonQuestion;

import java.util.List;

public interface QuestionChoicesService {
    void saveChoices(List<RequestChoiceDTO> choices, IQuestion question);
    void deleteChoice(Integer id);

}
