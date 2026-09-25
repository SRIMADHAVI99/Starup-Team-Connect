# Startup Team Connect

A full-stack semester project prototype connecting startup **Founders** with skilled **Users** (students and talent) for collaborative team formation.

## Technology Stack
- **Frontend**: React (JavaScript) + Vite + Vanilla CSS
- **Backend**: Java 21 + Spring Boot 3.3.4 (Spring Web, Spring Data JPA)
- **Database**: MySQL 8.0 (`startup_team_connect_db`)

## Project Structure
```
Startup team connect/
├── frontend/                     # React + Vite client
│   ├── src/
│   │   ├── components/           # Navbar, LoginTabs, StartupCard, Chatbot, etc.
│   │   ├── pages/                # Dashboards, CreateStartup, TeamDashboard, etc.
│   │   ├── styles/               # Global tokens, component styles, dashboard CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/                      # Java Spring Boot application
│   ├── src/main/java/com/startupteamconnect/
│   │   ├── controller/           # REST endpoints
│   │   ├── service/              # Business logic & team formation
│   │   ├── repository/           # Spring Data JPA repositories
│   │   ├── model/                # JPA entities (User, Founder, Startup, Team, etc.)
│   │   └── StartupTeamConnectApplication.java
│   ├── src/main/resources/
│   │   └── application.properties# MySQL database configuration
│   └── pom.xml
│
├── VIVA_NOTES.md                 # Complete viva guide, architecture diagrams, and scripts
└── README.md
```

## Running the Application

### 1. Database
Make sure MySQL service is running. Database `startup_team_connect_db` is configured in `backend/src/main/resources/application.properties`.

### 2. Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Runs at `http://localhost:8080`.

### 3. Frontend (React)
```bash
cd frontend
npm run dev
```
Runs at `http://localhost:5173`.

## Seed Accounts for Testing
- **Founder**: `ananya@example.com` / `password123`
- **User (Talent)**: `rahul@example.com` / `password123`
