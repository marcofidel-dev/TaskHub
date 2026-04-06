package com.taskhub.controller;

import com.taskhub.dto.*;
import com.taskhub.entity.User;
import com.taskhub.security.JwtProvider;
import com.taskhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            UserResponse userResponse = userService.mapToResponse(user);

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(jwtProvider.generateAccessToken(user.getId(), user.getEmail()))
                    .refreshToken(jwtProvider.generateRefreshToken(user.getId(), user.getEmail()))
                    .user(userResponse)
                    .build();

            log.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

        } catch (IllegalArgumentException e) {
            log.warn("Registration conflict: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    ErrorResponse.builder()
                            .error("CONFLICT")
                            .message(e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ErrorResponse.builder()
                            .error("INTERNAL_SERVER_ERROR")
                            .message("An unexpected error occurred")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail());

            if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        ErrorResponse.builder()
                                .error("UNAUTHORIZED")
                                .message("Invalid credentials")
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            }

            UserResponse userResponse = userService.mapToResponse(user);

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(jwtProvider.generateAccessToken(user.getId(), user.getEmail()))
                    .refreshToken(jwtProvider.generateRefreshToken(user.getId(), user.getEmail()))
                    .user(userResponse)
                    .build();

            log.info("User logged in: {}", user.getEmail());
            return ResponseEntity.ok(authResponse);

        } catch (IllegalArgumentException e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                            .error("UNAUTHORIZED")
                            .message("Invalid credentials")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ErrorResponse.builder()
                            .error("INTERNAL_SERVER_ERROR")
                            .message("An unexpected error occurred")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        try {
            String refreshToken = body.get("refreshToken");
            if (refreshToken == null || refreshToken.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ErrorResponse.builder()
                                .error("BAD_REQUEST")
                                .message("refreshToken is required")
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            }
            if (!jwtProvider.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        ErrorResponse.builder()
                                .error("UNAUTHORIZED")
                                .message("Invalid or expired refresh token")
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            }

            Long userId = jwtProvider.getUserIdFromToken(refreshToken);
            String email = jwtProvider.getEmailFromToken(refreshToken);
            String newAccessToken = jwtProvider.generateAccessToken(userId, email);

            log.info("Token refreshed for userId: {}", userId);
            return ResponseEntity.ok(Map.of("access_token", newAccessToken));

        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ErrorResponse.builder()
                            .error("INTERNAL_SERVER_ERROR")
                            .message("An unexpected error occurred")
                            .timestamp(LocalDateTime.now())
                            .build()
            );
        }
    }
}
