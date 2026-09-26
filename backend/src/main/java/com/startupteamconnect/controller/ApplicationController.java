package com.startupteamconnect.controller;

import com.startupteamconnect.model.Application;
import com.startupteamconnect.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Requirement 11: APPLY TO JOIN
     * POST /api/applications
     */
    @PostMapping
    public ResponseEntity<?> applyToStartup(@RequestBody Map<String, Object> body) {
        try {
            Long userId = body.get("userId") != null ? Long.valueOf(body.get("userId").toString()) : null;
            Long startupId = body.get("startupId") != null ? Long.valueOf(body.get("startupId").toString()) : null;
            String role = body.get("appliedRole") != null ? body.get("appliedRole").toString() : "Team Member";
            String note = body.get("note") != null ? body.get("note").toString() : "";

            Application application = applicationService.applyToStartup(userId, startupId, role, note);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public List<Application> getApplicationsByUser(@PathVariable Long userId) {
        return applicationService.getApplicationsByUser(userId);
    }

    @GetMapping("/founder/{founderId}")
    public List<Application> getApplicationsByFounder(@PathVariable Long founderId) {
        return applicationService.getApplicationsByFounder(founderId);
    }

    /**
     * Requirement 12 & 13: FOUNDER APPLICATION ACCEPTANCE & TEAM FORMATION
     * PUT /api/applications/{id}/accept
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptApplication(@PathVariable Long id) {
        try {
            Application accepted = applicationService.acceptApplication(id);
            return ResponseEntity.ok(accepted);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Requirement 12: FOUNDER APPLICATION REJECTION
     * PUT /api/applications/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id) {
        try {
            Application rejected = applicationService.rejectApplication(id);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
