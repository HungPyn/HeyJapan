package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.account.RequestUserDTO;

public interface UserService {

    String updateLevel(RequestUserDTO dto);

    //admin
    String delete(String userId);
}
