package com.quafresh.web.heyjapan.dto.user;

import lombok.Data;

public class ResetPasswordDTO {

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class VerifyCodeRequest{
        private String email;

        private String code;
    }

    @Data
    public static class ResetPasswordRequest{

        private String email;
        private String code;
        private String newPassword;
    }
}
