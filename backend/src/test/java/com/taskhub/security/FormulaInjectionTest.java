package com.taskhub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FormulaInjectionTest {

    @Test
    void prefixesDangerousLeadingCharacters() {
        for (String s : new String[]{"=1+1", "+SUM(A1)", "-2+3", "@cmd", "\tx", "\rx"}) {
            assertEquals("'" + s, SecurityUtil.neutralizeFormula(s), "input: " + s.replace("\t", "\\t").replace("\r", "\\r"));
        }
    }

    @Test
    void leavesNormalTextAndNullUntouched() {
        assertEquals("Buy milk", SecurityUtil.neutralizeFormula("Buy milk"));
        assertEquals("a=b", SecurityUtil.neutralizeFormula("a=b"));
        assertEquals("", SecurityUtil.neutralizeFormula(""));
        assertNull(SecurityUtil.neutralizeFormula(null));
    }
}
