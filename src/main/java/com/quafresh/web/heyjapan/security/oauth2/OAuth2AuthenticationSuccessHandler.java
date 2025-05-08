package com.quafresh.web.heyjapan.security.oauth2;

import com.quafresh.web.heyjapan.security.JwtTokenUtil;

import com.quafresh.web.heyjapan.security.exception.BadRequestException;
import com.quafresh.web.heyjapan.security.utils.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenUtil tokenProvider;

    @Autowired
    private AppProperties appProperties;

    @Autowired
    private CookieAuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        Optional<String> redirectUri = CookieUtils.getCookie(request, CookieAuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue);

        if(redirectUri.isPresent() && !isAuthorizedRedirectUri(redirectUri.get())) {
            throw new BadRequestException("Unauthorized Redirect URI");
        }

        String targetUrl = redirectUri.orElse(getDefaultTargetUrl());

        // Check if it's a mobile app redirect URI (contains :/ pattern)
        boolean isMobileRedirect = targetUrl.contains(":/");
        String token = tokenProvider.createToken(authentication);

        // Handle differently based on web or mobile
        if (isMobileRedirect) {
            // For mobile, append token as query parameter
            return UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("token", token)
                    .build().toUriString();
        } else {
            // For web, use the original format
            return UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("token", token)
                    .build().toUriString();
        }
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        URI clientRedirectUri = URI.create(uri);

        return appProperties.getOauth2().getAuthorizedRedirectUris()
                .stream()
                .anyMatch(authorizedRedirectUri -> {
                    // Include custom URI scheme validation for mobile apps
                    URI authorizedURI = URI.create(authorizedRedirectUri);

                    // For mobile URI schemes, just compare scheme and schemeSpecificPart
                    if (authorizedRedirectUri.contains(":/")) {
                        return authorizedURI.getScheme().equals(clientRedirectUri.getScheme()) &&
                                authorizedURI.getSchemeSpecificPart().equals(clientRedirectUri.getSchemeSpecificPart());
                    }

                    // For web URIs, compare host and port
                    return authorizedURI.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                            && (authorizedURI.getPort() == clientRedirectUri.getPort());
                });
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        cookieAuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}