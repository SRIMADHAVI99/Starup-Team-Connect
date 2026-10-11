package com.startupteamconnect.controller;

import com.startupteamconnect.model.Application;
import com.startupteamconnect.security.AuthPrincipal;
import com.startupteamconnect.security.AuthTokenService;
import com.startupteamconnect.service.ApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AuthTokenService authTokenService;

    public ApplicationController(ApplicationService applicationService, AuthTokenService authTokenService) {
        this.applicationService = applicationService;
        this.authTokenService = authTokenService;
    }

    /**
     * Requirement 11: APPLY TO JOIN
     * POST /api/applications
     * Strict server-verified user identity: derive applicant ID strictly from authenticated token.
     */
    @PostMapping
    public ResponseEntity<?> applyToStartup(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.isUser()) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Only users may apply to startups."));
            }

            Long userId = principal.getId();
            Long startupId = body.get("startupId") != null ? Long.valueOf(body.get("startupId").toString()) : null;
            String role = body.get("appliedRole") != null ? body.get("appliedRole").toString() : "Team Member";
            String note = body.get("note") != null ? body.get("note").toString() : "";

            Application application = applicationService.applyToStartup(userId, startupId, role, note);
            return ResponseEntity.ok(application);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getApplicationsByUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Cannot view another user's applications."));
            }
            return ResponseEntity.ok(applicationService.getApplicationsByUser(userId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/founder/{founderId}")
    public ResponseEntity<?> getApplicationsByFounder(@PathVariable Long founderId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.isFounder() || !principal.getId().equals(founderId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Cannot view another founder's applications."));
            }
            return ResponseEntity.ok(applicationService.getApplicationsByFounder(founderId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 12 & 13: FOUNDER APPLICATION ACCEPTANCE & TEAM FORMATION
     * PUT /api/applications/{id}/accept
     * Only the verified founder who owns the startup may accept its applications.
     * Identity is derived strictly from server-verified token, never from params, body or custom headers.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptApplication(@PathVariable Long id, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.isFounder()) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Only founders may accept applications."));
            }

            Long effectiveFounderId = principal.getId();
            Application accepted = applicationService.acceptApplication(id, effectiveFounderId);
            return ResponseEntity.ok(accepted);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 12: FOUNDER APPLICATION REJECTION
     * PUT /api/applications/{id}/reject
     * Only the verified founder who owns the startup may reject its applications.
     * Identity is derived strictly from server-verified token, never from params, body or custom headers.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.isFounder()) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Only founders may reject applications."));
            }

            Long effectiveFounderId = principal.getId();
            Application rejected = applicationService.rejectApplication(id, effectiveFounderId);
            return ResponseEntity.ok(rejected);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
