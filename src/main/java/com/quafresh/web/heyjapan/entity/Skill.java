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
@Table(name = "skills")
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_code", nullable = false)
    private Integer id;

    @Size(max = 20)
    @NotNull
    @Column(name = "skill_name", nullable = false, length = 20)
    private String skillName;

    @OneToMany(mappedBy = "skillCode")
    private Set<Content> contents = new LinkedHashSet<>();

    @OneToMany(mappedBy = "skillCode")
    private Set<Question> questions = new LinkedHashSet<>();

}