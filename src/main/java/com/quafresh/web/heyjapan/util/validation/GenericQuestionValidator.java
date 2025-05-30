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

            // Validate questionType
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

            // Validate questionChoices
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

                // Lỗi cho từng thuộc tính cụ thể, truyền đúng tên trường vào addError
                if (typeEnum == QuestionType.MULTIPLE_CHOICE_VOCAB_IMAGE) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isEmptyFile(choice.getImageFile())) {
                        addError(context, "imageFile không được để trống", "questionChoices.imageFile", i);
                        allValid = false;
                    }
                    if (choice.getIsCorrect() == null) {
                        addError(context, "isCorrect không được để trống", "questionChoices.isCorrect", i);
                        allValid = false;
                    }
                } else if (typeEnum == QuestionType.MULTIPLE_CHOICE_TEXT_ONLY) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getTextRomaji())) {
                        addError(context, "textRomaji không được để trống", "questionChoices.textRomaji", i);
                        allValid = false;
                    }
                    if (choice.getIsCorrect() == null) {
                        addError(context, "isCorrect không được để trống", "questionChoices.isCorrect", i);
                        allValid = false;
                    }
                } else if (typeEnum == QuestionType.AUDIO_CHOICE) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getAudioUrlForeign())) {
                        addError(context, "audioUrlForeign không được để trống", "questionChoices.audioUrlForeign", i);
                        allValid = false;
                    }
                    if (choice.getIsCorrect() == null) {
                        addError(context, "isCorrect không được để trống", "questionChoices.isCorrect", i);
                        allValid = false;
                    }
                } else if (typeEnum == QuestionType.WORD_ORDER) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getTextBlock())) {
                        addError(context, "textBlock không được để trống", "questionChoices.textBlock", i);
                        allValid = false;
                    }
                    if (choice.getIsCorrect() == null) {
                        addError(context, "isCorrect không được để trống", "questionChoices.isCorrect", i);
                        allValid = false;
                    }
                } else if (typeEnum == QuestionType.WRITING) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getTextRomaji())) {
                        addError(context, "textRomaji không được để trống", "questionChoices.textRomaji", i);
                        allValid = false;
                    }
                } else if (typeEnum == QuestionType.PRONUNCIATION) {
                    if (isBlank(choice.getTextForeign())) {
                        addError(context, "textForeign không được để trống", "questionChoices.textForeign", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getTextRomaji())) {
                        addError(context, "textRomaji không được để trống", "questionChoices.textRomaji", i);
                        allValid = false;
                    }
                    if (isBlank(choice.getAudioUrlForeign())) {
                        addError(context, "audioUrlForeign không được để trống", "questionChoices.audioUrlForeign", i);
                        allValid = false;
                    }
                    if (choice.getIsCorrect() == null) {
                        addError(context, "isCorrect không được để trống", "questionChoices.isCorrect", i);
                        allValid = false;
                    }
                }
            }

            return allValid;

        } catch (Exception e) {
            return false;
        }
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

    private boolean isEmptyFile(MultipartFile file) {
        return file == null || file.isEmpty();
    }

    private void addError(ConstraintValidatorContext context, String message, String field, int index) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(field)  // truyền đúng tên trường con, ví dụ questionChoices.textForeign
                .addBeanNode()
                .inIterable().atIndex(index)
                .addConstraintViolation();
    }
}
