package com.startupteamconnect.controller;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.User;
import com.startupteamconnect.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registered = authService.registerUser(user);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            User user = authService.loginUser(email, password);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/founders/register")
    public ResponseEntity<?> registerFounder(@RequestBody Founder founder) {
        try {
            Founder registered = authService.registerFounder(founder);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/founders/login")
    public ResponseEntity<?> loginFounder(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            Founder founder = authService.loginFounder(email, password);
            return ResponseEntity.ok(founder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
