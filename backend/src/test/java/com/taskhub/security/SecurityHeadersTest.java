package com.taskhub.security;

import com.taskhub.interceptor.RateLimitInterceptor;
import com.taskhub.repository.TokenBlacklistRepository;
import com.taskhub.service.CategoryService;
import com.taskhub.service.TagService;
import com.taskhub.service.TaskService;
import com.taskhub.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

/**
 * Verifies that the security headers configured in SecurityConfig
 * are present in HTTP responses. Uses a lightweight @WebMvcTest slice —
 * all services and repositories are mocked, no database required.
 */
@WebMvcTest
@Import(SecurityConfig.class)
class SecurityHeadersTest {

    @Autowired
    private MockMvc mockMvc;

    // ── Mock beans to satisfy the controller dependency chain ─────────────────

    @MockBean private JwtProvider jwtProvider;
    @MockBean private CurrentUserArgumentResolver currentUserArgumentResolver;
    @MockBean private TokenBlacklistRepository tokenBlacklistRepository;
    @MockBean private RateLimitInterceptor rateLimitInterceptor;
    @MockBean private UserService userService;
    @MockBean private TaskService taskService;
    @MockBean private CategoryService categoryService;
    @MockBean private TagService tagService;

    // ── Header assertions ─────────────────────────────────────────────────────

    @Test
    void response_shouldContainContentTypeOptionsHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    @Test
    void response_shouldContainFrameOptionsDenyHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    void response_shouldContainHstsHeader() throws Exception {
        // HSTS is only sent over HTTPS — simulate a secure request
        mockMvc.perform(get("/api/health").secure(true))
                .andExpect(header().exists("Strict-Transport-Security"));
    }

    @Test
    void response_shouldContainContentSecurityPolicyHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().exists("Content-Security-Policy"));
    }

    @Test
    void response_shouldContainReferrerPolicyHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().exists("Referrer-Policy"));
    }

    @Test
    void response_shouldContainPermissionsPolicyHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().exists("Permissions-Policy"));
    }

    @Test
    void response_shouldContainCacheControlHeader() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(header().exists("Cache-Control"));
    }
}
