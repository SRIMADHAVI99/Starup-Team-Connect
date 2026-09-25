package com.startupteamconnect.repository;

import com.startupteamconnect.model.TeamMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMessageRepository extends JpaRepository<TeamMessage, Long> {
    List<TeamMessage> findByTeamIdOrderBySentAtAsc(Long teamId);
}
