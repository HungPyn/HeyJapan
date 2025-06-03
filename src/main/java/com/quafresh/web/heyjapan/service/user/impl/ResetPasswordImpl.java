package com.quafresh.web.heyjapan.service.user.impl;

import com.quafresh.web.heyjapan.dto.user.ResetPasswordDTO;
import com.quafresh.web.heyjapan.entity.PasswordResetToken;
import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.exception.EmailNotFoundException;
import com.quafresh.web.heyjapan.exception.VerifyCodeFoundException;
import com.quafresh.web.heyjapan.repository.ResetPasswordRepository;
import com.quafresh.web.heyjapan.repository.UserRepository;
import com.quafresh.web.heyjapan.service.user.PasswordResetService;
import com.quafresh.web.heyjapan.util.ErrorMessages;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ResetPasswordImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final ResetPasswordRepository resetPasswordRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Gửi mã xác nhận
    @Override
    public void sendCodeToEmail(ResetPasswordDTO.ForgotPasswordRequest dto) {
        Optional<User> user = userRepository.findByEmail(dto.getEmail());
        if (user.isEmpty()) {
            throw new EmailNotFoundException(ErrorMessages.EMAIL_INVALID.getMessage());
        }

        String code = String.format("%06d", new Random().nextInt(1000000));
        Instant createdAt = Instant.now();

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setEmail(dto.getEmail());
        passwordResetToken.setCode(code);
        passwordResetToken.setCreateAt(createdAt);
        passwordResetToken.setStatus(false);
        resetPasswordRepository.save(passwordResetToken);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("your_email@example.com");
            helper.setTo(dto.getEmail());
            helper.setSubject("🔐 Mã xác nhận đặt lại mật khẩu");

            String htmlContent = """
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c3e50;">Xác nhận đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Dưới đây là mã xác nhận của bạn:</p>
                <div style="font-size: 24px; font-weight: bold; color: #e74c3c; margin: 20px 0;">%s</div>
                <p>Mã này sẽ hết hạn trong <strong>10 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">Email được gửi từ hệ thống. Vui lòng không trả lời.</p>
            </div>
        """.formatted(code);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi mã xác nhận qua email. Vui lòng thử lại sau.", e);
        }
    }


    // Kiểm tra mã
    @Override
    public boolean verifyCode(ResetPasswordDTO.VerifyCodeRequest dto) {
        PasswordResetToken token = resetPasswordRepository
                .findByEmailAndCodeAndStatusIsFalse(dto.getEmail(), dto.getCode())
                .orElseThrow(() -> new VerifyCodeFoundException("Mã xác nhận không tồn tại", VerifyCodeFoundException.Reason.NOT_FOUND));

        if (token.getCreateAt().isBefore(Instant.now().minus(Duration.ofMinutes(10)))) {
            throw new VerifyCodeFoundException("Mã xác nhận đã hết hạn", VerifyCodeFoundException.Reason.EXPIRED);
        }

        return true; // mã hợp lệ
    }

    // Đặt lại mật khẩu
    @Transactional
    @Override
    public void resetPassword(ResetPasswordDTO.ResetPasswordRequest dto) {
        PasswordResetToken token = resetPasswordRepository
                .findByEmailAndCodeAndStatusIsFalse(dto.getEmail(), dto.getCode())
                .orElseThrow(() -> new VerifyCodeFoundException(
                        ErrorMessages.VERIFY_CODE_NOT_FOUND.getMessage(),
                        VerifyCodeFoundException.Reason.NOT_FOUND
                ));

        // Kiểm tra thời gian
        if (token.getCreateAt().isBefore(Instant.now().minus(Duration.ofMinutes(10)))) {
            throw new VerifyCodeFoundException(
                    ErrorMessages.VERIFY_CODE_EXPIRED.getMessage(),
                    VerifyCodeFoundException.Reason.EXPIRED
            );
        }
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new EmailNotFoundException(ErrorMessages.EMAIL_INVALID.getMessage()));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        token.setStatus(true); // Đánh dấu mã đã sử dụng
        resetPasswordRepository.save(token);
    }
}
