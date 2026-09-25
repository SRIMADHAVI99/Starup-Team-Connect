package com.startupteamconnect.service;

import com.startupteamconnect.model.Team;
import com.startupteamconnect.model.TeamMember;
import com.startupteamconnect.model.TeamMessage;
import com.startupteamconnect.repository.TeamMemberRepository;
import com.startupteamconnect.repository.TeamMessageRepository;
import com.startupteamconnect.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMessageRepository teamMessageRepository;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       TeamMessageRepository teamMessageRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamMessageRepository = teamMessageRepository;
    }

    public Optional<Team> getTeamByStartup(Long startupId) {
        return teamRepository.findByStartupId(startupId);
    }

    public List<Team> getTeamsForFounder(Long founderId) {
        return teamRepository.findByFounderId(founderId);
    }

    public Optional<Team> getTeamForUser(Long userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        if (!memberships.isEmpty()) {
            return teamRepository.findById(memberships.get(0).getTeam().getId());
        }
        return Optional.empty();
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    public TeamMessage postMessage(Long teamId, Long senderId, String senderName, String senderRole, String text) {
        TeamMessage msg = new TeamMessage(teamId, senderId, senderName, senderRole, text);
        return teamMessageRepository.save(msg);
    }

    public List<TeamMessage> getTeamMessages(Long teamId) {
        return teamMessageRepository.findByTeamIdOrderBySentAtAsc(teamId);
    }
}
