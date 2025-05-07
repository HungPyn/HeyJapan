// src/screens/courses/CourseDetailScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList } from '../../navigation';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import Header from '../../components/common/Header';
import LessonItem from '../../components/lessons/LessonItem';
import CustomButton from '../../components/common/CustomButton';
import { mockCourses, mockLessons } from '../../mocks/courseData';
import { Lesson } from '../../types';

type CourseDetailScreenRouteProp = RouteProp<CoursesStackParamList, 'CourseDetail'>;
type CourseDetailScreenNavigationProp = StackNavigationProp<CoursesStackParamList, 'CourseDetail'>;

const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailScreenRouteProp>();
  const navigation = useNavigation<CourseDetailScreenNavigationProp>();
  const { courseId } = route.params;
  
  // Lấy thông tin khóa học từ mock data
  const course = mockCourses.find(c => c.id === courseId);
  // Lấy danh sách bài học của khóa học từ mock data
  const lessons = mockLessons[courseId] || [];
  
  if (!course) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin khóa học</Text>
        <CustomButton
          title="Quay lại"
          onPress={() => navigation.goBack()}
          type="primary"
          style={{ marginTop: 20 }}
        />
      </SafeAreaView>
    );
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Sơ cấp';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Cao cấp';
      default:
        return 'Không xác định';
    }
  };
  
  const handleLessonPress = (lesson: Lesson) => {
    navigation.navigate('Lesson', { lessonId: lesson.id, courseId });
  };

  const getCompletedLessonsCount = () => {
    return lessons.filter(lesson => lesson.status === 'completed').length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Chi tiết khóa học" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.courseHeader}>
          <Image
            source={{ uri: course.imageUrl }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          
          <View style={styles.courseInfoContainer}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎯</Text>
                <Text style={styles.infoText}>{getLevelText(course.level)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🕒</Text>
                <Text style={styles.infoText}>{course.duration}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📚</Text>
                <Text style={styles.infoText}>{course.lessonsCount} bài học</Text>
              </View>
            </View>
            
            {course.progress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Tiến độ hoàn thành</Text>
                  <Text style={styles.progressPercentage}>{course.progress}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${course.progress}%` }
                    ]}
                  />
                </View>
                <Text style={styles.completedText}>
                  {getCompletedLessonsCount()}/{lessons.length} bài học
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
          <Text style={styles.descriptionText}>{course.description}</Text>
        </View>
        
        <View style={styles.lessonsContainer}>
          <Text style={styles.sectionTitle}>Nội dung khóa học</Text>
          
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                onPress={handleLessonPress}
              />
            ))
          ) : (
            <View style={styles.emptyLessonsContainer}>
              <Text style={styles.emptyLessonsText}>
                Khóa học đang được cập nhật bài học. Vui lòng quay lại sau.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <CustomButton
          title={lessons.length > 0 ? "Bắt đầu học" : "Tham gia khóa học"}
          onPress={() => {
            if (lessons.length > 0) {
              handleLessonPress(lessons[0]);
            }
          }}
          type="primary"
          size="large"
          style={styles.startButton}
          disabled={lessons.length === 0}
        />
      </View>
    </SafeAreaView>
  );
};

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
  courseHeader: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  courseImage: {
    width: '100%',
    height: 180,
  },
  courseInfoContainer: {
    padding: SIZES.padding,
  },
  courseTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  infoText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  progressPercentage: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  completedText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 5,
    textAlign: 'right',
  },
  descriptionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 10,
  },
  descriptionText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  lessonsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.margin,
    padding: SIZES.padding,
    marginBottom: 80, // Space for bottom bar
    ...SHADOWS.medium,
  },
  emptyLessonsContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyLessonsText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    width: '100%',
  },
});

export default CourseDetailScreen;