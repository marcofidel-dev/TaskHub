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

        boolean required = parameter.getParameterAnnotation(CurrentUser.class).required();

        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);

        if (request == null) {
            log.error("HttpServletRequest is null");
            if (required) throw new IllegalArgumentException("HttpServletRequest is required");
            return null;
        }

        String authHeader = request.getHeader("Authorization");
        log.info("[CurrentUser] Authorization header: {}", authHeader);

        if (authHeader == null || authHeader.isEmpty()) {
            log.warn("[CurrentUser] Missing Authorization header");
            if (required) throw new IllegalArgumentException("Authorization header is required");
            return null;
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.warn("[CurrentUser] Invalid Authorization header format: {}", authHeader);
            if (required) throw new IllegalArgumentException("Authorization header must start with 'Bearer '");
            return null;
        }

        String token = authHeader.substring(7);
        log.info("[CurrentUser] Token extracted (first 20 chars): {}...", token.length() > 20 ? token.substring(0, 20) : token);

        boolean valid = jwtProvider.validateToken(token);
        log.info("[CurrentUser] Token valid: {}", valid);

        if (!valid) {
            log.warn("[CurrentUser] Invalid or expired token");
            if (required) throw new IllegalArgumentException("Invalid or expired token");
            return null;
        }

        Long userId = jwtProvider.getUserIdFromToken(token);
        log.info("[CurrentUser] UserId from token: {}", userId);

        return userId;
    }
}
