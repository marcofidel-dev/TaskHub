package com.taskhub.controller;

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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerRefreshTest {

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private static final String OLD_REFRESH = "old.refresh.token";
    private static final String NEW_ACCESS   = "new.access.token";
    private static final String NEW_REFRESH  = "new.refresh.token";

    // ── Happy path ────────────────────────────────────────────────────────────

    @Test
    void refresh_validToken_shouldRotateAndReturnBothTokens() {
        Claims claims = mock(Claims.class);
        User user = User.builder().id(1L).email("user@example.com")
                .subscriptionTier(User.SubscriptionTier.FREE).build();

        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(true);
        when(jwtProvider.extractClaims(OLD_REFRESH)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn("user@example.com");
        when(userService.findByEmail("user@example.com")).thenReturn(user);
        when(jwtProvider.generateAccessToken(1L, "user@example.com")).thenReturn(NEW_ACCESS);
        when(jwtProvider.generateRefreshToken(1L, "user@example.com")).thenReturn(NEW_REFRESH);

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        assertEquals(HttpStatus.OK, response.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertNotNull(body);
        assertEquals(NEW_ACCESS,  body.get("accessToken"));
        assertEquals(NEW_REFRESH, body.get("refreshToken"));
    }

    @Test
    void refresh_validToken_shouldBlacklistOldRefreshToken() {
        Claims claims = mock(Claims.class);
        User user = User.builder().id(1L).email("user@example.com")
                .subscriptionTier(User.SubscriptionTier.FREE).build();

        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(true);
        when(jwtProvider.extractClaims(OLD_REFRESH)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn("user@example.com");
        when(userService.findByEmail("user@example.com")).thenReturn(user);
        when(jwtProvider.generateAccessToken(1L, "user@example.com")).thenReturn(NEW_ACCESS);
        when(jwtProvider.generateRefreshToken(1L, "user@example.com")).thenReturn(NEW_REFRESH);

        authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        // Old refresh token must be blacklisted exactly once
        verify(jwtProvider, times(1)).addToBlacklist(OLD_REFRESH);
    }

    @Test
    void refresh_validToken_shouldIssueNewRefreshToken() {
        Claims claims = mock(Claims.class);
        User user = User.builder().id(1L).email("user@example.com")
                .subscriptionTier(User.SubscriptionTier.FREE).build();

        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(true);
        when(jwtProvider.extractClaims(OLD_REFRESH)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn("user@example.com");
        when(userService.findByEmail("user@example.com")).thenReturn(user);
        when(jwtProvider.generateAccessToken(1L, "user@example.com")).thenReturn(NEW_ACCESS);
        when(jwtProvider.generateRefreshToken(1L, "user@example.com")).thenReturn(NEW_REFRESH);

        authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        // A new refresh token must have been generated
        verify(jwtProvider, times(1)).generateRefreshToken(1L, "user@example.com");
    }

    // ── Error cases ───────────────────────────────────────────────────────────

    @Test
    void refresh_missingToken_shouldReturn400() {
        ResponseEntity<?> response = authController.refresh(Map.of());

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(jwtProvider, never()).addToBlacklist(any());
    }

    @Test
    void refresh_invalidToken_shouldReturn401WithoutBlacklisting() {
        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(false);

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtProvider, never()).addToBlacklist(any());
    }

    @Test
    void refresh_userNoLongerExists_shouldReturn401WithoutBlacklisting() {
        Claims claims = mock(Claims.class);

        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(true);
        when(jwtProvider.extractClaims(OLD_REFRESH)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn("deleted@example.com");
        when(userService.findByEmail("deleted@example.com"))
                .thenThrow(new IllegalArgumentException("User not found"));

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtProvider, never()).addToBlacklist(any());
    }

    @Test
    void refresh_tokenWithNullEmail_shouldReturn401() {
        Claims claims = mock(Claims.class);

        when(jwtProvider.validateToken(OLD_REFRESH)).thenReturn(true);
        when(jwtProvider.extractClaims(OLD_REFRESH)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("1");
        when(claims.get("email", String.class)).thenReturn(null);

        ResponseEntity<?> response = authController.refresh(Map.of("refreshToken", OLD_REFRESH));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(jwtProvider, never()).addToBlacklist(any());
    }
}
