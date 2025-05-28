package com.quafresh.web.heyjapan.util;

import lombok.Getter;

@Getter
public enum ErrorMessages {
    EMAIL_ALREADY_EXISTS("Email đã được sử dụng"),
    VALIDATION_FAILED("Lỗi xác thực dữ liệu"),
    INTERNAL_SERVER_ERROR("Lỗi không xác định"),
    INVALID_ACCOUNT("Tài khoản không tồn tại"),
    INVALID_PASSWORD("Mật khẩu không chính xác"),
    INVALID_TOPIC("Chủ đề không tồn tại"),
    INVALID_LEVEL("Cấp độ không tồn tại"),
    DELETE_ACCOUNT("Tài khoán đã được xóa"),
    INVALID_ALPHABET("Chữ cái không tồn tại"),
    INVALID_LESSON_QUESTION("Câu hỏi không tồn tại"),
    INVALID_EXAM_QUESTION("Câu hỏi kiểm tra không tồn tại"),
    INVALID_LESSON("Bài học không tồn tại");
    private final String message;
    ErrorMessages(String message) {
        this.message = message;
    }
}
