package com.startupteamconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Team Entity
 * Represents formed teams created when a founder accepts an applicant.
 */
@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long startupId;

    @Column(nullable = false)
    private String startupTitle;

    private Long founderId;

    private String founderName;

    private String status = "Active";

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TeamMember> members = new ArrayList<>();

    public Team() {
    }

    public Team(Long startupId, String startupTitle, Long founderId, String founderName) {
        this.startupId = startupId;
        this.startupTitle = startupTitle;
        this.founderId = founderId;
        this.founderName = founderName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStartupId() {
        return startupId;
    }

    public void setStartupId(Long startupId) {
        this.startupId = startupId;
    }

    public String getStartupTitle() {
        return startupTitle;
    }

    public void setStartupTitle(String startupTitle) {
        this.startupTitle = startupTitle;
    }

    public Long getFounderId() {
        return founderId;
    }

    public void setFounderId(Long founderId) {
        this.founderId = founderId;
    }

    public String getFounderName() {
        return founderName;
    }

    public void setFounderName(String founderName) {
        this.founderName = founderName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<TeamMember> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMember> members) {
        this.members = members;
    }

    public void addMember(TeamMember member) {
        members.add(member);
        member.setTeam(this);
    }
}
