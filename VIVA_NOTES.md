# STARTUP TEAM CONNECT - VIVA & PROJECT PRESENTATION GUIDE

> **Semester Project:** 3rd Year CSE  
> **Topic:** Startup Team Connect (A Collaborative Platform Connecting Founders with Skilled Talent)  
> **Tech Stack:** Plain HTML5, CSS3, Vanilla JavaScript (ES modules) with Vite + Java Spring Boot (v3.3.4) + File-based H2 Database (MySQL compatibility mode)  

---

## 1. High-Level Architecture Explanation

During your viva, draw or explain the 5-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│     1. Vanilla Frontend (HTML5, CSS3, Vanilla JS, Vite)│
│  - Modern Vanilla JavaScript (ES modules) & CSS3       │
│  - Role Switcher ([User] & [Founder])                  │
│  - Rule-based Skill Matcher (% compatibility)          │
│  - Live Duplicate Title Check                          │
│  - Auto-refreshing 2s Polling Team Discussion Chat     │
│  - Interactive Rule-based Chatbot                      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST API (JSON) / Authorization: Bearer <HMAC-Token>
                            ▼
┌────────────────────────────────────────────────────────┐
│            2. Spring Boot Controller Layer             │
│  - AuthController, StartupController,                  │
│    ApplicationController, TeamController, etc.         │
│  - Validates cryptographic Bearer token                │
│  - Never trusts client-supplied IDs or roles           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                3. Business Service Layer               │
│  - AuthService, StartupService,                        │
│    ApplicationService, TeamService, AuthTokenService   │
│  - Server-verified permissions on private team data    │
│  - Handles business rules: duplicate titles,          │
│    preventing double apply, automatic team formation   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             4. Spring Data JPA Repositories            │
│  - Interfaces extending JpaRepository<Entity, ID>      │
│  - Hibernate generates SQL queries automatically       │
└───────────────────────────┬────────────────────────────┘
                            │ JDBC Driver (org.h2.Driver / MODE=MySQL)
                            ▼
┌────────────────────────────────────────────────────────┐
│   5. File-based H2 Database (MySQL Compatibility Mode)  │
│  - Active DB: ./data/startup_team_connect_db           │
│  - Persists data across server restarts                │
│  - Optional external MySQL via environment variables   │
│  - Tables: users, founders, startups, applications,    │
│    teams, team_members, team_messages                  │
└───────────────────────────┘
```

---

## 2. Core Workflow & Viva Demonstration Scenario

### Step-by-Step Viva Flow:
1. **Open Frontend**: Navigate to `http://localhost:5173/`.
2. **Founder Login**:
   - Click the **[ Founder ]** tab.
   - Enter `ananya@example.com` / `password123`.
   - Explain: *"The tab switch allows both roles to use a single, unified authentication interface. Upon login, the server issues a tamper-proof HMAC-SHA256 signed Bearer token."*
3. **Duplicate Startup Title Check**:
   - Click **+ Create Startup**.
   - Type `EcoTrack` in the Startup Title field.
   - Show the live indicator: `⚠️ Startup exists with this title.`
   - Explain: *"This triggers a real-time check to `GET /api/startups/check-title?title=EcoTrack` against the database to prevent duplicate startup names."*
   - Change to a new title (e.g., `SolarMesh`) -> shows `✓ Startup title is available.`
4. **User View & Skill Matching**:
   - Logout and click the **[ User ]** tab.
   - Login as `rahul@example.com` / `password123`.
   - Point out Rahul's profile skills: `Java, SQL, HTML, CSS`.
   - Look at `EcoTrack` card: Shows **100% Skill Match (4/4 skills)**.
   - Explain: *"Our rule-based skill compatibility matches the applicant's skills against the startup's required skills: `(matchedCount / requiredCount) * 100` without requiring external AI APIs."*
5. **Apply to Join**:
   - Click **View Details** on `EcoTrack`.
   - Select role: `Java Developer`.
   - Click **Apply to Join**.
   - Show: Application saved to the database. If clicked again, duplicate prevention blocks it with an alert.
6. **Founder Accepts & Team Formation**:
   - Switch to Founder Ananya.
   - Open **Applications**.
   - See Rahul's application with role `Java Developer` and status `PENDING`.
   - Click **Accept**.
   - Status changes to `ACCEPTED`.
   - Explain: *"Under the hood, `ApplicationService.acceptApplication()` runs in a database transaction (`@Transactional`). When accepted, it creates a `Team` record and adds Rahul as a `TeamMember`. Server verifies that only the startup's assigned founder can accept or reject."*
