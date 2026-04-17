package com.taskhub.validation;

import com.taskhub.dto.LoginRequest;
import com.taskhub.dto.RegisterRequest;
import com.taskhub.dto.TaskCreateRequest;
import com.taskhub.dto.TaskUpdateRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class InputValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ── RegisterRequest ───────────────────────────────────────────────────────

    @Test
    void register_validRequest_shouldHaveNoViolations() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@example.com")
                .password("Pass1234@")
                .username("johndoe")
                .build();
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void register_blankEmail_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("").password("Pass1234@").username("johndoe").build();
        assertFieldHasViolation(validator.validate(req), "email");
    }

    @Test
    void register_invalidEmail_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("not-an-email").password("Pass1234@").username("johndoe").build();
        assertFieldHasViolation(validator.validate(req), "email");
    }

    @Test
    void register_weakPassword_noUppercase_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@example.com").password("pass1234@").username("johndoe").build();
        assertFieldHasViolation(validator.validate(req), "password");
    }

    @Test
    void register_weakPassword_tooShort_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@example.com").password("P1@").username("johndoe").build();
        assertFieldHasViolation(validator.validate(req), "password");
    }

    @Test
    void register_usernameTooShort_shouldFail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@example.com").password("Pass1234@").username("ab").build();
        assertFieldHasViolation(validator.validate(req), "username");
    }

    // ── LoginRequest ──────────────────────────────────────────────────────────

    @Test
    void login_validRequest_shouldHaveNoViolations() {
        LoginRequest req = LoginRequest.builder()
                .email("user@example.com").password("anypassword").build();
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void login_blankPassword_shouldFail() {
        LoginRequest req = LoginRequest.builder()
                .email("user@example.com").password("").build();
        assertFieldHasViolation(validator.validate(req), "password");
    }

    // ── TaskCreateRequest ─────────────────────────────────────────────────────

    @Test
    void taskCreate_validRequest_shouldHaveNoViolations() {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("My task");
        req.setPriority("HIGH");
        assertTrue(validator.validate(req).isEmpty());
    }

    @Test
    void taskCreate_blankTitle_shouldFail() {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("");
        req.setPriority("MEDIUM");
        assertFieldHasViolation(validator.validate(req), "title");
    }

    @Test
    void taskCreate_invalidPriority_shouldFail() {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("Task");
        req.setPriority("URGENT");
        assertFieldHasViolation(validator.validate(req), "priority");
    }

    @Test
    void taskCreate_descriptionTooLong_shouldFail() {
        TaskCreateRequest req = new TaskCreateRequest();
        req.setTitle("Task");
        req.setDescription("x".repeat(5001)); // max is 5000
        req.setPriority("MEDIUM");
        assertFieldHasViolation(validator.validate(req), "description");
    }

    // ── TaskUpdateRequest ─────────────────────────────────────────────────────

    @Test
    void taskUpdate_allNulls_shouldHaveNoViolations() {
        // All fields optional — null values must pass
        assertTrue(validator.validate(new TaskUpdateRequest()).isEmpty());
    }

    @Test
    void taskUpdate_emptyTitle_shouldFail() {
        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setTitle("");
        assertFieldHasViolation(validator.validate(req), "title");
    }

    @Test
    void taskUpdate_titleTooLong_shouldFail() {
        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setTitle("x".repeat(256));
        assertFieldHasViolation(validator.validate(req), "title");
    }

    @Test
    void taskUpdate_invalidPriority_shouldFail() {
        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setPriority("CRITICAL");
        assertFieldHasViolation(validator.validate(req), "priority");
    }

    @Test
    void taskUpdate_validPriority_shouldPass() {
        for (String p : new String[]{"LOW", "MEDIUM", "HIGH"}) {
            TaskUpdateRequest req = new TaskUpdateRequest();
            req.setPriority(p);
            assertTrue(validator.validate(req).isEmpty(), "Priority " + p + " should be valid");
        }
    }

    @Test
    void taskUpdate_descriptionTooLong_shouldFail() {
        TaskUpdateRequest req = new TaskUpdateRequest();
        req.setDescription("x".repeat(2001));
        assertFieldHasViolation(validator.validate(req), "description");
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private <T> void assertFieldHasViolation(Set<ConstraintViolation<T>> violations, String field) {
        assertFalse(violations.isEmpty(), "Expected violations but found none");
        boolean found = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals(field));
        assertTrue(found, "Expected violation on field '" + field + "' but got: " + violations);
    }
}
