package com.taskhub.interceptor;

import com.taskhub.config.RateLimitConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitInterceptorTest {

    private RateLimitInterceptor interceptor;
    private final Object handler = new Object();

    @BeforeEach
    void setUp() {
        interceptor = new RateLimitInterceptor(new RateLimitConfig());
    }

    // ── Login rate limit (5 / 15 min) ─────────────────────────────────────────

    @Test
    void login_first5Attempts_shouldBeAllowed() throws Exception {
        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest  req = loginRequest("10.0.0.1");
            MockHttpServletResponse res = new MockHttpServletResponse();

            assertTrue(interceptor.preHandle(req, res, handler),
                    "Attempt " + i + " should be allowed");
        }
    }

    @Test
    void login_6thAttempt_shouldReturn429() throws Exception {
        // Exhaust the 5-token bucket
        for (int i = 0; i < 5; i++) {
            interceptor.preHandle(loginRequest("10.0.0.2"), new MockHttpServletResponse(), handler);
        }

        MockHttpServletResponse blockedRes = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(loginRequest("10.0.0.2"), blockedRes, handler);

        assertFalse(result, "6th attempt should be blocked");
        assertEquals(429, blockedRes.getStatus());
    }

    @Test
    void login_6thAttempt_responseBody_shouldContainTooManyRequests() throws Exception {
        for (int i = 0; i < 5; i++) {
            interceptor.preHandle(loginRequest("10.0.0.3"), new MockHttpServletResponse(), handler);
        }

        MockHttpServletResponse blockedRes = new MockHttpServletResponse();
        interceptor.preHandle(loginRequest("10.0.0.3"), blockedRes, handler);

        assertTrue(blockedRes.getContentAsString().contains("TOO_MANY_REQUESTS"));
    }

    // ── Register rate limit (3 / hour) ───────────────────────────────────────

    @Test
    void register_first3Attempts_shouldBeAllowed() throws Exception {
        for (int i = 1; i <= 3; i++) {
            MockHttpServletRequest  req = registerRequest("10.0.1.1");
            MockHttpServletResponse res = new MockHttpServletResponse();

            assertTrue(interceptor.preHandle(req, res, handler),
                    "Register attempt " + i + " should be allowed");
        }
    }

    @Test
    void register_4thAttempt_shouldReturn429() throws Exception {
        for (int i = 0; i < 3; i++) {
            interceptor.preHandle(registerRequest("10.0.1.2"), new MockHttpServletResponse(), handler);
        }

        MockHttpServletResponse blockedRes = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(registerRequest("10.0.1.2"), blockedRes, handler);

        assertFalse(result);
        assertEquals(429, blockedRes.getStatus());
    }

    // ── IP isolation ──────────────────────────────────────────────────────────

    @Test
    void login_differentIPs_shouldHaveIndependentBuckets() throws Exception {
        // Exhaust bucket for IP A
        for (int i = 0; i < 5; i++) {
            interceptor.preHandle(loginRequest("192.168.1.1"), new MockHttpServletResponse(), handler);
        }

        // IP B should still be allowed
        MockHttpServletResponse res = new MockHttpServletResponse();
        boolean result = interceptor.preHandle(loginRequest("192.168.1.2"), res, handler);

        assertTrue(result, "Different IP should not be rate limited");
    }

    // ── X-Forwarded-For ───────────────────────────────────────────────────────

    @Test
    void getClientIp_withXForwardedFor_shouldUseFirstIp() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1");

        assertEquals("203.0.113.5", interceptor.getClientIp(req));
    }

    @Test
    void getClientIp_withXRealIp_shouldUseRealIp() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("X-Real-IP", "203.0.113.10");

        assertEquals("203.0.113.10", interceptor.getClientIp(req));
    }

    @Test
    void getClientIp_noHeaders_shouldUseRemoteAddr() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr("127.0.0.1");

        assertEquals("127.0.0.1", interceptor.getClientIp(req));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private MockHttpServletRequest loginRequest(String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        req.addHeader("X-Forwarded-For", ip);
        return req;
    }

    private MockHttpServletRequest registerRequest(String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/register");
        req.addHeader("X-Forwarded-For", ip);
        return req;
    }
}