7. **Team Workspace & Live Team Chat**:
   - Both Founder and User click **My Team**.
   - Both see the active team roster:
     - Ananya Gupta (Founder & Product Lead)
     - Rahul Sharma (Java Developer)
   - Type in the Team Discussion chat: *"I completed the database design."*
   - Messages sent by Founder appear automatically on User's chat, and vice versa.
   - Fetch immediately when chat opens and polls every 2 seconds without full page refreshes.
   - Sender's messages display on the right in blue, other members' messages display on the left in light blue.
8. **Rule-based Chatbot**:
   - Click the floating chat icon in the bottom-right corner.
   - Ask: *"How do I apply?"* or *"What happens when accepted?"*
   - Explain: *"A lightweight rule-based assistant answering platform questions."*

---

## 3. Database Schema Overview (H2 in MySQL Compatibility Mode)

The active database is file-based H2 located at `./data/startup_team_connect_db` configured with `MODE=MySQL`. This provides persistence across restarts with zero external setup, and can optionally point to an external MySQL server via environment variables (`MYSQL_URL`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`).

| Table | Primary Key | Foreign Keys / Key Columns | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` (BIGINT, AUTO_INCREMENT) | `email` (UNIQUE), `skills`, `bio` | Stores student talent & skills |
| `founders` | `id` (BIGINT, AUTO_INCREMENT) | `email` (UNIQUE), `interests`, `experience` | Stores startup founders |
| `startups` | `id` (BIGINT, AUTO_INCREMENT) | `title` (UNIQUE), `founder_id`, `required_roles`, `required_skills` | Stores startup proposals |
| `applications`| `id` (BIGINT, AUTO_INCREMENT) | `user_id`, `startup_id`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`) | Tracks join applications |
| `teams` | `id` (BIGINT, AUTO_INCREMENT) | `startup_id`, `founder_id`, `status` | Stores formed teams |
| `team_members`| `id` (BIGINT, AUTO_INCREMENT) | `team_id` (FK -> `teams.id`), `user_id`, `role` | Team membership roster |
| `team_messages`| `id` (BIGINT, AUTO_INCREMENT)| `team_id`, `sender_id`, `text`, `sent_at` | Team chat and communication |

---

## 4. Key Java Code Snippets for Viva

### 1. Server-Verified Security & Token Verification (`AuthTokenService.java`):
```java
public AuthPrincipal verifyToken(String token) {
    // Constant-time signature verification using HMAC-SHA256
    if (!MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
        return null;
    }
    // Derives ID, role, and email strictly from server-signed token
    return new AuthPrincipal(id, role, email);
}
```

### 2. Automatic Team Formation (`ApplicationService.java`):
```java
@Transactional
public Application acceptApplication(Long applicationId, Long founderId) {
    Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    if (!founderId.equals(app.getFounderId())) {
        throw new SecurityException("Unauthorized: Only the founder who owns this startup may accept this application.");
    }

    app.setStatus("ACCEPTED");
    Application updatedApp = applicationRepository.save(app);

    Team team = teamRepository.findByStartupId(app.getStartupId())
            .orElseGet(() -> {
                Startup startup = startupRepository.findById(app.getStartupId()).orElse(null);
                String founderName = startup != null ? startup.getFounderName() : "Founder";
                Team newTeam = new Team(app.getStartupId(), app.getStartupTitle(), app.getFounderId(), founderName);
                return teamRepository.save(newTeam);
            });

    TeamMember member = new TeamMember(team, app.getUserId(), app.getUserName(), app.getAppliedRole(), app.getUserSkills());
    teamMemberRepository.save(member);

    return updatedApp;
}
```

### 3. Duplicate Title Detection (`StartupService.java`):
```java
public boolean isTitleTaken(String title) {
    if (title == null || title.trim().isEmpty()) {
        return false;
    }
    return startupRepository.existsByTitleIgnoreCase(title.trim());
}
```

### 4. Rule-based Skill Compatibility (`frontend/src/pages/exploreStartups.js`):
```javascript
const reqSkills = startup.requiredSkills.split(',').map(s => s.trim().toLowerCase());
const mySkills = userSkills.split(',').map(s => s.trim().toLowerCase());
const matches = reqSkills.filter(s => mySkills.includes(s));
const percent = Math.round((matches.length / reqSkills.length) * 100);
```

---

## 5. How to Run the Project Locally

### 1. Start Backend:
```bash
cd backend
mvn spring-boot:run
```
*(Runs on `http://localhost:8080` using file-based H2 in MySQL mode)*

### 2. Start Frontend:
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173` with Vite)*
