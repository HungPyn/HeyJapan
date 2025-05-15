package com.quafresh.web.heyjapan.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/lesson-question")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonQuestionController {
}
