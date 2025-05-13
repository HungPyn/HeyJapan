package com.quafresh.web.heyjapan.dto;

public class UpdateLevelRequest {
    private String id;
    private Integer levelId;

    // Getters và Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Integer getLevelId() {
        return levelId;
    }
    public void setLevelId(Integer levelId) {
        this.levelId = levelId;
    }
}
