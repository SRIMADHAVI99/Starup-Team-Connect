package com.startupteamconnect.controller;

import com.startupteamconnect.model.Team;
import com.startupteamconnect.model.TeamMember;
import com.startupteamconnect.model.TeamMessage;
import com.startupteamconnect.security.AuthPrincipal;
import com.startupteamconnect.security.AuthTokenService;
import com.startupteamconnect.service.TeamService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class TeamController {

    private final TeamService teamService;
    private final AuthTokenService authTokenService;

    public TeamController(TeamService teamService, AuthTokenService authTokenService) {
        this.teamService = teamService;
        this.authTokenService = authTokenService;
    }

    /**
     * Requirement 3: Protect private team details API.
     * Verify caller authentication and team membership/ownership permissions.
     */
    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeamById(@PathVariable Long teamId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            teamService.verifyTeamAccess(teamId, principal.getId(), principal.getRole());
            return teamService.getTeamById(teamId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 13: View team for User (Protected)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTeamForUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.getId().equals(userId) && !principal.isFounder()) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Cannot view another user's team."));
            }
            return teamService.getTeamForUser(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<?> getTeamsForUser(@PathVariable Long userId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.getId().equals(userId) && !principal.isFounder()) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Cannot view another user's teams."));
            }
            return ResponseEntity.ok(teamService.getTeamsForUser(userId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 13: View teams for Founder (Protected)
     */
    @GetMapping("/founder/{founderId}")
    public ResponseEntity<?> getTeamsForFounder(@PathVariable Long founderId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            if (!principal.isFounder() || !principal.getId().equals(founderId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: Cannot view another founder's teams."));
            }
            return ResponseEntity.ok(teamService.getTeamsForFounder(founderId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 3: Protect private team members API.
     */
    @GetMapping("/{teamId}/members")
    public ResponseEntity<?> getTeamMembers(@PathVariable Long teamId, HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }
            teamService.verifyTeamAccess(teamId, principal.getId(), principal.getRole());
            return ResponseEntity.ok(teamService.getTeamMembers(teamId));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 2 & 3: SECURED TEAM CHAT POSTING
     * Validate sender via server-verified token strictly.
     * Never trust sender ID or role from request body, query params or custom headers.
     */
    @PostMapping("/{teamId}/messages")
    public ResponseEntity<?> postMessage(@PathVariable Long teamId,
                                         @RequestBody Map<String, Object> body,
                                         HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }

            // Strictly server-verified identity:
            Long senderId = principal.getId();
            String senderRole = principal.getRole();
            String text = body.get("text") != null ? body.get("text").toString() : "";

            TeamMessage msg = teamService.postMessage(teamId, senderId, null, senderRole, text);
            return ResponseEntity.ok(msg);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Requirement 2 & 3: SECURED TEAM CHAT RETRIEVAL
     * Check team membership before returning private team messages using server-verified token.
     * Never trust caller identity from query parameters or headers.
     */
    @GetMapping("/{teamId}/messages")
    public ResponseEntity<?> getTeamMessages(@PathVariable Long teamId,
                                             HttpServletRequest request) {
        try {
            AuthPrincipal principal = authTokenService.getAuthenticatedPrincipal(request);
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required."));
            }

            // Strictly server-verified identity:
            Long callerId = principal.getId();
            String callerRole = principal.getRole();

            List<TeamMessage> msgs = teamService.getTeamMessages(teamId, callerId, callerRole);
            return ResponseEntity.ok(msgs);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
