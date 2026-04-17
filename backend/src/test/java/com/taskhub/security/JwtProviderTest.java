package com.taskhub.security;

import com.taskhub.entity.TokenBlacklist;
import com.taskhub.repository.TokenBlacklistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtProviderTest {

    @Mock
    private TokenBlacklistRepository tokenBlacklistRepository;

    @InjectMocks
    private JwtProvider jwtProvider;

    private static final String TEST_SECRET =
            "dGhpcy1pcy1hLXZlcnktc2VjdXJlLXNlY3JldC1rZXktZm9yLXRhc2todWItand0LWF1dGhlbnRpY2F0aW9u";
    private static final long ACCESS_EXPIRATION = 900000L;
    private static final long REFRESH_EXPIRATION = 604800000L;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtProvider, "accessTokenExpiration", ACCESS_EXPIRATION);
        ReflectionTestUtils.setField(jwtProvider, "refreshTokenExpiration", REFRESH_EXPIRATION);
    }

    // ── Token generation ──────────────────────────────────────────────────────

    @Test
    void generateAccessToken_shouldReturnNonNullToken() {
        String token = jwtProvider.generateAccessToken(1L, "user@example.com");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void generateRefreshToken_shouldReturnNonNullToken() {
        String token = jwtProvider.generateRefreshToken(1L, "user@example.com");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void generateAccessToken_shouldEmbedUserIdAndEmail() {
        String token = jwtProvider.generateAccessToken(42L, "test@example.com");

        assertEquals(42L, jwtProvider.getUserIdFromToken(token));
        assertEquals("test@example.com", jwtProvider.getEmailFromToken(token));
    }

    // ── Token validation ──────────────────────────────────────────────────────

    @Test
    void validateToken_withValidToken_shouldReturnTrue() {
        when(tokenBlacklistRepository.findByToken(anyString())).thenReturn(Optional.empty());

        String token = jwtProvider.generateAccessToken(1L, "user@example.com");

        assertTrue(jwtProvider.validateToken(token));
    }

    @Test
    void validateToken_withExpiredToken_shouldReturnFalse() {
        ReflectionTestUtils.setField(jwtProvider, "accessTokenExpiration", 1L);
        String token = jwtProvider.generateAccessToken(1L, "user@example.com");
        ReflectionTestUtils.setField(jwtProvider, "accessTokenExpiration", ACCESS_EXPIRATION);

        assertFalse(jwtProvider.validateToken(token));
    }

    @Test
    void validateToken_withMalformedToken_shouldReturnFalse() {
        assertFalse(jwtProvider.validateToken("not.a.valid.jwt"));
    }

    @Test
    void validateToken_withEmptyToken_shouldReturnFalse() {
        assertFalse(jwtProvider.validateToken(""));
    }

    // ── Blacklist functionality ───────────────────────────────────────────────

    @Test
    void validateToken_withBlacklistedToken_shouldReturnFalse() {
        String token = jwtProvider.generateAccessToken(1L, "user@example.com");
        when(tokenBlacklistRepository.findByToken(token))
                .thenReturn(Optional.of(TokenBlacklist.builder().token(token).build()));

        assertFalse(jwtProvider.validateToken(token));
    }

    @Test
    void isTokenBlacklisted_whenTokenInBlacklist_shouldReturnTrue() {
        String token = "some.blacklisted.token";
        when(tokenBlacklistRepository.findByToken(token))
                .thenReturn(Optional.of(TokenBlacklist.builder().token(token).build()));

        assertTrue(jwtProvider.isTokenBlacklisted(token));
    }

    @Test
    void isTokenBlacklisted_whenTokenNotInBlacklist_shouldReturnFalse() {
        when(tokenBlacklistRepository.findByToken(anyString())).thenReturn(Optional.empty());

        assertFalse(jwtProvider.isTokenBlacklisted("not.blacklisted.token"));
    }

    @Test
    void addToBlacklist_shouldSaveTokenWithCorrectExpiry() {
        String token = jwtProvider.generateAccessToken(1L, "user@example.com");
        when(tokenBlacklistRepository.save(any(TokenBlacklist.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        jwtProvider.addToBlacklist(token);

        verify(tokenBlacklistRepository, times(1)).save(any(TokenBlacklist.class));
    }

    @Test
    void addToBlacklist_afterBlacklisting_validateTokenShouldReturnFalse() {
        String token = jwtProvider.generateAccessToken(1L, "user@example.com");

        when(tokenBlacklistRepository.save(any(TokenBlacklist.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(tokenBlacklistRepository.findByToken(token))
                .thenReturn(Optional.of(TokenBlacklist.builder().token(token).build()));

        jwtProvider.addToBlacklist(token);

        assertFalse(jwtProvider.validateToken(token));
    }
}
