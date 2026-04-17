package com.taskhub.controller;

import com.taskhub.dto.*;
import com.taskhub.entity.User;
import com.taskhub.security.JwtProvider;
import com.taskhub.service.UserService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private UserService userService;
    @Mock private JwtProvider   jwtProvider;

    @InjectMocks private AuthController authController;

    // ── Register ──────────────────────────────────────────────────────────────

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@example.com")
                .password("Pass1234@")
                .username("testuser")
                .build();

        User mockUser = buildUser(1L, "user@example.com", "testuser");
        UserResponse userResponse = buildUserResponse(1L, "user@example.com", "testuser");

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(mockUser);
        when(userService.mapToResponse(mockUser)).thenReturn(userResponse);
        when(jwtProvider.generateAccessToken(mockUser)).thenReturn("access.token");
        when(jwtProvider.generateRefreshToken(mockUser)).thenReturn("refresh.token");

        ResponseEntity<?> response = authController.register(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        AuthResponse body = (AuthResponse) response.getBody();
        assertNotNull(body);
        assertEquals("access.token",  body.getAccessToken());
        assertEquals("refresh.token", body.getRefreshToken());
        assertEquals(userResponse,    body.getUser());
    }

    @Test
    void testRegisterConflict_emailAlreadyInUse() {
        RegisterRequest req = RegisterRequest.builder()
                .email("taken@example.com").password("Pass1234@").username("testuser").build();

        when(userService.registerUser(any())).thenThrow(new IllegalArgumentException("Email already in use"));

        ResponseEntity<?> response = authController.register(req);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    void testLoginSuccess() {
        LoginRequest req = LoginRequest.builder()
                .email("user@example.com").password("Pass1234@").build();

        User mockUser = buildUser(1L, "user@example.com", "testuser");
        UserResponse userResponse = buildUserResponse(1L, "user@example.com", "testuser");

        when(userService.findByEmail("user@example.com")).thenReturn(mockUser);
        when(userService.validatePassword("Pass1234@", mockUser.getPassword())).thenReturn(true);
        when(userService.mapToResponse(mockUser)).thenReturn(userResponse);
        when(jwtProvider.generateAccessToken(mockUser)).thenReturn("access.token");
        when(jwtProvider.generateRefreshToken(mockUser)).thenReturn("refresh.token");

        ResponseEntity<?> response = authController.login(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponse body = (AuthResponse) response.getBody();
        assertNotNull(body);
        assertEquals("access.token",  body.getAccessToken());
        assertEquals("refresh.token", body.getRefreshToken());
    }

    @Test
    void testLoginFailInvalidCredentials() {
        LoginRequest req = LoginRequest.builder()
                .email("user@example.com").password("WrongPass1@").build();

        User mockUser = buildUser(1L, "user@example.com", "testuser");

        when(userService.findByEmail("user@example.com")).thenReturn(mockUser);
        when(userService.validatePassword("WrongPass1@", mockUser.getPassword())).thenReturn(false);

        ResponseEntity<?> response = authController.login(req);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtProvider, never()).generateAccessToken(any(User.class));
    }

    @Test
    void testLoginFailUserNotFound() {
        LoginRequest req = LoginRequest.builder()
                .email("ghost@example.com").password("Pass1234@").build();

        when(userService.findByEmail("ghost@example.com"))
                .thenThrow(new IllegalArgumentException("User not found"));

        ResponseEntity<?> response = authController.login(req);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    // ── Refresh token ─────────────────────────────────────────────────────────

    @Test
    void testRefreshTokenSuccess() {
        String oldRefresh = "old.refresh.token";
        Claims claims = mock(Claims.class);
        User mockUser = buildUser(1L, "user@example.com", "testuser");

        when(jwtProvider.validateToken(oldRefresh)).thenReturn(true);
        when(jwtProvider.extractClaims(oldRefresh)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn("user@example.com");
        when(userService.findByEmail("user@example.com")).thenReturn(mockUser);
        when(jwtProvider.generateAccessToken(1L, "user@example.com")).thenReturn("new.access");
        when(jwtProvider.generateRefreshToken(1L, "user@example.com")).thenReturn("new.refresh");

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", oldRefresh));

        assertEquals(HttpStatus.OK, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body);
        assertEquals("new.access",  body.get("accessToken"));
        assertEquals("new.refresh", body.get("refreshToken"));

        // Old token must be blacklisted (rotation)
        verify(jwtProvider).addToBlacklist(oldRefresh);
    }

    @Test
    void testRefreshTokenFail_invalidToken() {
        when(jwtProvider.validateToken("bad.token")).thenReturn(false);

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", "bad.token"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtProvider, never()).addToBlacklist(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User buildUser(Long id, String email, String username) {
        return User.builder()
                .id(id).email(email).username(username)
                .password("$2a$10$hashed")
                .subscriptionTier(User.SubscriptionTier.FREE)
                .build();
    }

    private UserResponse buildUserResponse(Long id, String email, String username) {
        return UserResponse.builder()
                .id(id).email(email).username(username)
                .subscriptionTier(User.SubscriptionTier.FREE)
                .build();
    }
}
