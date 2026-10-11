package com.startupteamconnect.security;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for issuing and verifying cryptographic HMAC-SHA256 authentication tokens.
 * Identity is derived strictly from server-verified tokens and never from client-supplied IDs.
 *
 * The secret key is loaded from the AUTH_TOKEN_SECRET environment variable.
 * In production environments, startup is halted if the secret is missing or too weak.
 */
@Service
public class AuthTokenService {

    private static final Logger log = LoggerFactory.getLogger(AuthTokenService.class);
    public static final int MIN_SECRET_LENGTH = 32;

    private static byte[] ephemeralDevKey;

    private final byte[] secretKeyBytes;
    private final long tokenValidityMs;

    /**
     * Primary Spring constructor.
     * Reads secret from AUTH_TOKEN_SECRET environment variable.
     */
    @Autowired
    public AuthTokenService(
            Environment env,
            @Value("${AUTH_TOKEN_SECRET:#{null}}") String envSecret,
            @Value("${app.auth.validity-ms:604800000}") long validityMs
    ) {
        this(resolveSecret(env, envSecret), validityMs, isProductionEnvironment(env));
    }

    /**
     * Explicit constructor with production flag (for unit testing and manual initialization).
     */
    public AuthTokenService(String secret, long validityMs, boolean isProduction) {
        this.tokenValidityMs = validityMs != 0 ? validityMs : 604800000L;

        if (isProduction) {
            if (isMissingSecret(secret)) {
                throw new IllegalStateException(
                        "Production startup aborted: AUTH_TOKEN_SECRET environment variable is missing. " +
                        "A secure HMAC secret is required in production."
                );
            }
            if (isWeakSecret(secret)) {
                throw new IllegalStateException(
                        "Production startup aborted: AUTH_TOKEN_SECRET is too weak. " +
                        "Production secret must be at least " + MIN_SECRET_LENGTH + " characters long and have sufficient entropy."
                );
            }
            this.secretKeyBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
        } else {
            if (!isMissingSecret(secret)) {
                this.secretKeyBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
            } else {
                log.warn("AUTH_TOKEN_SECRET environment variable is not set. Using an ephemeral in-memory key for development/test environment. Set AUTH_TOKEN_SECRET in production.");
                this.secretKeyBytes = getEphemeralDevKey();
            }
        }
    }

    /**
     * Constructor for non-production tests with explicit secret.
     */
    public AuthTokenService(String secret, long validityMs) {
        this(secret, validityMs, false);
    }

    public static boolean isMissingSecret(String secret) {
        return secret == null || secret.trim().isEmpty();
    }

    public static boolean isWeakSecret(String secret) {
        if (isMissingSecret(secret)) {
            return true;
        }
        String trimmed = secret.trim();
        if (trimmed.length() < MIN_SECRET_LENGTH) {
            return true;
        }
        String lower = trimmed.toLowerCase();
        if (lower.contains("changeme") || lower.contains("password") ||
            lower.contains("secret123") || lower.contains("placeholder") ||
            lower.contains("admin123") || lower.contains("12345678")) {
            return true;
        }
        long uniqueChars = trimmed.chars().distinct().count();
        return uniqueChars < 4;
    }

    public static boolean isProductionEnvironment(Environment env) {
        if (env != null) {
            for (String profile : env.getActiveProfiles()) {
                if ("prod".equalsIgnoreCase(profile) || "production".equalsIgnoreCase(profile)) {
                    return true;
                }
            }
            String appEnv = env.getProperty("APP_ENV");
            if ("prod".equalsIgnoreCase(appEnv) || "production".equalsIgnoreCase(appEnv)) {
                return true;
            }
            String environment = env.getProperty("ENVIRONMENT");
            if ("prod".equalsIgnoreCase(environment) || "production".equalsIgnoreCase(environment)) {
                return true;
            }
            String springProfiles = env.getProperty("spring.profiles.active");
            if (springProfiles != null && (springProfiles.contains("prod") || springProfiles.contains("production"))) {
                return true;
            }
            String prodMode = env.getProperty("app.production");
            if ("true".equalsIgnoreCase(prodMode)) {
                return true;
            }
        }
        String sysAppEnv = System.getenv("APP_ENV");
        if ("prod".equalsIgnoreCase(sysAppEnv) || "production".equalsIgnoreCase(sysAppEnv)) {
            return true;
        }
        String sysProfiles = System.getenv("SPRING_PROFILES_ACTIVE");
        return sysProfiles != null && (sysProfiles.contains("prod") || sysProfiles.contains("production"));
    }

