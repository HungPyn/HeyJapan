package com.quafresh.web.heyjapan.util.validation;

import com.quafresh.web.heyjapan.dto.user.question.RequestChoiceDTO;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.util.List;

public class GenericQuestionValidator implements ConstraintValidator<ValidChoiceForQuestionType, Object> {

    @Override
    public boolean isValid(Object dto, ConstraintValidatorContext context) {
        if (dto == null) return true;

        try {
            Method getQuestionType = dto.getClass().getMethod("getQuestionType");
            Method getQuestionChoices = dto.getClass().getMethod("getQuestionChoices");

            String questionType = (String) getQuestionType.invoke(dto);
            List<?> choices = (List<?>) getQuestionChoices.invoke(dto);

            context.disableDefaultConstraintViolation();

            if (questionType == null || questionType.isBlank()) {
                context.buildConstraintViolationWithTemplate("Kiểu câu hỏi không được để trống")
                        .addPropertyNode("questionType")
                        .addConstraintViolation();
                return false;
            }

            QuestionType typeEnum;
            try {
                typeEnum = QuestionType.valueOf(questionType);
            } catch (IllegalArgumentException e) {
                context.buildConstraintViolationWithTemplate("Kiểu câu hỏi không hợp lệ")
                        .addPropertyNode("questionType")
                        .addConstraintViolation();
                return false;
            }

            if (choices == null || choices.isEmpty()) {
                context.buildConstraintViolationWithTemplate("Câu hỏi phải có ít nhất một lựa chọn")
                        .addPropertyNode("questionChoices")
                        .addConstraintViolation();
                return false;
            }

            boolean allValid = true;
            for (int i = 0; i < choices.size(); i++) {
                Object obj = choices.get(i);
                if (!(obj instanceof RequestChoiceDTO choice)) continue;

                boolean choiceValid = switch (typeEnum) {
                    case MULTIPLE_CHOICE_VOCAB_IMAGE ->
                            notBlank(choice.getTextForeign()) && notEmptyFile(choice.getImageFile()) && choice.getIsCorrect() != null;
                    case MULTIPLE_CHOICE_TEXT_ONLY -> notBlank(choice.getTextForeign()) && notBlank(choice.getTextRomaji()) && choice.getIsCorrect() != null;
                    case AUDIO_CHOICE -> notBlank(choice.getTextForeign()) && notBlank(choice.getAudioUrlForeign()) && choice.getIsCorrect() != null;
                    case WORD_ORDER -> notBlank(choice.getTextForeign()) && notBlank(choice.getTextBlock()) && choice.getIsCorrect() != null;
                };

                if (!choiceValid) {
                    context.buildConstraintViolationWithTemplate(
                                    "Lựa chọn thứ " + (i + 1) + " không hợp lệ cho kiểu câu hỏi: " + questionType)
                            .addPropertyNode("questionChoices")
                            .addBeanNode()
                            .inIterable().atIndex(i)
                            .addConstraintViolation();
                    allValid = false;
                }
            }

            return allValid;

        } catch (Exception e) {
            // Trường hợp lỗi do không có getter phù hợp
            return false;
        }
    }

    private boolean notBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }

    private boolean notEmptyFile(MultipartFile file) {
        return file != null && !file.isEmpty();
    }
}