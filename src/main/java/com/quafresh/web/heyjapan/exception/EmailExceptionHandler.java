package com.quafresh.web.heyjapan.exception;

import com.quafresh.web.heyjapan.util.ErrorMessages;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class EmailExceptionHandler {

    // Xử lý email đã tồn tại
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String,String>> handleEmailException(EmailAlreadyExistsException ex){
        Map<String, String> error = new HashMap<>();
        error.put("error", ErrorMessages.EMAIL_ALREADY_EXISTS.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
