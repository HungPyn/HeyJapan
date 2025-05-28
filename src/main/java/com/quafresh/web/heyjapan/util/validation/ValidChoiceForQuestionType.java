package com.quafresh.web.heyjapan.util.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Constraint(validatedBy = GenericQuestionValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidChoiceForQuestionType {
    String message() default "Lựa chọn không hợp lệ cho kiểu câu hỏi";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}


