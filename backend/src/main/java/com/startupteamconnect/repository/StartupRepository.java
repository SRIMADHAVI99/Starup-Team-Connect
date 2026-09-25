package com.startupteamconnect.repository;

import com.startupteamconnect.model.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StartupRepository extends JpaRepository<Startup, Long> {
    boolean existsByTitleIgnoreCase(String title);
    Optional<Startup> findByTitleIgnoreCase(String title);
    List<Startup> findByFounderId(Long founderId);
    List<Startup> findByCategoryIgnoreCase(String category);
}
