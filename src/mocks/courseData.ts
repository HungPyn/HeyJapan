// src/mocks/courseData.ts
import {Course, Lesson} from '../types';

export const mockCourses: Course[] = [
  {
    topic_code: '1',
    title: 'Cơ bản 1',
    imageUrl: 'https://i.imgur.com/na3U2uk.png', // Sẽ thay thế bằng local image
    levelCode: 'Cơ bản', // Cấp độ (Beginner)
    quantityLesson: 10, // Số lượng bài học (ví dụ)
  },
  {
    topic_code: '2',
    title: 'Cơ bản 2',
    imageUrl: 'https://i.imgur.com/na3U2uk.png',
    levelCode: 'Cơ bản',
    quantityLesson: 8,
  },
  {
    topic_code: '3',
    title: 'Ngữ pháp',
    imageUrl: 'https://i.imgur.com/R8WeIEv.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '4',
    title: 'Trường học',
    imageUrl: 'https://i.imgur.com/BI2iGmn.jpeg',
    levelCode: 'Sơ cấp', // Cấp độ (Intermediate)
    quantityLesson: 15,
  },
  {
    topic_code: '5',
    title: 'Cây cối',
    imageUrl: 'https://i.imgur.com/4NYSRPT.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 20,
  },
  {
    topic_code: '6',
    title: 'Công việc',
    imageUrl: 'https://i.imgur.com/Q7zBfOg.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '7',
    title: 'Món ăn',
    imageUrl: 'https://i.imgur.com/loLlsoi.png',
    levelCode: 'Trung cấp', // Cấp độ (Intermediate)
    quantityLesson: 15,
  },
  {
    topic_code: '8',
    title: 'Động vật',
    imageUrl: 'https://i.imgur.com/CJQ8ooS.jpeg',
    levelCode: 'Trung cấp',
    quantityLesson: 20,
  },
];

export const mockLessons: Record<string, Lesson[]> = {
  '1': [
    {
      id: 'L1-1',
      topic_code: '1',
      title: 'Bảng chữ cái Hiragana - Phần 1',
      description: 'Học cách đọc và viết các chữ cái Hiragana cơ bản (あ～こ)',
      type: 'writing',
      duration: '20 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L1-2',
      topic_code: '1',
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
      topic_code: '1',
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
      topic_code: '1',
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
      topic_code: '1',
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
      topic_code: '2',
      title: 'Cấu trúc câu cơ bản',
      description: 'Cấu trúc câu tiếng Nhật và thứ tự từ trong câu',
      type: 'grammar',
      duration: '25 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L2-2',
      topic_code: '2',
      title: 'Đại từ nhân xưng',
      description: 'Các đại từ nhân xưng và cách sử dụng',
      type: 'grammar',
      duration: '25 phút',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'L2-3',
      topic_code: '2',
      title: 'Từ chỉ định: この, その, あの, どの',
      description: 'Cách sử dụng các từ chỉ định trong tiếng Nhật',
      type: 'grammar',
      duration: '30 phút',
      status: 'not_started',
      progress: 0,
    },
  ],
};
