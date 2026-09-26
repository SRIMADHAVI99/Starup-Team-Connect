package com.startupteamconnect.controller;

import com.startupteamconnect.repository.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * HomeController
 * Provides status landing page and admin data reset endpoint.
 */
@RestController
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class HomeController {

    private final UserRepository userRepository;
    private final FounderRepository founderRepository;
    private final StartupRepository startupRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedStartupRepository savedStartupRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMessageRepository teamMessageRepository;

    public HomeController(UserRepository userRepository,
                          FounderRepository founderRepository,
                          StartupRepository startupRepository,
                          ApplicationRepository applicationRepository,
                          SavedStartupRepository savedStartupRepository,
                          TeamRepository teamRepository,
                          TeamMemberRepository teamMemberRepository,
                          TeamMessageRepository teamMessageRepository) {
        this.userRepository = userRepository;
        this.founderRepository = founderRepository;
        this.startupRepository = startupRepository;
        this.applicationRepository = applicationRepository;
        this.savedStartupRepository = savedStartupRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.teamMessageRepository = teamMessageRepository;
    }

    @RequestMapping(value = "/api/clear-all-data", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE})
    public ResponseEntity<?> clearAllData() {
        try {
            teamMessageRepository.deleteAll();
            teamMemberRepository.deleteAll();
            teamRepository.deleteAll();
            applicationRepository.deleteAll();
            savedStartupRepository.deleteAll();
            startupRepository.deleteAll();
            userRepository.deleteAll();
            founderRepository.deleteAll();

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "All test data (users, founders, startups, applications, teams, messages) cleared successfully."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Startup Team Connect | Backend API Server</title>
                <style>
                    body {
                        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                        background: #F4F6FB;
                        color: #202642;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .card {
                        background: #FFFFFF;
                        border: 1px solid #E2E6EE;
                        border-radius: 14px;
                        box-shadow: 0 10px 25px rgba(32, 38, 66, 0.08);
                        max-width: 620px;
                        width: 100%;
                        padding: 36px;
                    }
                    .badge {
                        display: inline-block;
                        background: #DEF7EC;
                        color: #03543F;
                        padding: 4px 12px;
                        border-radius: 9999px;
                        font-size: 0.82rem;
                        font-weight: 700;
                        margin-bottom: 12px;
                    }
                    h1 {
                        margin: 0 0 8px 0;
                        font-size: 1.6rem;
                        color: #202642;
                    }
                    p {
                        color: #70758A;
                        line-height: 1.6;
                        margin: 0 0 20px 0;
                    }
                    .btn {
                        display: inline-block;
                        background: #202642;
                        color: #FFFFFF;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 0.95rem;
                        transition: background 0.2s;
                    }
                    .btn:hover {
                        background: #555A91;
                    }
                    .endpoints {
                        margin-top: 28px;
                        border-top: 1px solid #E2E6EE;
                        padding-top: 20px;
                    }
                    .endpoints h3 {
                        margin: 0 0 12px 0;
                        font-size: 1rem;
                        color: #202642;
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    li {
                        padding: 8px 12px;
                        background: #F7F7F5;
                        border-radius: 6px;
                        margin-bottom: 6px;
                        font-family: monospace;
                        font-size: 0.88rem;
                    }
                    li a {
                        color: #555A91;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    li a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">● Spring Boot API Active</span>
                    <h1>Startup Team Connect &bull; Backend</h1>
                    <p>
                        This is your <strong>Java Spring Boot REST API server</strong> running on port <strong>8080</strong> connected to <strong>MySQL (startup_team_connect_db)</strong>.
                    </p>
                    <p>
                        To view your interactive website UI (Login, Dashboards, Startups, Chatbot), visit the frontend port:
                    </p>
                    <a href="http://localhost:5173" class="btn">Open Frontend Web App (localhost:5173) &rarr;</a>

                    <div class="endpoints">
                        <h3>Sample REST API Endpoints:</h3>
                        <ul>
                            <li><a href="/api/startups" target="_blank">GET /api/startups</a> &mdash; All startups list (JSON)</li>
                            <li><a href="/api/startups/check-title?title=EcoTrack" target="_blank">GET /api/startups/check-title?title=EcoTrack</a> &mdash; Title check</li>
                            <li><a href="/api/teams/founder/1" target="_blank">GET /api/teams/founder/1</a> &mdash; Founder team data</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
