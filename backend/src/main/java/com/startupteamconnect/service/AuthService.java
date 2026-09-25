package com.startupteamconnect.service;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FounderRepository founderRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, FounderRepository founderRepository) {
        this.userRepository = userRepository;
        this.founderRepository = founderRepository;
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("An account with this email already exists.");
        }
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();
            
            boolean matches = passwordEncoder.matches(rawPassword, storedPassword) || rawPassword.equals(storedPassword);
            if (matches) {
                // Upgrade plain text password to BCrypt hash if legacy format
                if (!storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$")) {
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                }
                return user;
            }
        }
        throw new RuntimeException("Invalid email or password.");
    }

    public Founder registerFounder(Founder founder) {
        if (founderRepository.existsByEmail(founder.getEmail())) {
            throw new RuntimeException("A founder account with this email already exists.");
        }
        if (founder.getPassword() != null && !founder.getPassword().isEmpty()) {
            founder.setPassword(passwordEncoder.encode(founder.getPassword()));
        }
        return founderRepository.save(founder);
    }

    public Founder loginFounder(String email, String rawPassword) {
        Optional<Founder> founderOpt = founderRepository.findByEmail(email);
        if (founderOpt.isPresent()) {
            Founder founder = founderOpt.get();
            String storedPassword = founder.getPassword();

            boolean matches = passwordEncoder.matches(rawPassword, storedPassword) || rawPassword.equals(storedPassword);
            if (matches) {
                // Upgrade plain text password to BCrypt hash if legacy format
                if (!storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$")) {
                    founder.setPassword(passwordEncoder.encode(rawPassword));
                    founderRepository.save(founder);
                }
                return founder;
            }
        }
        throw new RuntimeException("Invalid email or password.");
    }
}
