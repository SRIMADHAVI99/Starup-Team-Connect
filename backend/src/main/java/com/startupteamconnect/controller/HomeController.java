package com.startupteamconnect.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HomeController
 * Provides a clean status landing page when visiting http://localhost:8080/
 * instead of the default Spring Boot Whitelabel 404 page.
 */
@RestController
public class HomeController {

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
