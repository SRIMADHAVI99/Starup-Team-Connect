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

    /**
     * Seed initial demo data (Founder Ananya, User Rahul, and startup EcoTrack)
     * so the viva demonstration is immediately ready and populated.
     */
    @Bean
    public CommandLineRunner seedData(UserRepository userRepository,
                                     FounderRepository founderRepository,
                                     StartupRepository startupRepository) {
        return args -> {
            // Seed Founder Ananya if not present
            Founder founder = founderRepository.findByEmail("ananya@example.com").orElseGet(() -> {
                Founder f = new Founder(
                        "Ananya Gupta",
                        "ananya@example.com",
                        "password123",
                        "CleanTech, Sustainability, IoT",
                        "Tech Entrepreneur & Product Lead"
                );
                f.setBio("Passionate about solving environmental challenges through collaborative technology solutions.");
                return founderRepository.save(f);
            });

            // Seed User Rahul if not present
            userRepository.findByEmail("rahul@example.com").orElseGet(() -> {
                User u = new User(
                        "Rahul Sharma",
                        "rahul@example.com",
                        "password123",
                        "Java, SQL, HTML, CSS, React",
                        "Beginner",
                        "B.Tech CSE, 3rd Year"
                );
                u.setBio("3rd-year CSE student interested in startup projects and backend engineering.");
                return userRepository.save(u);
            });

            // Seed Startup EcoTrack if not present
            if (!startupRepository.existsByTitleIgnoreCase("EcoTrack")) {
                Startup ecoTrack = new Startup();
                ecoTrack.setTitle("EcoTrack");
                ecoTrack.setCategory("CleanTech");
                ecoTrack.setShortDescription("A smart waste management and recycling platform connecting communities with collection hubs.");
                ecoTrack.setProblemStatement("Urban communities lack systematic tracking and incentives for segregated recyclable waste collection.");
                ecoTrack.setSolution("A smart dashboard and mobile route coordinator that rewards verified recycling and alerts local collection hubs.");
                ecoTrack.setRequiredRoles("Java Developer, UI Designer, IoT Specialist");
                ecoTrack.setRequiredSkills("Java, SQL, HTML, CSS");
                ecoTrack.setTeamSize("3-4 members");
                ecoTrack.setFounderId(founder.getId());
                ecoTrack.setFounderName(founder.getName());
                startupRepository.save(ecoTrack);
            }
        };
    }
}
