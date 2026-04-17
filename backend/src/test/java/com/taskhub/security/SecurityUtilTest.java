package com.taskhub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilTest {

    // ── sanitizeHtml — null / blank ───────────────────────────────────────────

    @Test
    void sanitizeHtml_null_returnsNull() {
        assertNull(SecurityUtil.sanitizeHtml(null));
    }

    @Test
    void sanitizeHtml_blankString_returnsBlank() {
        assertEquals("   ", SecurityUtil.sanitizeHtml("   "));
    }

    @Test
    void sanitizeHtml_cleanText_returnsUnchanged() {
        assertEquals("Hello world", SecurityUtil.sanitizeHtml("Hello world"));
    }

    // ── sanitizeHtml — tag stripping ──────────────────────────────────────────

    @Test
    void sanitizeHtml_scriptTag_isStripped() {
        String result = SecurityUtil.sanitizeHtml("<script>alert('xss')</script>");
        assertFalse(result.contains("<script>"));
        assertFalse(result.contains("</script>"));
    }

    @Test
    void sanitizeHtml_boldTag_isStripped() {
        String result = SecurityUtil.sanitizeHtml("<b>bold</b>");
        assertEquals("bold", result);
    }

    @Test
    void sanitizeHtml_anchorWithAttribute_isStripped() {
        String result = SecurityUtil.sanitizeHtml("<a href=\"evil.com\">click</a>");
        assertFalse(result.contains("<a"));
        assertTrue(result.contains("click"));
    }

    @Test
    void sanitizeHtml_imgOnerrorXss_tagIsStripped() {
        String result = SecurityUtil.sanitizeHtml("<img src=x onerror=alert(1)>");
        assertFalse(result.contains("<img"));
    }

    // ── sanitizeHtml — entity encoding ───────────────────────────────────────

    @Test
    void sanitizeHtml_ampersandIsEncoded() {
        assertTrue(SecurityUtil.sanitizeHtml("a & b").contains("&amp;"));
    }

    @Test
    void sanitizeHtml_quoteIsEncoded() {
        assertTrue(SecurityUtil.sanitizeHtml("say \"hi\"").contains("&quot;"));
    }

    @Test
    void sanitizeHtml_singleQuoteIsEncoded() {
        assertTrue(SecurityUtil.sanitizeHtml("it's").contains("&#x27;"));
    }

    @Test
    void sanitizeHtml_looseLtWithoutClosingGt_isEncoded() {
        // "a < b" has no closing >, so < is NOT stripped as a tag — it must be encoded
        assertTrue(SecurityUtil.sanitizeHtml("a < b").contains("&lt;"));
    }

    @Test
    void sanitizeHtml_looseGtWithoutOpeningLt_isEncoded() {
        // "a > b" has no opening <, so > is NOT stripped as a tag — it must be encoded
        assertTrue(SecurityUtil.sanitizeHtml("a > b").contains("&gt;"));
    }

    // ── isSafeSql — safe inputs ───────────────────────────────────────────────

    @Test
    void isSafeSql_null_returnsTrue() {
        assertTrue(SecurityUtil.isSafeSql(null));
    }

    @Test
    void isSafeSql_blank_returnsTrue() {
        assertTrue(SecurityUtil.isSafeSql("  "));
    }

    @Test
    void isSafeSql_normalText_returnsTrue() {
        assertTrue(SecurityUtil.isSafeSql("Buy groceries for tomorrow"));
    }

    @Test
    void isSafeSql_textWithNumbers_returnsTrue() {
        assertTrue(SecurityUtil.isSafeSql("Meeting room 101 at 3pm"));
    }

    // ── isSafeSql — SQL injection detection ──────────────────────────────────

    @Test
    void isSafeSql_sqlComment_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("admin'--"));
    }

    @Test
    void isSafeSql_blockComment_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("1 /* comment */"));
    }

    @Test
    void isSafeSql_orTautology_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("' OR '1'='1"));
    }

    @Test
    void isSafeSql_andTautology_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("' AND '1'='1"));
    }

    @Test
    void isSafeSql_unionSelect_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("x UNION SELECT * FROM users"));
    }

    @Test
    void isSafeSql_unionAllSelect_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("x UNION ALL SELECT password FROM users"));
    }

    @Test
    void isSafeSql_statementChainDrop_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("x'; DROP TABLE tasks;--"));
    }

    @Test
    void isSafeSql_statementChainDelete_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("'; DELETE FROM users WHERE 1=1"));
    }

    @Test
    void isSafeSql_execInjection_returnsFalse() {
        assertFalse(SecurityUtil.isSafeSql("'; EXEC xp_cmdshell('dir')"));
    }
}
