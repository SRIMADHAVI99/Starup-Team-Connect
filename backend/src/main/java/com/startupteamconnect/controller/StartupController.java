package com.startupteamconnect.controller;

import com.startupteamconnect.model.Startup;
import com.startupteamconnect.service.StartupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/startups")
@CrossOrigin(origins = "*")
public class StartupController {

    private final StartupService startupService;

    public StartupController(StartupService startupService) {
        this.startupService = startupService;
    }

    @PostMapping
    public ResponseEntity<?> createStartup(@RequestBody Startup startup) {
        try {
            Startup created = startupService.createStartup(startup);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Startup> getAllStartups() {
        return startupService.getAllStartups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStartupById(@PathVariable Long id) {
        return startupService.getStartupById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Requirement 17: DUPLICATE STARTUP TITLE CHECK
     * Endpoint: GET /api/startups/check-title?title=EcoTrack
     * Returns whether another startup already exists with this title.
     */
    @GetMapping("/check-title")
    public ResponseEntity<Map<String, Object>> checkTitle(@RequestParam String title) {
        boolean exists = startupService.isTitleTaken(title);
        return ResponseEntity.ok(Map.of(
                "title", title,
                "exists", exists
        ));
    }

    @GetMapping("/founder/{founderId}")
    public List<Startup> getStartupsByFounder(@PathVariable Long founderId) {
        return startupService.getStartupsByFounder(founderId);
    }
}
