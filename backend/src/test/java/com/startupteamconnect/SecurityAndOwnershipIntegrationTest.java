package com.startupteamconnect;

import com.startupteamconnect.model.Application;
import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.Startup;
import com.startupteamconnect.model.Team;
import com.startupteamconnect.model.TeamMember;
import com.startupteamconnect.model.TeamMessage;
import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.ApplicationRepository;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.StartupRepository;
import com.startupteamconnect.repository.TeamMemberRepository;
import com.startupteamconnect.repository.TeamMessageRepository;
import com.startupteamconnect.repository.TeamRepository;
import com.startupteamconnect.repository.UserRepository;
import com.startupteamconnect.security.AuthTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityAndOwnershipIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthTokenService authTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FounderRepository founderRepository;

    @Autowired
    private StartupRepository startupRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamMessageRepository teamMessageRepository;

    private Founder assignedFounder;
    private Founder otherFounder;
    private User teamMemberUser;
    private User outsiderUser;
    private Startup testStartup;
    private Team testTeam;
    private Application testApp;

    private String assignedFounderToken;
    private String otherFounderToken;
    private String memberUserToken;
    private String outsiderUserToken;

    @BeforeEach
    void setUp() {
        teamMessageRepository.deleteAll();
        teamMemberRepository.deleteAll();
        teamRepository.deleteAll();
        applicationRepository.deleteAll();
        startupRepository.deleteAll();

        // 1. Create Assigned Founder
        assignedFounder = founderRepository.findByEmail("test_assigned_founder@test.com")
                .orElseGet(() -> {
                    Founder f = new Founder("Assigned Founder", "test_assigned_founder@test.com", "pass123", "AI", "5 yrs");
                    return founderRepository.save(f);
                });
        assignedFounderToken = authTokenService.generateToken(assignedFounder.getId(), "founder", assignedFounder.getEmail());

        // 2. Create Other (Unassigned) Founder
        otherFounder = founderRepository.findByEmail("test_other_founder@test.com")
                .orElseGet(() -> {
                    Founder f = new Founder("Other Founder", "test_other_founder@test.com", "pass123", "EdTech", "3 yrs");
                    return founderRepository.save(f);
                });
        otherFounderToken = authTokenService.generateToken(otherFounder.getId(), "founder", otherFounder.getEmail());

        // 3. Create Valid Team Member User
        teamMemberUser = userRepository.findByEmail("test_member@test.com")
                .orElseGet(() -> {
                    User u = new User("Team Member Bob", "test_member@test.com", "pass123", "Java, SQL", "Intermediate", "B.Tech");
                    return userRepository.save(u);
                });
        memberUserToken = authTokenService.generateToken(teamMemberUser.getId(), "user", teamMemberUser.getEmail());

        // 4. Create Outsider User (not in team)
        outsiderUser = userRepository.findByEmail("test_outsider@test.com")
                .orElseGet(() -> {
                    User u = new User("Outsider Alice", "test_outsider@test.com", "pass123", "Python", "Beginner", "B.Tech");
                    return userRepository.save(u);
                });
        outsiderUserToken = authTokenService.generateToken(outsiderUser.getId(), "user", outsiderUser.getEmail());

        // 5. Create Startup owned by Assigned Founder
        testStartup = new Startup();
        testStartup.setTitle("Alpha AI Platform");
        testStartup.setShortDescription("Building cutting-edge AI");
        testStartup.setCategory("AI, Tech");
        testStartup.setRequiredRoles("Java Developer");
        testStartup.setRequiredSkills("Java, SQL");
        testStartup.setTeamSize("4");
        testStartup.setFounderId(assignedFounder.getId());
        testStartup.setFounderName(assignedFounder.getName());
        testStartup = startupRepository.save(testStartup);

        // 6. Create Team for this Startup
        testTeam = new Team(testStartup.getId(), testStartup.getTitle(), assignedFounder.getId(), assignedFounder.getName());
        testTeam = teamRepository.save(testTeam);

        // 7. Add teamMemberUser as an accepted member of testTeam
        TeamMember member = new TeamMember(testTeam, teamMemberUser.getId(), teamMemberUser.getName(), "Java Developer", teamMemberUser.getSkills());
        teamMemberRepository.save(member);

        // 8. Create Application for Outsider User to the Startup
        testApp = new Application();
        testApp.setUserId(outsiderUser.getId());
        testApp.setUserName(outsiderUser.getName());
        testApp.setUserEmail(outsiderUser.getEmail());
        testApp.setUserSkills(outsiderUser.getSkills());
        testApp.setStartupId(testStartup.getId());
        testApp.setStartupTitle(testStartup.getTitle());
        testApp.setFounderId(assignedFounder.getId());
        testApp.setAppliedRole("Python Dev");
        testApp.setStatus("PENDING");
        testApp = applicationRepository.save(testApp);
    }

    // =========================================================================
    // 1. UNAUTHORIZED ACCESS TESTS
    // =========================================================================

    @Test
    @DisplayName("Team details without token returns 401 Unauthorized")
    void testGetTeamDetailsWithoutToken() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Team members without token returns 401 Unauthorized")
    void testGetTeamMembersWithoutToken() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/members"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Team messages without token returns 401 Unauthorized")
    void testGetTeamMessagesWithoutToken() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/messages"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Post team message without token returns 401 Unauthorized")
    void testPostTeamMessageWithoutToken() throws Exception {
        mockMvc.perform(post("/api/teams/" + testTeam.getId() + "/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Hello unauthorized\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Accept application without token returns 401 Unauthorized")
    void testAcceptApplicationWithoutToken() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/accept"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Reject application without token returns 401 Unauthorized")
    void testRejectApplicationWithoutToken() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/reject"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Invalid or tampered token returns 401 Unauthorized")
    void testInvalidTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .header("Authorization", "Bearer invalid.fake.token.12345"))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // 2. VALID TEAM MEMBER ACCESS TESTS
    // =========================================================================

    @Test
    @DisplayName("Valid team member can access team details")
    void testValidMemberAccessTeamDetails() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .header("Authorization", "Bearer " + memberUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTeam.getId()))
                .andExpect(jsonPath("$.startupTitle").value("Alpha AI Platform"));
    }

    @Test
    @DisplayName("Valid team member can access team members list")
    void testValidMemberAccessTeamMembers() throws Exception {
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/members")
                        .header("Authorization", "Bearer " + memberUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(teamMemberUser.getId()));
    }

    @Test
    @DisplayName("Valid team member can view team messages and post message")
    void testValidMemberChatOperations() throws Exception {
        // Post message
        mockMvc.perform(post("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + memberUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Hi team, ready to work!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderId").value(teamMemberUser.getId()))
                .andExpect(jsonPath("$.text").value("Hi team, ready to work!"));

        // Read messages
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + memberUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].text").value("Hi team, ready to work!"));
    }

    @Test
    @DisplayName("Non-member user is rejected from private team details and messages with 403 Forbidden")
    void testNonMemberDeniedAccess() throws Exception {
        // Details
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .header("Authorization", "Bearer " + outsiderUserToken))
                .andExpect(status().isForbidden());

        // Messages
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + outsiderUserToken))
                .andExpect(status().isForbidden());

        // Post
        mockMvc.perform(post("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + outsiderUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Intruder message\"}"))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 3. ASSIGNED FOUNDER ACCESS TESTS
    // =========================================================================

    @Test
    @DisplayName("Assigned founder can access team details, members, and post messages")
    void testAssignedFounderAccess() throws Exception {
        // Details
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .header("Authorization", "Bearer " + assignedFounderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.founderId").value(assignedFounder.getId()));

        // Members
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/members")
                        .header("Authorization", "Bearer " + assignedFounderToken))
                .andExpect(status().isOk());

        // Post founder message
        mockMvc.perform(post("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + assignedFounderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Welcome team! Let us begin sprint 1.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senderId").value(assignedFounder.getId()))
                .andExpect(jsonPath("$.senderRole").value("founder"));
    }

    @Test
    @DisplayName("Unassigned founder is rejected with 403 Forbidden when trying to access other founder's team")
    void testUnassignedFounderDeniedAccess() throws Exception {
        // Details
        mockMvc.perform(get("/api/teams/" + testTeam.getId())
                        .header("Authorization", "Bearer " + otherFounderToken))
                .andExpect(status().isForbidden());

        // Members
        mockMvc.perform(get("/api/teams/" + testTeam.getId() + "/members")
                        .header("Authorization", "Bearer " + otherFounderToken))
                .andExpect(status().isForbidden());

        // Post
        mockMvc.perform(post("/api/teams/" + testTeam.getId() + "/messages")
                        .header("Authorization", "Bearer " + otherFounderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Unauthorized founder post\"}"))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // 4. APPLICATION OWNERSHIP TESTS
    // =========================================================================

    @Test
    @DisplayName("Assigned founder can accept application and automatically form/join team")
    void testAssignedFounderCanAcceptApplication() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/accept")
                        .header("Authorization", "Bearer " + assignedFounderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test
    @DisplayName("Assigned founder can reject application")
    void testAssignedFounderCanRejectApplication() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/reject")
                        .header("Authorization", "Bearer " + assignedFounderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @DisplayName("Different founder cannot accept application even with forged query param or body")
    void testOtherFounderCannotAcceptApplication() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/accept?founderId=" + assignedFounder.getId())
                        .header("Authorization", "Bearer " + otherFounderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"founderId\":" + assignedFounder.getId() + "}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Different founder cannot reject application")
    void testOtherFounderCannotRejectApplication() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/reject")
                        .header("Authorization", "Bearer " + otherFounderToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Regular user cannot accept application (role restriction)")
    void testUserCannotAcceptApplication() throws Exception {
        mockMvc.perform(put("/api/applications/" + testApp.getId() + "/accept")
                        .header("Authorization", "Bearer " + memberUserToken))
                .andExpect(status().isForbidden());
    }
}
