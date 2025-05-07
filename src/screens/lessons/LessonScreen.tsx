// src/screens/lessons/LessonScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import Header from '../../components/common/Header';
import CustomButton from '../../components/common/CustomButton';
import {mockCourses, mockLessons} from '../../mocks/courseData';
import {
  mockListeningExercise,
  mockReadingExercise,
  mockWritingExercise,
} from '../../mocks/lessonContent';
import ListeningExerciseUI from './components/ListeningExerciseUI';
import ReadingExerciseUI from './components/ReadingExerciseUI';
import WritingExerciseUI from './components/WritingExerciseUI';

type LessonScreenRouteProp = RouteProp<CoursesStackParamList, 'Lesson'>;
type LessonScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'Lesson'
>;

const LessonScreen: React.FC = () => {
  const route = useRoute<LessonScreenRouteProp>();
  const navigation = useNavigation<LessonScreenNavigationProp>();
  const {lessonId, courseId} = route.params;

  // Lấy thông tin khóa học và bài học từ mock data
  const course = mockCourses.find(c => c.id === courseId);
  const lessons = mockLessons[courseId] || [];
  const lesson = lessons.find(l => l.id === lessonId);

  const [isCompleted, setIsCompleted] = useState(false);

  if (!lesson || !course) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin bài học</Text>
        <CustomButton
          title="Quay lại"
          onPress={() => navigation.goBack()}
          type="primary"
          style={{marginTop: 20}}
        />
      </SafeAreaView>
    );
  }

  const renderLessonContent = () => {
    // Dựa vào loại bài học, hiển thị giao diện tương ứng
    switch (lesson.type) {
      case 'listening':
        return <ListeningExerciseUI exercise={mockListeningExercise} />;
      case 'reading':
        return <ReadingExerciseUI exercise={mockReadingExercise} />;
      case 'writing':
        return <WritingExerciseUI exercise={mockWritingExercise} />;
      case 'vocabulary':
        // Hiển thị học từ vựng (đơn giản trong phạm vi demo)
        return (
          <View style={styles.vocabularyContainer}>
            <Text style={styles.contentTitle}>Học từ vựng</Text>
            {[1, 2, 3, 4, 5].map(item => (
              <View key={item} style={styles.vocabularyItem}>
                <Text style={styles.japaneseText}>日本語の単語 {item}</Text>
                <Text style={styles.vietnameseText}>
                  Từ vựng tiếng Nhật {item}
                </Text>
              </View>
            ))}
          </View>
        );
      case 'grammar':
        // Hiển thị ngữ pháp (đơn giản trong phạm vi demo)
        return (
          <View style={styles.grammarContainer}>
            <Text style={styles.contentTitle}>Học ngữ pháp</Text>
            <View style={styles.grammarPoint}>
              <Text style={styles.grammarTitle}>は - Trợ từ chỉ chủ ngữ</Text>
              <Text style={styles.grammarExplanation}>
                Trợ từ は được dùng để chỉ chủ ngữ trong câu, giúp nhấn mạnh
                thông tin mới về chủ ngữ.
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Ví dụ:</Text>
                <Text style={styles.japaneseText}>私は学生です。</Text>
                <Text style={styles.vietnameseText}>Tôi là học sinh.</Text>
              </View>
            </View>
          </View>
        );
      case 'test':
        // Hiển thị bài kiểm tra (đơn giản trong phạm vi demo)
        return (
          <View style={styles.testContainer}>
            <Text style={styles.contentTitle}>Bài kiểm tra</Text>
            <Text style={styles.testDescription}>
              Bài kiểm tra này sẽ đánh giá mức độ hiểu biết của bạn về nội dung
              đã học.
            </Text>
            <View style={styles.testQuestion}>
              <Text style={styles.questionText}>
                Câu 1: "おはよう" có nghĩa là gì?
              </Text>
              <TouchableOpacity style={styles.answerOption}>
                <Text style={styles.answerText}>A. Xin chào</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerOption, styles.selectedAnswer]}>
                <Text style={styles.selectedAnswerText}>B. Chào buổi sáng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerOption}>
                <Text style={styles.answerText}>C. Tạm biệt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerOption}>
                <Text style={styles.answerText}>D. Chúc ngủ ngon</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.defaultContainer}>
            <Text style={styles.defaultText}>
              Nội dung bài học đang được cập nhật...
            </Text>
          </View>
        );
    }
  };

  const handleComplete = () => {
    // Giả lập hoàn thành bài học
    setIsCompleted(true);

    // Trong thực tế, bạn sẽ gọi API để cập nhật trạng thái bài học
    console.log('Lesson completed:', lessonId);

    // Hiển thị modal hoặc chuyển trang
    // Ở đây chúng ta chỉ hiển thị một thông báo đơn giản
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={lesson.title} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <View style={styles.lessonMeta}>
              <Text style={styles.lessonType}>
                {lesson.type === 'reading'
                  ? '📖 Đọc hiểu'
                  : lesson.type === 'listening'
                  ? '🎧 Nghe hiểu'
                  : lesson.type === 'writing'
                  ? '✏️ Luyện viết'
                  : lesson.type === 'vocabulary'
                  ? '📝 Từ vựng'
                  : lesson.type === 'grammar'
                  ? '📏 Ngữ pháp'
                  : '📋 Kiểm tra'}
              </Text>
              <Text style={styles.lessonDuration}>⏱️ {lesson.duration}</Text>
            </View>
          </View>
        </View>

        <View style={styles.lessonContent}>{renderLessonContent()}</View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!isCompleted ? (
          <CustomButton
            title="Hoàn thành bài học"
            onPress={handleComplete}
            type="primary"
            size="large"
            style={styles.completeButton}
          />
        ) : (
          <View style={styles.completedContainer}>
            <Text style={styles.completedIcon}>✓</Text>
            <Text style={styles.completedText}>Đã hoàn thành bài học!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Thêm StyleSheet vào đây
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  lessonHeader: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lessonInfo: {
    paddingBottom: 10,
  },
  courseTitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 5,
  },
  lessonTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.text,
    marginBottom: 10,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonType: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginRight: 15,
  },
  lessonDuration: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  lessonContent: {
    flex: 1,
    padding: SIZES.padding,
    paddingBottom: 100, // Extra padding for bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  completeButton: {
    width: '100%',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  completedIcon: {
    fontSize: 24,
    color: COLORS.success,
    marginRight: 10,
  },
  completedText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.success,
  },

  // Exercise containers
  exerciseContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  contentTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 15,
  },

  // Listening exercise styles
  audioPlayerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 15,
  },
  audioWaveform: {
    width: '100%',
    height: 60,
    borderRadius: SIZES.radius,
    marginBottom: 15,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButton: {
    padding: 10,
  },
  audioButtonIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButtonIcon: {
    fontSize: 30,
    color: COLORS.white,
  },
  transcriptToggle: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  transcriptToggleText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  transcriptContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  japaneseText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  vietnameseText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    lineHeight: 22,
  },

  // Question styles
  questionsContainer: {
    marginTop: 10,
  },
  questionSectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 15,
  },
  questionItem: {
    marginBottom: 20,
  },
  questionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  answerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginBottom: 8,
  },
  selectedAnswer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  selectedAnswerText: {
    color: COLORS.white,
  },

  // Reading exercise styles
  readingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  translationToggle: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
    padding: 5,
  },
  translationToggleText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },

  // Writing exercise styles
  writingInstructionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  instructionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  promptText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  writingInputContainer: {
    marginBottom: 20,
  },
  writingInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 15,
    minHeight: 120,
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
  feedbackContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
  },
  correctAnswerLabel: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 5,
  },
  correctAnswerText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },

  // Vocabulary styles
  vocabularyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  vocabularyItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 10,
  },

  // Grammar styles
  grammarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  grammarPoint: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 10,
  },
  grammarTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  grammarExplanation: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 15,
    lineHeight: 22,
  },
  exampleContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 10,
  },
  exampleTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 5,
  },

  // Test styles
  testContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  testDescription: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 20,
  },
  testQuestion: {
    marginBottom: 20,
  },

  // Default
  defaultContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.small,
    minHeight: 200,
  },
  defaultText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default LessonScreen;
