package com.startupteamconnect.repository;

import com.startupteamconnect.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    List<Application> findByFounderId(Long founderId);
    List<Application> findByStartupId(Long startupId);
    boolean existsByUserIdAndStartupId(Long userId, Long startupId);
}
