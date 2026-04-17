package com.taskhub.interceptor;

import com.taskhub.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-IP, per-endpoint rate limiter backed by Bucket4j.
 *
 * Each unique (IP, endpoint-group) pair gets its own Bucket.
 * Limits are defined in {@link RateLimitConfig}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitConfig rateLimitConfig;

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String ip   = getClientIp(request);
        String path = request.getRequestURI();
        String key  = ip + "|" + bucketKey(path);

        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(path));

        if (bucket.tryConsume(1)) {
            return true;
        }

        log.warn("Rate limit exceeded — ip={} path={}", ip, path);
        sendRateLimitResponse(response);
        return false;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Bucket createBucket(String path) {
        if (path.contains("/auth/login"))    return rateLimitConfig.newLoginBucket();
        if (path.contains("/auth/register")) return rateLimitConfig.newRegisterBucket();
        return rateLimitConfig.newGeneralBucket();
    }

    private String bucketKey(String path) {
        if (path.contains("/auth/login"))    return "login";
        if (path.contains("/auth/register")) return "register";
        return "general";
    }

    String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws Exception {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"error\":\"TOO_MANY_REQUESTS\"," +
                "\"message\":\"Rate limit exceeded. Please try again later.\"}"
        );
    }
}
