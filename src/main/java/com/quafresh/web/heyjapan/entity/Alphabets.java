package com.quafresh.web.heyjapan.entity;

import com.quafresh.web.heyjapan.entity.enums.AlphabetType;
import com.quafresh.web.heyjapan.entity.enums.QuestionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "alphabets")
public class Alphabets {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alphabet_id",nullable = false)
    private Long id;

    @Column(name = "url_audio",nullable = false)
    private String urlAudio;


    @Enumerated(EnumType.STRING)
    @Column(name = "type",nullable = false)
    private AlphabetType alphabetType;

    @Column(name = "pronunciations",nullable = false)
    private String Pronunciations;

    @Column(name = "alphabet_character",nullable = false)
    private String AlphabetCharacter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

}
