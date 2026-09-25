package com.startupteamconnect.service;

import com.startupteamconnect.model.SavedStartup;
import com.startupteamconnect.model.Startup;
import com.startupteamconnect.repository.SavedStartupRepository;
import com.startupteamconnect.repository.StartupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class SavedStartupService {

    private final SavedStartupRepository savedStartupRepository;
    private final StartupRepository startupRepository;

    public SavedStartupService(SavedStartupRepository savedStartupRepository, StartupRepository startupRepository) {
        this.savedStartupRepository = savedStartupRepository;
        this.startupRepository = startupRepository;
    }

    public List<Startup> getSavedStartupsByUser(Long userId) {
        List<SavedStartup> saved = savedStartupRepository.findByUserId(userId);
        return saved.stream()
                .map(s -> startupRepository.findById(s.getStartupId()).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public SavedStartup saveStartupForUser(Long userId, Long startupId) {
        if (savedStartupRepository.findByUserIdAndStartupId(userId, startupId).isPresent()) {
            return savedStartupRepository.findByUserIdAndStartupId(userId, startupId).get();
        }
        SavedStartup saved = new SavedStartup(userId, startupId);
        return savedStartupRepository.save(saved);
    }

    @Transactional
    public void unsaveStartupForUser(Long userId, Long startupId) {
        savedStartupRepository.deleteByUserIdAndStartupId(userId, startupId);
    }

    public boolean isStartupSaved(Long userId, Long startupId) {
        return savedStartupRepository.findByUserIdAndStartupId(userId, startupId).isPresent();
    }
}
