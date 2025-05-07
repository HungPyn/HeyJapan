package com.quafresh.web.heyjapan.util;

import lombok.Getter;

@Getter
public enum ErrorMessages {
    EMAIL_ALREADY_EXISTS("Email đã được sử dụng"),
    VALIDATION_FAILED("Lỗi xác thực dữ liệu"),
    INTERNAL_SERVER_ERROR("Lỗi không xác định"),
    INVALID_ACCOUNT("Tài khoản không tồn tại"),
    INVALID_PASSWORD("Mật khẩu không chính xác");
    private final String message;
    ErrorMessages(String message) {
        this.message = message;
    }
}
