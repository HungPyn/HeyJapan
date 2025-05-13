package com.quafresh.web.heyjapan.service.user;

import com.quafresh.web.heyjapan.dto.user.account.RequestUserDTO;
import com.quafresh.web.heyjapan.dto.user.account.ResponseUserDTO;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserService {

    String updateLevel(RequestUserDTO dto);

    //admin
    List<ResponseUserDTO> getAll();
    String delete(String userId);
    List<ResponseUserDTO> search(String keyword);
}
