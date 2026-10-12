package com.startupteamconnect.service;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.Team;
import com.startupteamconnect.model.TeamMember;
import com.startupteamconnect.model.TeamMessage;
import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.TeamMemberRepository;
import com.startupteamconnect.repository.TeamMessageRepository;
import com.startupteamconnect.repository.TeamRepository;
import com.startupteamconnect.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMessageRepository teamMessageRepository;
    private final UserRepository userRepository;
    private final FounderRepository founderRepository;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       TeamMessageRepository teamMessageRepository,
                       UserRepository userRepository,
                       FounderRepository founderRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamMessageRepository = teamMessageRepository;
        this.userRepository = userRepository;
        this.founderRepository = founderRepository;
    }

    /**
     * Consolidates duplicate teams created for the same startup.
     * Merges messages and members into the canonical (lowest ID) team.
     */
    @PostConstruct
    @Transactional
    public void consolidateDuplicateTeams() {
        try {
            List<Team> allTeams = teamRepository.findAll();
            Map<Long, List<Team>> teamsByStartup = allTeams.stream()
                    .filter(t -> t.getStartupId() != null)
                    .collect(Collectors.groupingBy(Team::getStartupId));

            for (Map.Entry<Long, List<Team>> entry : teamsByStartup.entrySet()) {
                List<Team> teams = entry.getValue();
                if (teams.size() > 1) {
                    teams.sort(Comparator.comparing(Team::getId));
                    Team canonical = teams.get(0);
                    for (int i = 1; i < teams.size(); i++) {
                        Team duplicate = teams.get(i);
                        // Repoint all messages to canonical team
                        List<TeamMessage> messages = teamMessageRepository.findByTeamId(duplicate.getId());
                        for (TeamMessage msg : messages) {
                            msg.setTeamId(canonical.getId());
                            teamMessageRepository.save(msg);
                        }
                        // Repoint members
                        List<TeamMember> members = teamMemberRepository.findByTeamId(duplicate.getId());
                        for (TeamMember member : members) {
                            boolean exists = teamMemberRepository.findByTeamId(canonical.getId()).stream()
                                    .anyMatch(m -> m.getUserId().equals(member.getUserId()));
                            if (!exists) {
                                member.setTeam(canonical);
                                teamMemberRepository.save(member);
                            } else {
                                teamMemberRepository.delete(member);
                            }
                        }
                        teamRepository.delete(duplicate);
                    }
                }
            }
        } catch (Exception e) {
            // Keep service alive if migration encountered edge case
        }
    }

    public Optional<Team> getTeamById(Long teamId) {
        return teamRepository.findById(teamId);
    }

    public Optional<Team> getTeamByStartup(Long startupId) {
        return teamRepository.findFirstByStartupIdOrderByIdAsc(startupId);
    }

    public List<Team> getTeamsForFounder(Long founderId) {
        if (founderId == null) {
            return Collections.emptyList();
        }
        return teamRepository.findByFounderIdOrderByIdAsc(founderId);
    }

    public Optional<Team> getTeamForUser(Long userId) {
        List<Team> teams = getTeamsForUser(userId);
        return teams.isEmpty() ? Optional.empty() : Optional.of(teams.get(0));
    }

    public List<Team> getTeamsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return teamRepository.findTeamsByMemberUserId(userId);
    }

    public List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    /**
     * Requirement 3: Check permissions on the backend for private team APIs.
     * Verify caller is either the assigned founder or an accepted member of the team.
     */
    public Team verifyTeamAccess(Long teamId, Long callerId, String callerRole) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        if (callerId == null) {
            throw new SecurityException("Unauthorized: Caller identity is required.");
        }

        boolean authorized = false;
        if (callerRole != null && callerRole.equalsIgnoreCase("founder")) {
            authorized = team.getFounderId().equals(callerId);
        } else if (callerRole != null && (callerRole.equalsIgnoreCase("user") || callerRole.equalsIgnoreCase("member"))) {
            authorized = teamMemberRepository.findByTeamId(teamId).stream()
                    .anyMatch(m -> m.getUserId().equals(callerId));
        } else {
            authorized = team.getFounderId().equals(callerId) ||
                    teamMemberRepository.findByTeamId(teamId).stream()
                            .anyMatch(m -> m.getUserId().equals(callerId));
        }

        if (!authorized) {
            throw new SecurityException("Unauthorized: You do not have permission to access this team.");
        }

        return team;
    }

    /**
     * Requirement: Validate that the sender exists and is authorized for the team before saving messages.
     */
    public TeamMessage postMessage(Long teamId, Long senderId, String senderName, String senderRole, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Message text cannot be empty.");
        }
        if (senderId == null) {
            throw new SecurityException("Unauthorized: Sender ID is required.");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        String resolvedName = senderName;

        if (senderRole != null && senderRole.equalsIgnoreCase("founder")) {
            Founder founder = founderRepository.findById(senderId)
                    .orElseThrow(() -> new SecurityException("Unauthorized: Founder account not found with ID: " + senderId));
            if (!team.getFounderId().equals(senderId)) {
                throw new SecurityException("Unauthorized: Only the assigned founder of this team may post founder messages.");
            }
            if (resolvedName == null || resolvedName.trim().isEmpty()) {
                resolvedName = founder.getName();
            }
        } else if (senderRole != null && (senderRole.equalsIgnoreCase("user") || senderRole.equalsIgnoreCase("member"))) {
            User user = userRepository.findById(senderId)
                    .orElseThrow(() -> new SecurityException("Unauthorized: User account not found with ID: " + senderId));
            boolean isMember = teamMemberRepository.findByTeamId(teamId).stream()
                    .anyMatch(m -> m.getUserId().equals(senderId));
            if (!isMember) {
                throw new SecurityException("Unauthorized: You must be an accepted team member to post in this team's chat.");
            }
            if (resolvedName == null || resolvedName.trim().isEmpty()) {
                resolvedName = user.getName();
            }
        } else {
            // Unspecified role: verify sender is either team founder or accepted member
            if (team.getFounderId().equals(senderId)) {
                senderRole = "founder";
                Founder founder = founderRepository.findById(senderId).orElse(null);
                if (founder != null && (resolvedName == null || resolvedName.trim().isEmpty())) {
                    resolvedName = founder.getName();
                }
            } else {
                boolean isMember = teamMemberRepository.findByTeamId(teamId).stream()
                        .anyMatch(m -> m.getUserId().equals(senderId));
                if (isMember) {
                    senderRole = "user";
                    User user = userRepository.findById(senderId).orElse(null);
                    if (user != null && (resolvedName == null || resolvedName.trim().isEmpty())) {
                        resolvedName = user.getName();
                    }
                } else {
                    throw new SecurityException("Unauthorized: Sender is not authorized for this team workspace.");
                }
            }
        }

        TeamMessage msg = new TeamMessage(teamId, senderId, resolvedName, senderRole, text.trim());
        return teamMessageRepository.save(msg);
    }

    /**
     * Requirement: Check team membership before returning private team messages.
     */
    public List<TeamMessage> getTeamMessages(Long teamId, Long callerId, String callerRole) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

        if (callerId == null) {
            throw new SecurityException("Unauthorized: Caller ID is required to access private team messages.");
        }

        boolean authorized = false;
        if (callerRole != null && callerRole.equalsIgnoreCase("founder")) {
            authorized = team.getFounderId().equals(callerId);
        } else if (callerRole != null && (callerRole.equalsIgnoreCase("user") || callerRole.equalsIgnoreCase("member"))) {
            authorized = teamMemberRepository.findByTeamId(teamId).stream()
                    .anyMatch(m -> m.getUserId().equals(callerId));
        } else {
            authorized = team.getFounderId().equals(callerId) ||
                    teamMemberRepository.findByTeamId(teamId).stream()
                            .anyMatch(m -> m.getUserId().equals(callerId));
        }

        if (!authorized) {
            throw new SecurityException("Unauthorized: You do not have permission to view this team's private messages.");
        }

        return teamMessageRepository.findByTeamIdOrderBySentAtAsc(teamId);
    }

    public List<TeamMessage> getTeamMessages(Long teamId) {
        return teamMessageRepository.findByTeamIdOrderBySentAtAsc(teamId);
    }
}
