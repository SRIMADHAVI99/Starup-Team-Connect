package com.startupteamconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * SavedStartup Entity
 * Stores user bookmarks for startups they are interested in.
 */
@Entity
@Table(name = "saved_startups")
public class SavedStartup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long startupId;

    private LocalDateTime savedAt = LocalDateTime.now();

    public SavedStartup() {
    }

    public SavedStartup(Long userId, Long startupId) {
        this.userId = userId;
        this.startupId = startupId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getStartupId() {
        return startupId;
    }

    public void setStartupId(Long startupId) {
        this.startupId = startupId;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
