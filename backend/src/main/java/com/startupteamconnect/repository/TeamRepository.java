package com.startupteamconnect.repository;

import com.startupteamconnect.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByStartupId(Long startupId);
    Optional<Team> findFirstByStartupIdOrderByIdAsc(Long startupId);
    List<Team> findAllByStartupIdOrderByIdAsc(Long startupId);
    List<Team> findByFounderId(Long founderId);
    List<Team> findByFounderIdOrderByIdAsc(Long founderId);

    @Query("SELECT DISTINCT t FROM Team t JOIN t.members m WHERE m.userId = :userId ORDER BY t.id ASC")
    List<Team> findTeamsByMemberUserId(@Param("userId") Long userId);
}
