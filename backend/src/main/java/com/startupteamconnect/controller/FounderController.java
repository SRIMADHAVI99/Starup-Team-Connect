package com.startupteamconnect.controller;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.repository.FounderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/founders")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class FounderController {

    private final FounderRepository founderRepository;

    public FounderController(FounderRepository founderRepository) {
        this.founderRepository = founderRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFounder(@PathVariable Long id) {
        return founderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFounder(@PathVariable Long id, @RequestBody Founder updated) {
        return founderRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setPhone(updated.getPhone());
                    existing.setBio(updated.getBio());
                    existing.setExperience(updated.getExperience());
                    existing.setInterests(updated.getInterests());
                    return ResponseEntity.ok(founderRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
