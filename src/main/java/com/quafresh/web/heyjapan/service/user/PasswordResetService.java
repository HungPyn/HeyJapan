package com.quafresh.web.heyjapan.service.user;


import com.quafresh.web.heyjapan.dto.user.ResetPasswordDTO;

public interface PasswordResetService {
    void sendCodeToEmail(ResetPasswordDTO.ForgotPasswordRequest dto);
    boolean verifyCode(ResetPasswordDTO.VerifyCodeRequest dto);
    void resetPassword(ResetPasswordDTO.ResetPasswordRequest dto);
}
