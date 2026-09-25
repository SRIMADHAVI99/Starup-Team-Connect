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
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
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
     * Requirement 20: SIMPLE TEAM CHAT
     */
    @PostMapping("/{teamId}/messages")
    public ResponseEntity<?> postMessage(@PathVariable Long teamId, @RequestBody Map<String, Object> body) {
        try {
            Long senderId = Long.valueOf(body.get("senderId").toString());
            String senderName = body.get("senderName").toString();
            String senderRole = body.get("senderRole").toString();
            String text = body.get("text").toString();

            TeamMessage msg = teamService.postMessage(teamId, senderId, senderName, senderRole, text);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{teamId}/messages")
    public List<TeamMessage> getTeamMessages(@PathVariable Long teamId) {
        return teamService.getTeamMessages(teamId);
    }
}
