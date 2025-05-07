package com.quafresh.web.heyjapan.util;

import com.quafresh.web.heyjapan.dto.user.auth.RequestSignUp;
import com.quafresh.web.heyjapan.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Chuyển từ User sang RequestSignUp
    RequestSignUp convertRequestSignUp(User user);

    // Chuyển từ RequestSignUp sang User
    @Mapping(source = "userName", target = "userName")
    @Mapping(source = "userPassword", target = "userPassword")
    @Mapping(source = "email", target = "email")
    User convertUser(RequestSignUp requestSignUp);
}
