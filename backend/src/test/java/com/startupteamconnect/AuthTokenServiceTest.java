package com.startupteamconnect;

import com.startupteamconnect.security.AuthPrincipal;
import com.startupteamconnect.security.AuthTokenService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.*;

public class AuthTokenServiceTest {

    private static final String STRONG_SECRET = "production-hmac-secret-key-minimum-32-chars-length-secure-2026";

    @Test
    @DisplayName("Production startup fails with IllegalStateException when AUTH_TOKEN_SECRET is missing")
    void testProductionStartupFailsWhenSecretMissing() {
        IllegalStateException exNull = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService(null, 604800000L, true)
        );
        assertTrue(exNull.getMessage().contains("AUTH_TOKEN_SECRET"));
        assertTrue(exNull.getMessage().contains("missing"));

        IllegalStateException exEmpty = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService("", 604800000L, true)
        );
        assertTrue(exEmpty.getMessage().contains("missing"));

        IllegalStateException exBlank = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService("   ", 604800000L, true)
        );
        assertTrue(exBlank.getMessage().contains("missing"));
    }

    @Test
    @DisplayName("Production startup fails with IllegalStateException when AUTH_TOKEN_SECRET is too weak")
    void testProductionStartupFailsWhenSecretTooWeak() {
        // Less than 32 characters
        IllegalStateException exShort = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService("short-secret-key-12345", 604800000L, true)
        );
        assertTrue(exShort.getMessage().contains("too weak"));

        // Placeholder keyword "changeme"
        IllegalStateException exPlaceholder = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService("changeme-changeme-changeme-changeme", 604800000L, true)
        );
        assertTrue(exPlaceholder.getMessage().contains("too weak"));

        // Low entropy (repeated characters)
        IllegalStateException exTrivial = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 604800000L, true)
        );
        assertTrue(exTrivial.getMessage().contains("too weak"));
    }

    @Test
    @DisplayName("Production startup succeeds when a strong secret is provided")
    void testProductionStartupSucceedsWithStrongSecret() {
        AuthTokenService service = new AuthTokenService(STRONG_SECRET, 604800000L, true);
        String token = service.generateToken(1L, "founder", "founder@test.com");
        assertNotNull(token);

        AuthPrincipal principal = service.verifyToken(token);
        assertNotNull(principal);
        assertEquals(1L, principal.getId());
        assertEquals("founder", principal.getRole());
        assertEquals("founder@test.com", principal.getEmail());
    }

    @Test
    @DisplayName("Non-production startup does not fail when secret is missing, preserving dev login and registration flows")
    void testNonProductionStartupDoesNotFailWhenSecretMissing() {
        // In non-production, missing secret falls back to ephemeral key to keep dev flows working
        assertDoesNotThrow(() -> {
            AuthTokenService service = new AuthTokenService(null, 604800000L, false);
            String token = service.generateToken(42L, "user", "student@test.com");
            assertNotNull(token);

            AuthPrincipal principal = service.verifyToken(token);
            assertNotNull(principal);
            assertEquals(42L, principal.getId());
            assertEquals("user", principal.getRole());
        });
    }

    @Test
    @DisplayName("Non-production startup uses custom secret when provided")
    void testNonProductionStartupUsesSecretWhenProvided() {
        AuthTokenService service = new AuthTokenService("my-custom-dev-secret-for-testing", 604800000L, false);
        String token = service.generateToken(10L, "user", "test@test.com");
        AuthPrincipal principal = service.verifyToken(token);
        assertNotNull(principal);
        assertEquals(10L, principal.getId());
    }

    @Test
    @DisplayName("Spring MockEnvironment with prod profile halts when AUTH_TOKEN_SECRET is missing")
    void testSpringMockEnvironmentWithProdProfileFailsWhenMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService(env, null, 604800000L)
        );
        assertTrue(ex.getMessage().contains("missing"));
    }

    @Test
    @DisplayName("Spring MockEnvironment with prod profile halts when AUTH_TOKEN_SECRET is too weak")
    void testSpringMockEnvironmentWithProdProfileFailsWhenWeak() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                new AuthTokenService(env, "too-short", 604800000L)
        );
        assertTrue(ex.getMessage().contains("too weak"));
    }

    @Test
    @DisplayName("Spring MockEnvironment with prod profile succeeds when strong AUTH_TOKEN_SECRET is present")
    void testSpringMockEnvironmentWithProdProfileSucceedsWithStrongSecret() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("AUTH_TOKEN_SECRET", STRONG_SECRET);

        assertDoesNotThrow(() -> {
            AuthTokenService service = new AuthTokenService(env, null, 604800000L);
            String token = service.generateToken(99L, "founder", "founder@corp.com");
            AuthPrincipal p = service.verifyToken(token);
            assertEquals(99L, p.getId());
        });
    }

    @Test
    @DisplayName("Tampered tokens fail cryptographic verification")
    void testTamperedTokensFailVerification() {
        AuthTokenService service = new AuthTokenService(STRONG_SECRET, 604800000L, true);
        String token = service.generateToken(1L, "user", "user@test.com");

        // Tamper with payload
        String[] parts = token.split("\\.");
        String tamperedToken = parts[0] + "modified." + parts[1];
        assertNull(service.verifyToken(tamperedToken));

        // Tamper with signature
        String tamperedSigToken = parts[0] + "." + parts[1] + "X";
        assertNull(service.verifyToken(tamperedSigToken));
    }

    @Test
    @DisplayName("Expired tokens fail verification")
    void testExpiredTokensFailVerification() {
        // Set negative validity to simulate expired token
        AuthTokenService service = new AuthTokenService(STRONG_SECRET, -5000L, true);
        String token = service.generateToken(1L, "user", "user@test.com");
        assertNull(service.verifyToken(token));
    }

    @Test
    @DisplayName("Colons in email or role are sanitized to prevent delimiter collision")
    void testColonSanitizationPreventsDelimiterCollision() {
        AuthTokenService service = new AuthTokenService(STRONG_SECRET, 604800000L, true);
        String token = service.generateToken(5L, "founder:admin", "test:colon@domain.com");
        AuthPrincipal principal = service.verifyToken(token);
        assertNotNull(principal);
        assertEquals(5L, principal.getId());
        assertEquals("founderadmin", principal.getRole());
        assertEquals("testcolon@domain.com", principal.getEmail());
    }
}

