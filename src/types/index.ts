// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Course {
  topic_code: string; // Mã chủ đề (từ bảng topics)
  title: string; // Tên khóa học
  imageUrl: string; // Đường dẫn đến hình ảnh
  levelCode: string; // Mã cấp độ (từ bảng levels)
  quantityLesson: number; // Số lượng bài học
}

export interface Lesson {
  id: string;
  topic_code: string;
  title: string;
  description: string;
  type: 'reading' | 'listening' | 'writing' | 'vocabulary' | 'grammar' | 'test';
  duration: string; // Ví dụ: "15 phút"
  status: 'not_started' | 'in_progress' | 'completed';
  progress?: number; // 0-100
}

export interface ListeningExercise {
  id: string;
  audioUrl: string;
  transcript: string;
  translation: string;
  questions: Question[];
}

export interface ReadingExercise {
  id: string;
  text: string;
  translation: string;
  questions: Question[];
}

export interface WritingExercise {
  id: string;
  instruction: string;
  prompt: string;
  expectedAnswer?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
}

export interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}
