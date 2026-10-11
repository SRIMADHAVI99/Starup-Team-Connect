# Startup Team Connect

A full-stack collaborative platform connecting startup **Founders** with skilled **Users** (students and talent) for team formation and real-time project collaboration.

## Technology Stack
- **Frontend**: Plain HTML5, CSS3, Vanilla JavaScript (ES modules) + Vite dev server
- **Backend**: Java 21 + Spring Boot 3.3.4 (Spring Web, Spring Data JPA, BCrypt security)
- **Database**: Embedded file-based H2 database in MySQL compatibility mode (`jdbc:h2:file:./data/startup_team_connect_db;MODE=MySQL;AUTO_SERVER=TRUE`). *Note: The active database is H2 file-backed persistence for zero-config execution; local MySQL connection properties are included as an optional alternative in `application.properties`.*
- **Real-Time Collaboration**: 2-second live chat polling with deduplication and directional bubble alignment

## Project Structure
```
Startup team connect/
├── frontend/                     # Vanilla HTML5, CSS3, JS Client
│   ├── src/
│   │   ├── components/           # Navbar, logo, modal, chatbot, cards
│   │   ├── pages/                # Login, dashboards, team workspace, profiles
│   │   ├── styles/               # Global tokens, component styles, dashboard CSS
│   │   ├── app.js                # SPA router, app state, and sync controller
│   │   └── main.js               # Application bootstrap entry point
│   ├── index.html                # Single-page HTML entry point
│   └── package.json
│
├── backend/                      # Java Spring Boot REST API
│   ├── src/main/java/com/startupteamconnect/
│   │   ├── controller/           # REST endpoints (/api/teams, /api/startups, etc.)
│   │   ├── service/              # Business logic & team formation
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── model/                # JPA entities (User, Founder, Startup, Team, TeamMessage)
│   │   └── StartupTeamConnectApplication.java
│   ├── src/main/resources/
│   │   └── application.properties# Database and server configuration
│   └── pom.xml
│
├── VIVA_NOTES.md                 # Complete viva guide, architecture diagrams, and scripts
└── README.md
```

## Running the Application

### 1. Database (Active: File-Based H2)
The application runs with file-based H2 database storage enabled in `backend/src/main/resources/application.properties` (`./data/startup_team_connect_db.mv.db`). It requires no standalone database server setup.
- Web Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/startup_team_connect_db`
- Username: `sa` | Password: *(blank)*

*(Optional: To switch to an external MySQL server, uncomment the MySQL dataSource properties in `backend/src/main/resources/application.properties` and comment out the H2 configuration).*

### 2. Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Runs at `http://localhost:8080`.

### 3. Frontend (Vanilla JS)
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

## Seed Accounts for Testing
- **Founder**: `ananya@example.com` / `password123`
- **User (Talent)**: `rahul@example.com` / `password123`

## Key Features
- **Role-based Authentication**: Secure login & registration for Founders and Users with BCrypt password hashing.
- **Startup Management**: Creation, duplicate title validation, category browsing, and rule-based skill matching.
- **Application Workflow**: Talent application submission, founder review, and accept/reject decision pipeline.
  - *Security*: Only the founder who owns the startup is authorized to accept or reject its applications.
- **Team Formation & Workspace**: Automatic team creation upon acceptance with roster tracking.
- **Live Team Chat**:
  - Auto-fetches immediately upon opening and polls every 2 seconds without page refresh.
  - Directional message alignment: Own messages on the right (blue), other members on the left (light blue), evaluated strictly by sender IDs.
  - Deduplicated messages and route persistence across page reloads.
  - Inflight request locking to prevent overlapping network calls.
  - Preserves chat history on network/fetch errors.
  - Protected endpoints: Validates sender authorization and checks team membership before returning private messages.
