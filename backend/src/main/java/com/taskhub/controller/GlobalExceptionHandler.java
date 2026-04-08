package com.taskhub.controller;

import com.taskhub.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        String message = e.getMessage();
        String path = getRequest().getRequestURI();

        if (message.contains("Authorization") ||
                message.contains("token") ||
                message.contains("Bearer")) {

            log.warn("Authentication error [{}]: {}", path, message);
            return ResponseEntity.status(401).body(ApiErrorResponse.builder()
                    .status(401)
                    .error("UNAUTHORIZED")
                    .message("Invalid or missing authentication token")
                    .timestamp(LocalDateTime.now())
                    .path(path)
                    .build());
        }

        log.error("Validation error [{}]: {}", path, message);
        return ResponseEntity.status(400).body(ApiErrorResponse.builder()
                .status(400)
                .error("VALIDATION_ERROR")
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(path)
                .build());
    }

    private HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}