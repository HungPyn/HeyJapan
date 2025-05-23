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
@Table(name = "vocabularies")
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vocabulary_id", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "word", nullable = false)
    private String word;

    @Size(max = 255)
    @NotNull
    @Column(name = "meaning", nullable = false)
    private String meaning;

    @Size(max = 255)
    @Column(name = "pronunciation")
    private String pronunciation;

    @NotNull
    @Column(name = "url_audio", nullable = false)
    private String urlAudio;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "topic_id")
    private Topic topic;

}