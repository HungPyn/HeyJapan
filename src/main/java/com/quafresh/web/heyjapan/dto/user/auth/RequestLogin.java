package com.quafresh.web.heyjapan.dto.user.auth;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestLogin {
    private String email;
    private String userPassword;
}
