package com.quafresh.web.heyjapan.exception;

import com.quafresh.web.heyjapan.util.ErrorMessages;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi validate chung
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error) -> {
            // Kiểm tra null trước khi gọi getDefaultMessage
            String errorMessage = error.getDefaultMessage() != null ? error.getDefaultMessage() : "Lỗi không xác định";
            errors.put(error.getField(), errorMessage);
        });

        // Trả về thông báo validation theo map
        // Kiểm tra null cho lỗi chung nếu có
        String generalErrorMessage = ex.getBindingResult().getFieldError() != null
                && ex.getBindingResult().getFieldError().getDefaultMessage() != null
                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                : "Lỗi không xác định";

        errors.put("error", generalErrorMessage);
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
