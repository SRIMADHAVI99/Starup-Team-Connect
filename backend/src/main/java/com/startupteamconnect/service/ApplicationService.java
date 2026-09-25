package com.startupteamconnect.service;

import com.startupteamconnect.model.*;
import com.startupteamconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final StartupRepository startupRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMessageRepository teamMessageRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              StartupRepository startupRepository,
                              TeamRepository teamRepository,
                              TeamMemberRepository teamMemberRepository,
                              TeamMessageRepository teamMessageRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.startupRepository = startupRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamMessageRepository = teamMessageRepository;
    }

    public Application applyToStartup(Long userId, Long startupId, String role, String note) {
        // Prevent duplicate applications by same user to same startup (Requirement 11)
        if (applicationRepository.existsByUserIdAndStartupId(userId, startupId)) {
            throw new RuntimeException("You have already applied to this startup.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found"));

        Application app = new Application();
        app.setUserId(user.getId());
        app.setUserName(user.getName());
        app.setUserEmail(user.getEmail());
        app.setUserSkills(user.getSkills());

        app.setStartupId(startup.getId());
        app.setStartupTitle(startup.getTitle());
        app.setFounderId(startup.getFounderId());
        app.setAppliedRole(role != null && !role.trim().isEmpty() ? role : "Team Member");
        app.setNote(note);
        app.setStatus("PENDING");

        return applicationRepository.save(app);
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public List<Application> getApplicationsByFounder(Long founderId) {
        return applicationRepository.findByFounderId(founderId);
    }

    /**
     * Requirement 13: TEAM FORMATION
     * When founder clicks ACCEPT:
     * 1. Application status becomes ACCEPTED.
     * 2. Automatically form or join a TEAM relationship in MySQL.
     */
    @Transactional
    public Application acceptApplication(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus("ACCEPTED");
        Application updatedApp = applicationRepository.save(app);

        // Check if team already exists for this startup
        Team team = teamRepository.findByStartupId(app.getStartupId())
                .orElseGet(() -> {
                    Startup startup = startupRepository.findById(app.getStartupId()).orElse(null);
                    String founderName = startup != null ? startup.getFounderName() : "Founder";
                    Team newTeam = new Team(app.getStartupId(), app.getStartupTitle(), app.getFounderId(), founderName);
                    Team savedTeam = teamRepository.save(newTeam);

                    // Add welcome message in team chat
                    TeamMessage welcomeMsg = new TeamMessage(
                            savedTeam.getId(),
                            app.getFounderId(),
                            founderName,
                            "founder",
                            "Welcome to the " + app.getStartupTitle() + " Team! Let's build something great together."
                    );
                    teamMessageRepository.save(welcomeMsg);

                    return savedTeam;
                });

        // Add user as TeamMember if not already in team
        boolean alreadyMember = teamMemberRepository.findByTeamId(team.getId()).stream()
                .anyMatch(m -> m.getUserId().equals(app.getUserId()));

        if (!alreadyMember) {
            TeamMember member = new TeamMember(team, app.getUserId(), app.getUserName(), app.getAppliedRole(), app.getUserSkills());
            teamMemberRepository.save(member);
        }

        return updatedApp;
    }

    public Application rejectApplication(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus("REJECTED");
        return applicationRepository.save(app);
    }
}
