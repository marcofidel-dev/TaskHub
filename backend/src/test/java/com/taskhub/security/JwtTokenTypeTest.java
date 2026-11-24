package com.taskhub.security;

import com.taskhub.repository.TokenBlacklistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

/** Access and refresh tokens must not be interchangeable. */
class JwtTokenTypeTest {

    private static final String SECRET =
            "furHHKWJTWJaRDeM04AfPVyQSrvCp5Bd4korCmdXP/Shxdzq1jvNPtgC0JfAihuq2dtmCXdXxbTqY44YB3Y9Vw==";

    private JwtProvider jwt;

    @BeforeEach
    void setUp() {
        jwt = new JwtProvider(mock(TokenBlacklistRepository.class));
        ReflectionTestUtils.setField(jwt, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwt, "accessTokenExpiration", 900_000L);
        ReflectionTestUtils.setField(jwt, "refreshTokenExpiration", 604_800_000L);
    }

    @Test
    void accessToken_isAcceptedAsAccess_andRejectedAsRefresh() {
        String t = jwt.generateAccessToken(1L, "a@b.com");
        assertTrue(jwt.validateAccessToken(t));
        assertFalse(jwt.validateRefreshToken(t));
    }

    @Test
    void refreshToken_isAcceptedAsRefresh_andRejectedAsAccess() {
        String t = jwt.generateRefreshToken(1L, "a@b.com");
        assertTrue(jwt.validateRefreshToken(t));
        assertFalse(jwt.validateAccessToken(t), "refresh token must not authenticate API calls");
    }

    @Test
    void tokenWithoutTypeClaim_isRejectedByTypedValidators() {
        String legacy = io.jsonwebtoken.Jwts.builder()
                .subject("1").claim("email", "a@b.com")
                .expiration(new java.util.Date(System.currentTimeMillis() + 60_000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        io.jsonwebtoken.io.Decoders.BASE64.decode(SECRET)))
                .compact();
        assertFalse(jwt.validateAccessToken(legacy));
        assertFalse(jwt.validateRefreshToken(legacy));
    }

    @Test
    void tokensIssuedTogether_areUnique_soRotationNeverReissuesABlacklistedToken() {
        assertNotEquals(jwt.generateRefreshToken(1L, "a@b.com"), jwt.generateRefreshToken(1L, "a@b.com"));
    }
}
