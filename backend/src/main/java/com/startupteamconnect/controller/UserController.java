package com.startupteamconnect.controller;

import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setPhone(updated.getPhone());
                    existing.setBio(updated.getBio());
                    existing.setSkills(updated.getSkills());
                    existing.setExperience(updated.getExperience());
                    existing.setEducation(updated.getEducation());
                    existing.setPortfolioLink(updated.getPortfolioLink());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
