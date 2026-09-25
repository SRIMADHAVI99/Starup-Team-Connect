package com.startupteamconnect.repository;

import com.startupteamconnect.model.SavedStartup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedStartupRepository extends JpaRepository<SavedStartup, Long> {
    List<SavedStartup> findByUserId(Long userId);
    Optional<SavedStartup> findByUserIdAndStartupId(Long userId, Long startupId);
    void deleteByUserIdAndStartupId(Long userId, Long startupId);
}
