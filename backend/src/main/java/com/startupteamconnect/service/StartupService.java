package com.startupteamconnect.service;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.Startup;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.StartupRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StartupService {

    private final StartupRepository startupRepository;
    private final FounderRepository founderRepository;

    public StartupService(StartupRepository startupRepository, FounderRepository founderRepository) {
        this.startupRepository = startupRepository;
        this.founderRepository = founderRepository;
    }

    private String normalizeTitle(String title) {
        if (title == null) return "";
        return title.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    public Startup createStartup(Startup startup) {
        if (startup.getFounderId() == null) {
            throw new IllegalArgumentException("Founder ID is required to create a startup.");
        }
        Founder founder = founderRepository.findById(startup.getFounderId())
                .orElseThrow(() -> new IllegalArgumentException("Founder not found with ID: " + startup.getFounderId()));

        if (isTitleTaken(startup.getTitle())) {
            throw new IllegalArgumentException("A startup with this title already exists. Please choose a different title.");
        }

        startup.setFounderName(founder.getName());
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
