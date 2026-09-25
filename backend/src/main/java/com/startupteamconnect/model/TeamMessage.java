package com.startupteamconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * TeamMessage Entity
 * Stores team chat and announcement messages.
 */
@Entity
@Table(name = "team_messages")
public class TeamMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long teamId;

    private Long senderId;

    private String senderName;

    private String senderRole; // "user" or "founder"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    private LocalDateTime sentAt = LocalDateTime.now();

    public TeamMessage() {
    }

    public TeamMessage(Long teamId, Long senderId, String senderName, String senderRole, String text) {
        this.teamId = teamId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.text = text;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}
