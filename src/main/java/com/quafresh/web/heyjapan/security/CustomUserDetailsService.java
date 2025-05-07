package com.quafresh.web.heyjapan.security;

import com.quafresh.web.heyjapan.entity.User;
import com.quafresh.web.heyjapan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm người dùng qua email, đảm bảo trả về Optional<User>
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Phân quyền (role) cho người dùng
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.isUserRole() ? "ROLE_ADMIN" : "ROLE_USER"));

        // Trả về đối tượng UserDetails
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getUserPassword(),authorities);
    }
}
