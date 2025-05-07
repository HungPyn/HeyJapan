// src/mocks/courseData.ts
import {Course, Lesson} from '../types';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Tiếng Nhật cơ bản cho người mới bắt đầu',
    description:
      'Làm quen với bảng chữ cái Hiragana, Katakana và các câu chào hỏi cơ bản',
    imageUrl: 'https://example.com/basic_course.jpg', // Sẽ thay thế bằng local image
    level: 'beginner',
    lessonsCount: 15,
    duration: '4 tuần',
    progress: 0,
  },
  {
    id: '2',
    title: 'Ngữ pháp N5 - Nền tảng tiếng Nhật',
    description: 'Học các cấu trúc ngữ pháp cơ bản trong kỳ thi JLPT N5',
    imageUrl: 'https://example.com/n5_grammar.jpg',
    level: 'beginner',
    lessonsCount: 20,
    duration: '6 tuần',
    progress: 30,
  },
  {
    id: '3',
    title: 'Từ vựng chủ đề đời sống hàng ngày',
    description: 'Các từ vựng thông dụng về nhà cửa, ăn uống, giao thông...',
    imageUrl: 'https://example.com/daily_vocab.jpg',
    level: 'beginner',
    lessonsCount: 12,
    duration: '3 tuần',
    progress: 75,
  },
  {
    id: '4',
    title: 'Luyện nghe tiếng Nhật giao tiếp',
    description:
      'Nâng cao kỹ năng nghe hiểu với các tình huống giao tiếp thực tế',
    imageUrl: 'https://example.com/listening.jpg',
    level: 'intermediate',
    lessonsCount: 18,
    duration: '5 tuần',
    progress: 15,
  },
  {
    id: '5',
    title: 'Kanji N4 - 150 chữ Hán thông dụng',
    description: 'Học và ghi nhớ 150 chữ Kanji trong kỳ thi JLPT N4',
    imageUrl: 'https://example.com/n4_kanji.jpg',
    level: 'intermediate',
    lessonsCount: 24,
    duration: '8 tuần',
    progress: 0,
  },
];

export const mockLessons: Record<string, Lesson[]> = {
  '1': [
    {
      id: 'L1-1',
      courseId: '1',
      title: 'Bảng chữ cái Hiragana - Phần 1',
      description: 'Học cách đọc và viết các chữ cái Hiragana cơ bản (あ～こ)',
      type: 'writing',
      duration: '20 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L1-2',
      courseId: '1',
      title: 'Bảng chữ cái Hiragana - Phần 2',
      description:
        'Học cách đọc và viết các chữ cái Hiragana tiếp theo (さ～と)',
      type: 'writing',
      duration: '20 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L1-3',
      courseId: '1',
      title: 'Bảng chữ cái Hiragana - Phần 3',
      description:
        'Học cách đọc và viết các chữ cái Hiragana tiếp theo (な～ほ)',
      type: 'writing',
      duration: '20 phút',
      status: 'in_progress',
      progress: 65,
    },
    {
      id: 'L1-4',
      courseId: '1',
      title: 'Bảng chữ cái Hiragana - Phần 4',
      description:
        'Học cách đọc và viết các chữ cái Hiragana cuối cùng (ま～ん)',
      type: 'writing',
      duration: '20 phút',
      status: 'not_started',
      progress: 0,
    },
    {
      id: 'L1-5',
      courseId: '1',
      title: 'Lời chào và giới thiệu bản thân',
      description: 'Học cách chào hỏi và giới thiệu bản thân bằng tiếng Nhật',
      type: 'vocabulary',
      duration: '30 phút',
      status: 'not_started',
      progress: 0,
    },
  ],
  '2': [
    {
      id: 'L2-1',
      courseId: '2',
      title: 'Cấu trúc câu cơ bản',
      description: 'Cấu trúc câu tiếng Nhật và thứ tự từ trong câu',
      type: 'grammar',
      duration: '25 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L2-2',
      courseId: '2',
      title: 'Đại từ nhân xưng',
      description: 'Các đại từ nhân xưng và cách sử dụng',
      type: 'grammar',
      duration: '25 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L2-3',
      courseId: '2',
      title: 'Từ chỉ định: この, その, あの, どの',
      description: 'Cách sử dụng các từ chỉ định trong tiếng Nhật',
      type: 'grammar',
      duration: '30 phút',
      status: 'not_started',
      progress: 0,
    },
  ],
};
