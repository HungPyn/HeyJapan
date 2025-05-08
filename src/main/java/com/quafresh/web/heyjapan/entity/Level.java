package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "levels")
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_code", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "level_name", nullable = false, length = 20)
    private String levelName;

    @Column(name = "quantity_topic")
    private Integer quantityTopic;

    @Column(name = "day_creation")
    private LocalDateTime dayCreation;

    @PrePersist
    protected void onCreate() {
        dayCreation = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "levelCode")
    private Set<com.quafresh.web.heyjapan.entity.Topic> topics = new LinkedHashSet<>();

}