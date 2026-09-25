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

    public Startup createStartup(Startup startup) {
        if (startupRepository.existsByTitleIgnoreCase(startup.getTitle())) {
            throw new RuntimeException("Startup exists with this title.");
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
        if (title == null || title.trim().isEmpty()) {
            return false;
        }
        return startupRepository.existsByTitleIgnoreCase(title.trim());
    }

    public List<Startup> getStartupsByFounder(Long founderId) {
        return startupRepository.findByFounderId(founderId);
    }
}
