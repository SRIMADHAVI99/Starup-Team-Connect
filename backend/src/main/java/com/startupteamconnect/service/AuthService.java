package com.startupteamconnect.service;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final FounderRepository founderRepository;

    public AuthService(UserRepository userRepository, FounderRepository founderRepository) {
        this.userRepository = userRepository;
        this.founderRepository = founderRepository;
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("An account with this email already exists.");
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }
        throw new RuntimeException("Invalid email or password.");
    }

    public Founder registerFounder(Founder founder) {
        if (founderRepository.existsByEmail(founder.getEmail())) {
            throw new RuntimeException("A founder account with this email already exists.");
        }
        return founderRepository.save(founder);
    }

    public Founder loginFounder(String email, String password) {
        Optional<Founder> founderOpt = founderRepository.findByEmail(email);
        if (founderOpt.isPresent() && founderOpt.get().getPassword().equals(password)) {
            return founderOpt.get();
        }
        throw new RuntimeException("Invalid email or password.");
    }
}
