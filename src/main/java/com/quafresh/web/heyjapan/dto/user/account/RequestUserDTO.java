package com.quafresh.web.heyjapan.dto.user.account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestUserDTO {
    private String id;
    private Integer levelId;
}
