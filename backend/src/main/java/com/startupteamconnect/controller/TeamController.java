package com.startupteamconnect.controller;

import com.startupteamconnect.model.Team;
import com.startupteamconnect.model.TeamMember;
import com.startupteamconnect.model.TeamMessage;
import com.startupteamconnect.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<?> getTeamById(@PathVariable Long teamId) {
        return teamService.getTeamById(teamId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Requirement 13: View team for User
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTeamForUser(@PathVariable Long userId) {
        return teamService.getTeamForUser(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}/all")
    public List<Team> getTeamsForUser(@PathVariable Long userId) {
        return teamService.getTeamsForUser(userId);
    }

    /**
     * Requirement 13: View teams for Founder
     */
    @GetMapping("/founder/{founderId}")
    public List<Team> getTeamsForFounder(@PathVariable Long founderId) {
        return teamService.getTeamsForFounder(founderId);
    }

    @GetMapping("/{teamId}/members")
    public List<TeamMember> getTeamMembers(@PathVariable Long teamId) {
        return teamService.getTeamMembers(teamId);
    }

    /**
     * Requirement 20: SECURED TEAM CHAT
     * Validate that sender exists and is authorized for the team before saving.
     */
    @PostMapping("/{teamId}/messages")
    public ResponseEntity<?> postMessage(@PathVariable Long teamId,
                                         @RequestBody Map<String, Object> body,
                                         @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
                                         @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        try {
            Long senderId = body.get("senderId") != null ? Long.valueOf(body.get("senderId").toString()) : headerUserId;
            String senderName = body.get("senderName") != null ? body.get("senderName").toString() : "";
            String senderRole = body.get("senderRole") != null ? body.get("senderRole").toString() : headerUserRole;
            String text = body.get("text") != null ? body.get("text").toString() : "";

            TeamMessage msg = teamService.postMessage(teamId, senderId, senderName, senderRole, text);
            return ResponseEntity.ok(msg);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check team membership before returning private team messages.
     */
    @GetMapping("/{teamId}/messages")
    public ResponseEntity<?> getTeamMessages(@PathVariable Long teamId,
                                             @RequestParam(required = false) Long userId,
                                             @RequestParam(required = false) String role,
                                             @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
                                             @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {
        Long callerId = userId != null ? userId : headerUserId;
        String callerRole = role != null ? role : headerUserRole;
        try {
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
