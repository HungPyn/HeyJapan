package com.quafresh.web.heyjapan.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contents")
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_code", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "content_type")
    private String contentType;

    @Size(max = 255)
    @Column(name = "title")
    private String title;

    @Lob
    @Column(name = "content_detail")
    private String contentDetail;

    @Size(max = 255)
    @Column(name = "audio_url")
    private String audioUrl;

    @Size(max = 255)
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_code")
    private com.quafresh.web.heyjapan.entity.Lesson lessonCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_code")
    private com.quafresh.web.heyjapan.entity.Skill skillCode;

}