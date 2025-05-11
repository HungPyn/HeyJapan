package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "grammars")
public class Grammar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grammar_id", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "structure", nullable = false)
    private String structure;

    @NotNull
    @Lob
    @Column(name = "explanation", nullable = false)
    private String explanation;

    @Lob
    @Column(name = "example")
    private String example;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "topic_id")
    private Topic topic;

}