package com.taskhub.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
@RequiredArgsConstructor
@Slf4j
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtProvider jwtProvider;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null;
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) throws Exception {

        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);

        if (request == null) {
            throw new IllegalArgumentException("HttpServletRequest is required");
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || authHeader.isEmpty()) {
            log.warn("Missing Authorization header");
            throw new IllegalArgumentException("Authorization header is required");
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.warn("Invalid Authorization header format");
            throw new IllegalArgumentException("Authorization header must start with 'Bearer '");
        }

        String token = authHeader.substring(7); // Remove "Bearer "

        if (!jwtProvider.validateToken(token)) {
            log.warn("Invalid or expired token");
            throw new IllegalArgumentException("Invalid or expired token");
        }

        Long userId = jwtProvider.getUserIdFromToken(token);
        log.info("Resolved userId from token: {}", userId);

        return userId;
    }
}
