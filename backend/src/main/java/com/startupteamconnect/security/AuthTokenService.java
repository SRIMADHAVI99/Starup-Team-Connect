package com.startupteamconnect.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Service for issuing and verifying cryptographic HMAC-SHA256 authentication tokens.
 * Identity is derived strictly from server-verified tokens and never from client-supplied IDs.
 */
@Service
public class AuthTokenService {

    private final byte[] secretKeyBytes;
    private final long tokenValidityMs;

    public AuthTokenService(
            @Value("${app.auth.secret:startup-team-connect-secure-hmac-secret-key-2026-viva-grade-pbl}") String secret,
            @Value("${app.auth.validity-ms:604800000}") long validityMs // Default 7 days
    ) {
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.tokenValidityMs = validityMs;
    }

    public String generateToken(Long id, String role, String email) {
        if (id == null) {
            throw new IllegalArgumentException("User ID is required to generate authentication token.");
        }
        long issuedAt = System.currentTimeMillis();
        long expiresAt = issuedAt + tokenValidityMs;
        String payload = id + ":" + (role != null ? role.trim().toLowerCase() : "user") + ":" + (email != null ? email.trim().toLowerCase() : "") + ":" + expiresAt;
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
