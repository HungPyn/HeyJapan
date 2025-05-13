// src/screens/courses/CourseDetailScreen.tsx
import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, CoursesStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import {Image} from 'react-native'; // Import Image đã có sẵn

// Dữ liệu khóa học mẫu - BẠN NÊN IMPORT TỪ FILE DỮ LIỆU TRUNG TÂM
const mockCoursesData = [
  {
    topic_code: '101',
    title: 'Bảng chữ cái',
    imageUrl: 'url_abc_course',
    levelCode: 'Sơ cấp',
    quantityLesson: 11,
  },
  {
    topic_code: '102',
    title: 'Lý thuyết',
    imageUrl: 'url_greeting_course',
    levelCode: 'Sơ cấp',
    quantityLesson: 2,
  },
  {
    topic_code: '103',
    title: 'Số đếm & Thời gian',
    imageUrl: 'url_numbers_course',
    levelCode: 'Sơ cấp',
    quantityLesson: 0,
  },
];

// Định nghĩa Type cho Lesson
interface Lesson {
  lesson_code: number;
  lesson_name: string;
  lesson_description: string;
  quantity_content: number;
  day_creation: string;
  topic_code: number;
  status?: 'completed' | 'pending'; // Chỉ còn 2 trạng thái
  lesson_type?: 'hira' | 'kata' | 'common' | 'grammar';
}

// Dữ liệu bài học bạn cung cấp
const allLessonsData: Lesson[] = [
  {
    lesson_code: 1,
    lesson_name: 'Giới thiệu khóa học',
    lesson_description: 'Tổng quan...',
    quantity_content: 3,
    day_creation: '2025-05-10 08:00:00',
    topic_code: 101,
    status: 'completed',
    lesson_type: 'common',
  },
  {
    lesson_code: 2,
    lesson_name: 'Lý thuyết',
    lesson_description: 'Học bảng chữ cái Hiragana...',
    quantity_content: 5,
    day_creation: '2025-05-10 08:10:00',
    topic_code: 101,
    status: 'completed',
    lesson_type: 'hira',
  },
  {
    lesson_code: 14,
    lesson_name: 'Lý thuyết',
    lesson_description: 'Học bảng chữ cái Hiragana...',
    quantity_content: 5,
    day_creation: '2025-05-10 08:10:00',
    topic_code: 102,
    status: 'completed',
    lesson_type: 'hira',
  },
  {
    lesson_code: 3,
    lesson_name: 'カタカナ（基本）- Hàng KA',
    lesson_description: 'Làm quen với bảng chữ cái Katakana...',
    quantity_content: 5,
    day_creation: '2025-05-10 08:20:00',
    topic_code: 101,
    status: 'completed',
    lesson_type: 'kata',
  },
  {
    lesson_code: 4,
    lesson_name: 'Chữ ghép Hiragana',
    lesson_description: '...',
    quantity_content: 4,
    day_creation: '2025-05-10 08:30:00',
    topic_code: 101,
    status: 'completed',
    lesson_type: 'hira',
  },
  {
    lesson_code: 5,
    lesson_name: 'Chữ ghép Katakana',
    lesson_description: '...',
    quantity_content: 5,
    day_creation: '2025-05-10 08:40:00',
    topic_code: 101,
    status: 'pending',
    lesson_type: 'kata',
  },
  {
    lesson_code: 6,
    lesson_name: 'Âm đục và bán âm đục (Hira)',
    lesson_description: '...',
    quantity_content: 6,
    day_creation: '2025-05-10 08:50:00',
    topic_code: 101,
    status: 'pending',
    lesson_type: 'hira',
  },
  {
    lesson_code: 7,
    lesson_name: 'Trường âm (Kata)',
    lesson_description: '...',
    quantity_content: 5,
    day_creation: '2025-05-10 09:00:00',
    topic_code: 101,
    status: 'pending',
    lesson_type: 'kata',
  },
  {
    lesson_code: 12,
    lesson_name: 'Chào buổi sáng - おはようございます',
    lesson_description: '...',
    quantity_content: 3,
    day_creation: '2025-05-11 08:00:00',
    topic_code: 102,
    status: 'completed',
    lesson_type: 'common',
  },
  {
    lesson_code: 13,
    lesson_name: 'Tự giới thiệu cơ bản',
    lesson_description: '...',
    quantity_content: 5,
    day_creation: '2025-05-11 08:10:00',
    topic_code: 102,
    status: 'pending',
    lesson_type: 'common',
  },
];

type CourseDetailScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'Lesson'
>;

// Sửa đổi LessonStatusIcon: Chỉ còn completed và pending
const LessonStatusIcon = ({status}: {status?: Lesson['status']}) => {
  if (status === 'completed') {
    // Sử dụng Image component bạn đã có trong file gốc
    return (
      <Image
        source={require('../../assets/images/hoanThanh.png')} // Đường dẫn icon hoàn thành của bạn
        style={styles.lessonStatusImage} // Style riêng cho ảnh icon
      />
    );
  }
  // Mặc định là 'pending' (đang làm/chưa bắt đầu)
  return (
    <Image
      source={require('../../assets/images/chuaHoc.png')} // Đường dẫn icon chưa học của bạn
      style={styles.lessonStatusImage} // Style riêng cho ảnh icon
    />
  );
};

const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailScreenRouteProp>();
  const navigation = useNavigation<CourseDetailScreenNavigationProp>();
  const {courseId, title: courseTitleFromParams} = route.params; // Lấy title từ params nếu có, nếu không thì dùng từ course object

  // SỬA ĐỔI: activeSegment mặc định là 'Hira', bỏ 'All' khỏi type
  const [activeSegment, setActiveSegment] = useState<'Hira' | 'Kata'>('Hira');

  // Lấy thông tin khóa học từ mockCoursesData
  // Ưu tiên title từ params nếu được truyền qua, nếu không thì tìm trong mockCoursesData
  const courseInfo = mockCoursesData.find(c => c.topic_code === courseId);
  const displayTitle =
    courseTitleFromParams || courseInfo?.title || 'Chi tiết khóa học';

  const currentCourseIdAsNumber = parseInt(courseId, 10);
  const lessonsForThisCourse = useMemo(() => {
    let filteredLessons = allLessonsData.filter(
      lesson => lesson.topic_code === currentCourseIdAsNumber,
    );

    // Logic filter theo activeSegment (Hira/Kata)
    // Chỉ hiển thị nếu title của khóa học là "Bảng chữ cái" (viết hoa/thường)
    if (displayTitle.toLowerCase() === 'bảng chữ cái') {
      if (activeSegment === 'Hira') {
        filteredLessons = filteredLessons.filter(
          lesson =>
            lesson.lesson_type === 'hira' || lesson.lesson_type === 'common',
        );
      } else if (activeSegment === 'Kata') {
        filteredLessons = filteredLessons.filter(
          lesson =>
            lesson.lesson_type === 'kata' || lesson.lesson_type === 'common',
        );
      }
    } else {
      // Nếu không phải "Bảng chữ cái", không filter theo Hira/Kata, hiển thị tất cả bài của topic_code
      // Hoặc bạn có thể ẩn luôn segment control nếu không phải khóa "Bảng chữ cái"
    }
    return filteredLessons;
  }, [currentCourseIdAsNumber, activeSegment, displayTitle]);

  if (!courseInfo && !courseTitleFromParams) {
    // Kiểm tra nếu không có thông tin khóa học
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin khóa học.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleLessonPress = (lesson: Lesson) => {
    console.log(
      'Đã chọn bài học:',
      lesson.lesson_name,
      'Code:',
      lesson.lesson_code,
    );

    const lessonNameLower = (lesson.lesson_name || '').toLowerCase();
    const targetLessonCode = lesson.lesson_code.toString();
    const targetLessonName = lesson.lesson_name;

    if (lessonNameLower.includes('lý thuyết')) {
      console.log(
        `Điều hướng đến ContentsLyThuyetScreen với lessonCode: ${targetLessonCode}, lessonName: ${targetLessonName}`,
      );
      navigation.navigate('ContentsLyThuyetScreen', {
        lessonCode: targetLessonCode,
        lessonName: targetLessonName,
      });
    } else {
      // Hiển thị thông báo xác nhận trước khi điều hướng
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn học bài này không?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đồng ý',
            onPress: () => {
              console.log(
                `Điều hướng đến ContentsScreen với lessonCode: ${targetLessonCode}, lessonName: ${targetLessonName}`,
              );
              navigation.navigate('ContentsScreen', {
                lessonCode: targetLessonCode,
                lessonName: targetLessonName,
                // contentType: lesson.lesson_type || 'unknown',
              });
            },
          },
        ],
        {cancelable: true},
      );
    }
  };

  const renderLessonItem = ({item, index}: {item: Lesson; index: number}) => (
    <TouchableOpacity
      style={styles.lessonItemContainer}
      onPress={() => handleLessonPress(item)}>
      <Text style={styles.lessonNumberText}>Bài {index + 1}</Text>
      <View style={styles.lessonInfoContainer}>
        <Text style={styles.lessonNameText} numberOfLines={1}>
          {item.lesson_name}
        </Text>
      </View>
      <LessonStatusIcon status={item.status} />
    </TouchableOpacity>
  );

  // Biến để quyết định có hiển thị Segment Control hay không
  const showSegmentControl = displayTitle.toLowerCase() === 'bảng chữ cái';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.15}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {displayTitle}
              </Text>
            </View>
            {/* Chỉ hiển thị segment control nếu là khóa "Bảng chữ cái" */}
            {showSegmentControl ? (
              <View style={styles.segmentControlContainer}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    activeSegment === 'Hira' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setActiveSegment('Hira')}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      activeSegment === 'Hira' &&
                        styles.segmentButtonTextActive,
                    ]}>
                    Hira
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    activeSegment === 'Kata' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setActiveSegment('Kata')}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      activeSegment === 'Kata' &&
                        styles.segmentButtonTextActive,
                    ]}>
                    Kata
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Placeholder để giữ cấu trúc header nếu không có segment control
              <View style={{width: SIZES.padding * 4}} /> // Điều chỉnh width cho phù hợp
            )}
          </View>

          {lessonsForThisCourse.length > 0 ? (
            <FlatList
              data={lessonsForThisCourse}
              renderItem={renderLessonItem}
              keyExtractor={item => item.lesson_code.toString()}
              style={styles.lessonsList}
              contentContainerStyle={styles.lessonsListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyLessonsContainer}>
              <Text style={styles.emptyLessonsText}>
                Chưa có bài học nào cho chủ đề này hoặc bộ lọc hiện tại.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Giữ nguyên styles bạn đã cung cấp ở lần gần nhất (lúc 07:41 PM)
// Chỉ cần đảm bảo các màu như COLORS.green, COLORS.orange cho LessonStatusIcon
// và COLORS.nenItem, COLORS.primary cho lessonItemContainer đã được định nghĩa.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between', // Bỏ cái này để headerTitleContainer có thể flex và đẩy segment ra xa
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: StatusBar.currentHeight || 20,
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.gray,
  },
  backButton: {
    paddingRight: SIZES.padding, // Giữ padding để dễ bấm
    paddingLeft: SIZES.padding * 0.5,
    paddingVertical: SIZES.padding * 0.5,
  },
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: SIZES.padding * 0.5,
  },
  headerTitleContainer: {
    flex: 1, // Cho phép tiêu đề chiếm không gian còn lại ở giữa
    alignItems: 'flex-start', // Căn giữa tiêu đề
    marginHorizontal: SIZES.medium, // Khoảng cách nhỏ với nút back và segment
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white, // Giữ style của bạn
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
    // Không cần padding ở đây nếu segmentButton đã có
  },
  segmentButton: {
    paddingHorizontal: SIZES.padding * 1.2,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.white,
    // borderRadius: 5, // Bo góc bên trong segment, có thể không cần nếu container đã bo
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    // shadow có thể giữ nếu muốn
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2.0,
    elevation: 2,
  },
  segmentButtonText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  segmentButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  lessonsList: {
    flex: 1,
  },
  lessonsListContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 2,
  },
  lessonItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    paddingVertical: SIZES.padding * 1.3,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin * 1.2,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  // Không cần lessonItemLocked nữa
  lessonNumberContainer: {
    backgroundColor: COLORS.nenItem, // Giữ nguyên
    minWidth: 55,
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 0.5,
    borderRadius: SIZES.radius * 0.8,
    marginRight: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.black,
    fontWeight: '700',
    marginRight: 10,
  },
  lessonInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  lessonNameText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 2,
    fontWeight: '400',
  },
  lessonStatusIcon: {
    // Style chung cho icon text
    fontSize: SIZES.h2 * 0.8, // Điều chỉnh kích thước icon
    marginLeft: SIZES.padding,
  },
  lessonStatusImage: {
    // Style cho icon dạng ảnh
    width: 20, // Kích thước bạn muốn cho icon ảnh
    height: 20,
    marginLeft: SIZES.padding,
  },
  emptyLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    marginTop: SIZES.padding * 5,
  },
  emptyLessonsText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  backButtonTextError: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
});

export default CourseDetailScreen;
