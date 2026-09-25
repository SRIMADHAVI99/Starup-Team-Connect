package com.startupteamconnect.repository;

import com.startupteamconnect.model.Founder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FounderRepository extends JpaRepository<Founder, Long> {
    Optional<Founder> findByEmail(String email);
    boolean existsByEmail(String email);
}
