package com.taskhub.security;

import com.taskhub.entity.TokenBlacklist;
import com.taskhub.entity.User;
import com.taskhub.repository.TokenBlacklistRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token.expiration:900000}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshTokenExpiration;

    private final TokenBlacklistRepository tokenBlacklistRepository;

    public JwtProvider(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    public static final String TYPE_CLAIM = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    public String generateAccessToken(Long userId, String email) {
        return createToken(userId, email, accessTokenExpiration, TYPE_ACCESS);
    }

    public String generateRefreshToken(Long userId, String email) {
        return createToken(userId, email, refreshTokenExpiration, TYPE_REFRESH);
    }

    public String generateAccessToken(User user) {
        return generateAccessToken(user.getId(), user.getEmail());
    }

    public String generateRefreshToken(User user) {
        return generateRefreshToken(user.getId(), user.getEmail());
    }

    /** Valid signature, not expired, not blacklisted — of ANY type. Prefer the typed variants. */
    public boolean validateToken(String token) {
        return validateToken(token, null);
    }

    /** Only accepts tokens issued as access tokens (used to authenticate API calls). */
    public boolean validateAccessToken(String token) {
        return validateToken(token, TYPE_ACCESS);
    }

    /** Only accepts tokens issued as refresh tokens (used only on /auth/refresh). */
    public boolean validateRefreshToken(String token) {
        return validateToken(token, TYPE_REFRESH);
    }

    private boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (expectedType != null && !expectedType.equals(claims.get(TYPE_CLAIM, String.class))) {
                log.warn("JWT token has wrong type, expected {}", expectedType);
                return false;
            }

            if (isTokenBlacklisted(token)) {
                log.warn("JWT token is blacklisted");
                return false;
            }

            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token malformed: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("JWT signature invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims empty: {}", e.getMessage());
        }
        return false;
    }

    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.findByToken(token).isPresent();
    }

    public void addToBlacklist(String token) {
        try {
            Claims claims = parseClaims(token);
            LocalDateTime expiresAt = claims.getExpiration()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                    .token(token)
                    .expiresAt(expiresAt)
                    .build();

            tokenBlacklistRepository.save(blacklistedToken);
            log.debug("Token added to blacklist, expires at: {}", expiresAt);
        } catch (Exception e) {
            log.error("Failed to blacklist token: {}", e.getMessage());
        }
    }

    public Claims extractClaims(String token) {
        return parseClaims(token);
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("email", String.class);
    }

    private String createToken(Long userId, String email, long expiration, String type) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim(TYPE_CLAIM, type)
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