    private static String resolveSecret(Environment env, String envSecret) {
        if (envSecret != null && !envSecret.trim().isEmpty()) {
            return envSecret.trim();
        }
        String sysEnv = System.getenv("AUTH_TOKEN_SECRET");
        if (sysEnv != null && !sysEnv.trim().isEmpty()) {
            return sysEnv.trim();
        }
        if (env != null) {
            String prop = env.getProperty("AUTH_TOKEN_SECRET");
            if (prop != null && !prop.trim().isEmpty()) {
                return prop.trim();
            }
            String altProp = env.getProperty("app.auth.secret");
            if (altProp != null && !altProp.trim().isEmpty()) {
                return altProp.trim();
            }
        }
        return null;
    }

    private static synchronized byte[] getEphemeralDevKey() {
        if (ephemeralDevKey == null) {
            ephemeralDevKey = new byte[32];
            new SecureRandom().nextBytes(ephemeralDevKey);
        }
        return ephemeralDevKey;
    }

    public String generateToken(Long id, String role, String email) {
        if (id == null) {
            throw new IllegalArgumentException("User ID is required to generate authentication token.");
        }
        long issuedAt = System.currentTimeMillis();
        long expiresAt = issuedAt + tokenValidityMs;
        String cleanRole = role != null ? role.replace(":", "").trim().toLowerCase() : "user";
        String cleanEmail = email != null ? email.replace(":", "").trim().toLowerCase() : "";
        String payload = id + ":" + cleanRole + ":" + cleanEmail + ":" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(encodedPayload);
        return encodedPayload + "." + signature;
    }

    public AuthPrincipal verifyToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        String cleanToken = token.trim();
        if (cleanToken.startsWith("Bearer ") || cleanToken.startsWith("bearer ")) {
            cleanToken = cleanToken.substring(7).trim();
        }

        String[] parts = cleanToken.split("\\.");
        if (parts.length != 2) {
            return null;
        }

        String encodedPayload = parts[0];
        String expectedSignature = sign(encodedPayload);

        // Constant-time signature comparison against timing attacks
        if (!MessageDigest.isEqual(parts[1].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            return null;
        }

        try {
            byte[] decoded = Base64.getUrlDecoder().decode(encodedPayload);
            String payload = new String(decoded, StandardCharsets.UTF_8);
            String[] fields = payload.split(":");
            if (fields.length != 4) {
                return null;
            }

            Long id = Long.valueOf(fields[0]);
            String role = fields[1];
            String email = fields[2];
            long expiresAt = Long.parseLong(fields[3]);

            if (System.currentTimeMillis() > expiresAt) {
                return null; // Token expired
            }

            return new AuthPrincipal(id, role, email);
        } catch (Exception e) {
            return null;
        }
    }

    public AuthPrincipal getAuthenticatedPrincipal(HttpServletRequest request) {
        if (request == null) return null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || authHeader.trim().isEmpty()) {
            return null;
        }
        return verifyToken(authHeader);
    }

    public AuthPrincipal requireAuthenticatedPrincipal(HttpServletRequest request) {
        AuthPrincipal principal = getAuthenticatedPrincipal(request);
        if (principal == null) {
            throw new SecurityException("Authentication required: missing, invalid, or expired authorization token.");
        }
        return principal;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKeyBytes, "HmacSHA256"));
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error signing auth token", e);
        }
    }
}
