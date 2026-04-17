package com.taskhub.security;

import java.util.regex.Pattern;

/**
 * Utility methods for input sanitization and basic injection detection.
 *
 * sanitizeHtml  — strips HTML tags and encodes remaining special characters
 *                 to prevent XSS when content is later rendered in a browser.
 *
 * isSafeSql     — detects common SQL injection patterns as an extra
 *                 defense-in-depth layer (JPA parameterized queries already
 *                 prevent injection at the query level).
 */
public final class SecurityUtil {

    private SecurityUtil() {}

    // ── HTML Sanitization ─────────────────────────────────────────────────────

    /** Matches any HTML/XML tag, including self-closing and attributes. */
    private static final Pattern HTML_TAG_PATTERN =
            Pattern.compile("<[^>]*>", Pattern.DOTALL);

    /**
     * Strips all HTML tags from {@code input} and HTML-encodes the five
     * characters that are meaningful in an HTML context (&, <, >, ", ').
     *
     * @param input raw user input; {@code null} is returned as-is
     * @return sanitized string safe for storage and HTML rendering
     */
    public static String sanitizeHtml(String input) {
        if (input == null) return null;
        if (input.isBlank()) return input;

        // 1. Remove all HTML tags
        String stripped = HTML_TAG_PATTERN.matcher(input).replaceAll("");

        // 2. Encode special HTML characters (& first to avoid double-encoding)
        stripped = stripped.replace("&",  "&amp;");
        stripped = stripped.replace("<",  "&lt;");
        stripped = stripped.replace(">",  "&gt;");
        stripped = stripped.replace("\"", "&quot;");
        stripped = stripped.replace("'",  "&#x27;");

        return stripped;
    }

    // ── SQL Injection Detection ───────────────────────────────────────────────

    /**
     * Detects the most common SQL injection signatures.
     *
     * Checks for:
     *   - SQL comment sequences  (-- and /* *​/)
     *   - Quote-based OR/AND tautologies  (' OR '1'='1)
     *   - UNION SELECT statements
     *   - Statement chaining with dangerous DDL/DML  (; DROP, ; DELETE …)
     *
     * Note: this is a defense-in-depth safeguard. All database access already
     * uses JPA parameterized queries which prevent SQL injection at the driver
     * level.
     *
     * @param input user-supplied string
     * @return {@code true} if no injection patterns are detected, {@code false} otherwise
     */
    public static boolean isSafeSql(String input) {
        if (input == null || input.isBlank()) return true;

        // SQL comment: -- or /* */
        if (SQL_COMMENT.matcher(input).find())            return false;

        // Tautology: ' OR '1'='1  /  ' AND '1'='1
        if (TAUTOLOGY.matcher(input).find())              return false;

        // UNION-based injection
        if (UNION_SELECT.matcher(input).find())           return false;

        // Statement chaining into dangerous keywords
        if (STATEMENT_CHAIN.matcher(input).find())        return false;

        return true;
    }

    // Compiled once at class-load time for performance
    private static final Pattern SQL_COMMENT = Pattern.compile(
            "--|\\/\\*|\\*\\/",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern TAUTOLOGY = Pattern.compile(
            "'\\s*(OR|AND)\\s+('?\\s*\\d+\\s*=\\s*\\d+\\s*'?|'[^']*'?\\s*=\\s*'[^']*'?)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern UNION_SELECT = Pattern.compile(
            "UNION\\s+(ALL\\s+)?SELECT",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern STATEMENT_CHAIN = Pattern.compile(
            ";\\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)",
            Pattern.CASE_INSENSITIVE);
}
