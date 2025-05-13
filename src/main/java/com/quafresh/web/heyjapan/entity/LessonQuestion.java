package com.quafresh.web.heyjapan.entity;

import com.quafresh.web.heyjapan.entity.enums.QuestionType;
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
@Table(name = "lesson_questions")
public class LessonQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private com.quafresh.web.heyjapan.entity.Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @NotNull
    @Lob
    @Column(name = "prompt_text_template", nullable = false)
    private String promptTextTemplate;

    @NotNull
    @Lob
    @Column(name = "target_word_native", nullable = false)
    private String targetWordNative;

    @Size(max = 10)
    @NotNull
    @Column(name = "target_language_code", nullable = false, length = 10)
    private String targetLanguageCode;

    @Size(max = 10)
    @NotNull
    @Column(name = "options_language_code", nullable = false, length = 10)
    private String optionsLanguageCode;

    @OneToMany(mappedBy = "lessonQuestion")
    private Set<com.quafresh.web.heyjapan.entity.QuestionChoice> questionChoices = new LinkedHashSet<>();

}