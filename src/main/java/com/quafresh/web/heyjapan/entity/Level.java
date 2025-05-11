package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "levels")
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_id", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "level_name", nullable = false, length = 20)
    private String name;

    @OneToMany(mappedBy = "level")
    private Set<com.quafresh.web.heyjapan.entity.Topic> topics = new LinkedHashSet<>();

    @OneToMany(mappedBy = "level")
    private Set<com.quafresh.web.heyjapan.entity.User> users = new LinkedHashSet<>();

}