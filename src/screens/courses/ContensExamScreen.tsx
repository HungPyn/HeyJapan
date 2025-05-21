// src/screens/courses/ContentExamScreen.tsx
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList} from '../../navigation'; // Đảm bảo đường dẫn này đúng
import {COLORS, FONTS, SIZES} from '../../constants/theme'; // Đảm bảo đường dẫn này đúng

// Định nghĩa kiểu cho route prop của màn hình này
type ContentExamScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentExam'
>;

// Định nghĩa kiểu cho navigation prop (nếu bạn cần dùng navigation.goBack() chẳng hạn)
type ContentExamScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'ContentExam'
>;

const ContentExamScreen: React.FC = () => {
  const route = useRoute<ContentExamScreenRouteProp>();
  const navigation = useNavigation<ContentExamScreenNavigationProp>();

  // Lấy params từ route
  const {topicId, lessonName, lessonCode} = route.params || {};

  useEffect(() => {
    console.log('--- ContentExamScreen Params ---');
    console.log('Topic ID:', topicId);
    console.log('Lesson Name:', lessonName);
    console.log('Lesson Code (if any):', lessonCode); // lessonCode là optional
    console.log('-----------------------------');
  }, [topicId, lessonName, lessonCode]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>ContentExam Screen</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Tên bài kiểm tra (Lesson Name):</Text>
          <Text style={styles.value}>{lessonName || 'Không có'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Topic ID:</Text>
          <Text style={styles.value}>{topicId || 'Không có'}</Text>
        </View>

        {lessonCode && ( // Chỉ hiển thị nếu lessonCode được truyền
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Lesson Code:</Text>
            <Text style={styles.value}>{lessonCode}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.text,
    marginBottom: SIZES.padding * 2,
  },
  infoContainer: {
    marginBottom: SIZES.margin,
    padding: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    width: '90%',
    alignItems: 'center',
  },
  label: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    color: COLORS.darkGray,
  },
  value: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular?.fontFamily || 'System',
    color: COLORS.text,
    marginTop: SIZES.base / 2,
  },
  backButton: {
    marginTop: SIZES.padding * 2,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium?.fontFamily || 'System',
  },
});

export default ContentExamScreen;
