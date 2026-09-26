package com.startupteamconnect;

import com.startupteamconnect.model.Founder;
import com.startupteamconnect.model.Startup;
import com.startupteamconnect.model.User;
import com.startupteamconnect.repository.FounderRepository;
import com.startupteamconnect.repository.StartupRepository;
import com.startupteamconnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class StartupTeamConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(StartupTeamConnectApplication.class, args);
    }

    /**
     * Global CORS configuration to ensure smooth communication
     * between React frontend (http://localhost:5173) and Spring Boot backend.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
