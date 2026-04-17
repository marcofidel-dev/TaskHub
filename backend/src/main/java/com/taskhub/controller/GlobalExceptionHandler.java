package com.taskhub.controller;

import com.taskhub.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Bean Validation failures (@Valid on @RequestBody).
     * Returns 400 with a fieldErrors map: { "fieldName": "message" }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getAllErrors()
                .stream()
                .filter(e -> e instanceof FieldError)
                .map(e -> (FieldError) e)
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        (first, second) -> first   // keep first message on duplicate field
                ));

        log.warn("Validation failed [{}]: {}", request.getRequestURI(), fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiErrorResponse.builder()
                        .status(400)
                        .error("VALIDATION_ERROR")
                        .message("Request validation failed")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .fieldErrors(fieldErrors)
                        .build()
        );
    }

    /**
     * Malformed JSON body — e.g. syntax error or unrecognised enum value.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        log.warn("Unreadable request body [{}]: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiErrorResponse.builder()
                        .status(400)
                        .error("MALFORMED_REQUEST")
                        .message("Request body is missing or cannot be parsed")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build()
        );
    }

    /**
     * Application-level validation and not-found errors.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException e,
            HttpServletRequest request) {

        String message = e.getMessage();
        String path = request.getRequestURI();

        if (message != null && (message.contains("Authorization") ||
                message.contains("token") ||
                message.contains("Bearer"))) {

            log.warn("Authentication error [{}]: {}", path, message);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiErrorResponse.builder()
                            .status(401)
                            .error("UNAUTHORIZED")
                            .message("Invalid or missing authentication token")
                            .timestamp(LocalDateTime.now())
                            .path(path)
                            .build()
            );
        }

        log.warn("Business validation error [{}]: {}", path, message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiErrorResponse.builder()
                        .status(400)
                        .error("VALIDATION_ERROR")
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .path(path)
                        .build()
        );
    }

    private HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    }
}
