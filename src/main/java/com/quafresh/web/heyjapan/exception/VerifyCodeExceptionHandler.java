package com.quafresh.web.heyjapan.exception;

import com.quafresh.web.heyjapan.util.ErrorMessages;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class VerifyCodeExceptionHandler {

    @ExceptionHandler(VerifyCodeFoundException.class)
    public ResponseEntity<Map<String, String>> handleVerifyCodeFound(VerifyCodeFoundException ex) {
        Map<String, String> error = new HashMap<>();
        HttpStatus status;

        if (ex.getReason() == VerifyCodeFoundException.Reason.NOT_FOUND) {
            error.put("error", ErrorMessages.VERIFY_CODE_NOT_FOUND.getMessage());
            status = HttpStatus.NOT_FOUND;
        } else if (ex.getReason() == VerifyCodeFoundException.Reason.EXPIRED) {
            error.put("error", ErrorMessages.VERIFY_CODE_EXPIRED.getMessage());
            status = HttpStatus.BAD_REQUEST;
        } else {
            error.put("error", "Lỗi không xác định");
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return new ResponseEntity<>(error, status);
    }
}
