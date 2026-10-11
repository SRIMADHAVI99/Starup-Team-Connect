package com.startupteamconnect.security;

/**
 * Server-verified authenticated principal representing the logged-in entity.
 */
public class AuthPrincipal {

    private final Long id;
    private final String role; // "user" or "founder"
    private final String email;

    public AuthPrincipal(Long id, String role, String email) {
        this.id = id;
        this.role = role != null ? role.trim().toLowerCase() : "";
        this.email = email != null ? email.trim().toLowerCase() : "";
    }

    public Long getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public boolean isFounder() {
        return "founder".equalsIgnoreCase(role);
    }

    public boolean isUser() {
        return "user".equalsIgnoreCase(role);
    }
}
