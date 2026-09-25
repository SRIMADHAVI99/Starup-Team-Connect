package com.startupteamconnect.service;

import com.startupteamconnect.model.Startup;
import com.startupteamconnect.repository.StartupRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StartupService {

    private final StartupRepository startupRepository;

    public StartupService(StartupRepository startupRepository) {
        this.startupRepository = startupRepository;
    }

    private String normalizeTitle(String title) {
        if (title == null) return "";
        return title.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    public Startup createStartup(Startup startup) {
        if (isTitleTaken(startup.getTitle())) {
            throw new RuntimeException("A startup with this title already exists. Please choose a different title.");
        }
        return startupRepository.save(startup);
    }

    public List<Startup> getAllStartups() {
        return startupRepository.findAll();
    }

    public Optional<Startup> getStartupById(Long id) {
        return startupRepository.findById(id);
    }

    public boolean isTitleTaken(String title) {
        String normalizedInput = normalizeTitle(title);
        if (normalizedInput.isEmpty()) {
            return false;
        }
        return startupRepository.findAll().stream()
                .anyMatch(s -> normalizeTitle(s.getTitle()).equals(normalizedInput));
    }

    public List<Startup> getStartupsByFounder(Long founderId) {
        return startupRepository.findByFounderId(founderId);
    }
}
