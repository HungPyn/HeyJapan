package com.quafresh.web.heyjapan.dto.user.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RequestSignUp {

    @NotBlank(message = "Họ và tên không được để trống")
    private String userName;

    @NotBlank(message = "Email không được để trống")
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Email phải đúng định dạng exemple@exemple.com"
    )
    private String email;

    private String userPassword;
}
