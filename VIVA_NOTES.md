# STARTUP TEAM CONNECT - VIVA & PROJECT PRESENTATION GUIDE

> **Semester Project:** 3rd Year CSE  
> **Topic:** Startup Team Connect (A Collaborative Platform Connecting Founders with Skilled Talent)  
> **Tech Stack:** React (Vite + JavaScript) + Java Spring Boot (v3.3.4) + MySQL 8.0  

---

## 1. High-Level Architecture Explanation

During your viva, draw or explain the 5-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│               1. React Frontend (Vite)                 │
│  - JavaScript + Vanilla CSS (No TypeScript / Tailwind) │
│  - Role Switcher ([User] & [Founder])                  │
│  - Rule-based Skill Matcher (% compatibility)          │
│  - Live Duplicate Title Check                          │
│  - Interactive Rule-based Chatbot                      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST API (JSON) / CORS Port 5173 -> 8080
                            ▼
┌────────────────────────────────────────────────────────┐
│            2. Spring Boot Controller Layer             │
│  - AuthController, StartupController,                  │
│    ApplicationController, TeamController, etc.         │
│  - Receives HTTP requests, maps JSON to Java objects   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                3. Business Service Layer               │
│  - AuthService, StartupService,                        │
│    ApplicationService, TeamService                     │
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
                            │ JDBC Driver (com.mysql.cj.jdbc.Driver)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   5. MySQL Database                    │
│  - Database: startup_team_connect_db                   │
│  - Tables: users, founders, startups, applications,    │
│    teams, team_members, team_messages                  │
└───────────────────────────┘
```

---

## 2. Core Workflow & viva Demonstration Scenario

### Step-by-Step Viva Flow:
1. **Open Frontend**: Navigate to `http://localhost:5173/`.
2. **Founder Login**:
   - Click the **[ Founder ]** tab.
   - Enter `ananya@example.com` / `password123`.
   - Explain: *"The tab switch allows both roles to use a single, unified authentication interface without clutter."*
3. **Duplicate Startup Title Check**:
   - Click **+ Create Startup**.
   - Type `EcoTrack` in the Startup Title field.
   - Show the live indicator: `⚠️ Startup exists with this title.`
   - Explain: *"This triggers a real-time check to `GET /api/startups/check-title?title=EcoTrack` against MySQL to prevent duplicate startup names."*
   - Change to a new title (e.g., `SolarMesh`) -> shows `✓ Startup title is available.`
4. **User View & Skill Matching**:
   - Logout and click the **[ User ]** tab.
   - Login as `rahul@example.com` / `password123`.
   - Point out Rahul's profile skills: `Java, SQL, HTML, CSS, React`.
   - Look at `EcoTrack` card: Shows **100% Skill Match (4/4 skills)**.
   - Explain: *"Our rule-based skill compatibility matches the applicant's skills against the startup's required skills: `(matchedCount / requiredCount) * 100` without requiring external AI APIs."*
5. **Apply to Join**:
   - Click **View Details** on `EcoTrack`.
   - Select role: `Java Developer`.
   - Click **Apply to Join**.
   - Show: Application saved to MySQL. If clicked again, duplicate prevention blocks it with an alert.
6. **Founder Accepts & Team Formation**:
   - Switch to Founder Ananya.
   - Open **Applications**.
   - See Rahul's application with role `Java Developer` and status `PENDING`.
   - Click **Accept**.
   - Status changes to `ACCEPTED`.
   - Explain: *"Under the hood, `ApplicationService.acceptApplication()` runs in a database transaction (`@Transactional`). When accepted, it creates a `Team` record and adds Rahul as a `TeamMember`."*
7. **Team Workspace & Team Chat**:
   - Both Founder and User click **My Team**.
   - Both see the active team roster:
     - Ananya Gupta (Founder & Product Lead)
     - Rahul Sharma (Java Developer)
   - Type in the Team Discussion chat: *"I completed the database design."*
   - Explain: *"This stores messages in the `team_messages` MySQL table so team members can coordinate asynchronously."*
8. **Rule-based Chatbot**:
   - Click the floating chat icon in the bottom-right corner.
   - Ask: *"How do I apply?"* or *"What happens when accepted?"*
   - Explain: *"A lightweight rule-based assistant answering platform questions."*

---

## 3. Database Schema Overview (MySQL)

| Table | Primary Key | Foreign Keys / Key Columns | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` (BIGINT, AUTO_INCREMENT) | `email` (UNIQUE), `skills`, `bio` | Stores student talent & skills |
| `founders` | `id` (BIGINT, AUTO_INCREMENT) | `email` (UNIQUE), `interests`, `experience` | Stores startup founders |
| `startups` | `id` (BIGINT, AUTO_INCREMENT) | `title` (UNIQUE), `founder_id`, `required_roles`, `required_skills` | Stores startup proposals |
| `applications`| `id` (BIGINT, AUTO_INCREMENT) | `user_id`, `startup_id`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`) | Tracks join applications |
| `teams` | `id` (BIGINT, AUTO_INCREMENT) | `startup_id`, `founder_id`, `status` | Stores formed teams |
| `team_members`| `id` (BIGINT, AUTO_INCREMENT) | `team_id` (FK -> `teams.id`), `user_id`, `role` | Team membership roster |
| `team_messages`| `id` (BIGINT, AUTO_INCREMENT)| `team_id`, `sender_id`, `text` | Team chat and communication |

---

## 4. Key Java Code Snippets for Viva

### 1. Automatic Team Formation (`ApplicationService.java`):
```java
@Transactional
public Application acceptApplication(Long applicationId) {
    Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

    app.setStatus("ACCEPTED");
    Application updatedApp = applicationRepository.save(app);

    // Automatically find or create the Team
    Team team = teamRepository.findByStartupId(app.getStartupId())
            .orElseGet(() -> {
                Startup startup = startupRepository.findById(app.getStartupId()).orElse(null);
                String founderName = startup != null ? startup.getFounderName() : "Founder";
                Team newTeam = new Team(app.getStartupId(), app.getStartupTitle(), app.getFounderId(), founderName);
                return teamRepository.save(newTeam);
            });

    // Add applicant as a TeamMember
    TeamMember member = new TeamMember(team, app.getUserId(), app.getUserName(), app.getAppliedRole(), app.getUserSkills());
    teamMemberRepository.save(member);

    return updatedApp;
}
```

### 2. Duplicate Title Detection (`StartupService.java`):
```java
public boolean isTitleTaken(String title) {
    if (title == null || title.trim().isEmpty()) {
        return false;
    }
    return startupRepository.existsByTitleIgnoreCase(title.trim());
}
```

### 3. Rule-based Skill Compatibility (`StartupCard.jsx`):
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
*(Runs on `http://localhost:8080`)*

### 2. Start Frontend:
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*
