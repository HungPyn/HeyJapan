// src/mocks/lessonContent.ts
import {
  ListeningExercise,
  ReadingExercise,
  WritingExercise,
  Question,
} from '../types';

export const mockListeningExercise: ListeningExercise = {
  id: 'listen1',
  audioUrl: 'dummy_audio_url.mp3',
  transcript:
    'こんにちは。私はタンと申します。ベトナム人です。日本語を勉強しています。どうぞよろしくお願いします。',
  translation:
    'Xin chào. Tôi tên là Tân. Tôi là người Việt Nam. Tôi đang học tiếng Nhật. Rất vui được gặp bạn.',
  questions: [
    {
      id: 'q1',
      text: 'Người nói tên là gì?',
      type: 'multiple_choice',
      options: ['Tân', 'Tuấn', 'Thành', 'Tùng'],
      correctAnswer: 'Tân',
    },
    {
      id: 'q2',
      text: 'Người nói đang học gì?',
      type: 'multiple_choice',
      options: ['Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Trung'],
      correctAnswer: 'Tiếng Nhật',
    },
  ],
};

export const mockReadingExercise: ReadingExercise = {
  id: 'read1',
  text: '私の家族は4人です。父と母と妹と私です。父は会社員です。母は先生です。妹は学生です。私も学生です。',
  translation:
    'Gia đình tôi có 4 người. Đó là bố, mẹ, em gái và tôi. Bố tôi là nhân viên công ty. Mẹ tôi là giáo viên. Em gái tôi là học sinh. Tôi cũng là học sinh.',
  questions: [
    {
      id: 'q1',
      text: 'Gia đình người viết có bao nhiêu người?',
      type: 'multiple_choice',
      options: ['3 người', '4 người', '5 người', '6 người'],
      correctAnswer: '4 người',
    },
    {
      id: 'q2',
      text: 'Nghề nghiệp của mẹ người viết là gì?',
      type: 'multiple_choice',
      options: ['Nhân viên công ty', 'Bác sĩ', 'Giáo viên', 'Nội trợ'],
      correctAnswer: 'Giáo viên',
    },
  ],
};

export const mockWritingExercise: WritingExercise = {
  id: 'write1',
  instruction: 'Hãy dịch câu sau sang tiếng Nhật',
  prompt: 'Tôi thích ăn sushi và uống trà xanh',
  expectedAnswer: '私は寿司を食べることと緑茶を飲むことが好きです。',
};
