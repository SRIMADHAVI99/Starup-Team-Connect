package com.startupteamconnect.controller;

import com.startupteamconnect.model.SavedStartup;
import com.startupteamconnect.model.Startup;
import com.startupteamconnect.service.SavedStartupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-startups")
@CrossOrigin(origins = "*")
public class SavedStartupController {

    private final SavedStartupService savedStartupService;

    public SavedStartupController(SavedStartupService savedStartupService) {
        this.savedStartupService = savedStartupService;
    }

    @GetMapping("/user/{userId}")
    public List<Startup> getSavedStartupsByUser(@PathVariable Long userId) {
        return savedStartupService.getSavedStartupsByUser(userId);
    }

    @PostMapping
    public ResponseEntity<?> saveStartup(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            Long startupId = Long.valueOf(body.get("startupId").toString());
            SavedStartup saved = savedStartupService.saveStartupForUser(userId, startupId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> unsaveStartup(@RequestParam Long userId, @RequestParam Long startupId) {
        try {
            savedStartupService.unsaveStartupForUser(userId, startupId);
            return ResponseEntity.ok(Map.of("message", "Startup removed from saved items"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> isSaved(@RequestParam Long userId, @RequestParam Long startupId) {
        boolean saved = savedStartupService.isStartupSaved(userId, startupId);
        return ResponseEntity.ok(Map.of("isSaved", saved));
    }
}
