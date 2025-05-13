
package com.quafresh.web.heyjapan.dto.user.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse2 {
    private String email;
    private String name;
    // Bạn có thể thêm token của hệ thống mình ở đây nếu muốn
    // private String appToken;
    private String message;
}
