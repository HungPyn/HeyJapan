package com.quafresh.web.heyjapan.util;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NotEmptyFileValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface NotEmptyFile {
    String message() default "File không được để trống";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

