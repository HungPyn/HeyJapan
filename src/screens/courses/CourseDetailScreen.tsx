// src/screens/courses/CourseDetailScreen.tsx
import React, {useMemo, useState, useEffect, useCallback} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Image} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces (giữ nguyên)
interface Lesson {
  lesson_code: number;
  lesson_name: string;
  status?: 'completed' | 'pending';
  lesson_type?: 'hira' | 'kata' | 'common' | 'theory' | 'exam';
  lesson_description: string;
  quantity_content: number;
  day_creation: string;
  topic_code: number;
}
interface ApiTheoryDTO {
  id: number;
  name: string;
  isComplete?: boolean | null;
}
interface ApiLessonInList {
  id: number;
  name: string;
  isComplete: boolean | null;
}
interface ApiExamResponseDTO {
  id: number;
  name: string;
  isComplete: boolean | null;
}
interface ApiTopicViewResponse {
  id: number;
  name: string;
  theoryDTO: ApiTheoryDTO | null;
  lessons: ApiLessonInList[];
  examResponseDTO: ApiExamResponseDTO | null;
}

type CourseDetailScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'Lesson' | 'ContentsLyThuyetScreen' | 'ContentsScreen'
>;

const LessonStatusIcon = ({status}: {status?: Lesson['status']}) => {
  if (status === 'completed') {
    return (
      <Image
        source={require('../../assets/images/hoanThanh.png')}
        style={styles.lessonStatusImage}
      />
    );
  }
  return (
    <Image
      source={require('../../assets/images/chuaHoc.png')}
      style={styles.lessonStatusImage}
    />
  );
};

const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailScreenRouteProp>();
  const navigation = useNavigation<CourseDetailScreenNavigationProp>();

  // ***** BỎ ĐOẠN CODE BỊ LẶP LẠI Ở ĐÂY *****
  // Chỉ giữ lại một lần lấy params và console.log
  console.log('--------------------------------------------------');
  console.log('CourseDetailScreen: MOUNTED / PARAMS CHANGED');
  console.log(
    'CourseDetailScreen: route.params nhận được:',
    JSON.stringify(route.params, null, 2),
  );

  const {courseId, title: initialTopicTitle} = route.params || {};

  console.log('CourseDetailScreen: courseId trích xuất:', courseId);
  console.log(
    'CourseDetailScreen: initialTopicTitle trích xuất:',
    initialTopicTitle,
  );
  // ***** KẾT THÚC PHẦN BỎ LẶP LẠI *****

  const [allScreenItems, setAllScreenItems] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<'Hira' | 'Kata'>('Hira');
  const [displayTitle, setDisplayTitle] = useState<string>(
    initialTopicTitle || 'Chi tiết chủ đề',
  );

  const currentTopicIdAsNumber = useMemo(() => {
    if (typeof courseId === 'string' && courseId.trim() !== '') {
      const parsedId = parseInt(courseId, 10);
      console.log(
        `CourseDetailScreen: Đang parse courseId "${courseId}" thành số: ${parsedId}`,
      );
      return parsedId;
    }
    console.warn(
      'CourseDetailScreen: courseId không phải là string hợp lệ hoặc không được cung cấp:',
      courseId,
    );
    return NaN;
  }, [courseId]);

  const fetchTopicDetails = useCallback(
    async (topicIdToFetch: number, userId: string) => {
      if (isNaN(topicIdToFetch)) {
        setError('ID chủ đề không hợp lệ.');
        setIsLoading(false);
        setAllScreenItems([]);
        return;
      }
      if (!userId) {
        setError('Không có thông tin người dùng để tải dữ liệu.');
        setIsLoading(false);
        setAllScreenItems([]);
        return;
      }

      console.log(
        `CourseDetailScreen: Gọi fetchTopicDetails với topicId: ${topicIdToFetch}, userId: ${userId}`,
      );
      setIsLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        }

        const response = await axios.get<ApiTopicViewResponse>(
          `http://10.0.2.2:8080/api/user/topic/view?topicId=${topicIdToFetch}&idUser=${userId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );

        console.log(
          'CourseDetailScreen: API Response Status:',
          response.status,
        );
        console.log(
          'CourseDetailScreen: API Response Data:',
          JSON.stringify(response.data, null, 2),
        );

        if (response.data) {
          const topicData = response.data;
          setDisplayTitle(
            topicData.name || initialTopicTitle || 'Chi tiết chủ đề',
          );
          const combinedItems: Lesson[] = [];
          if (topicData.theoryDTO) {
            combinedItems.push({
              lesson_code: topicData.theoryDTO.id,
              lesson_name: topicData.theoryDTO.name,
              status:
                topicData.theoryDTO.isComplete === true
                  ? 'completed'
                  : 'pending',
              lesson_type: 'common',
              lesson_description: '',
              quantity_content: 0,
              day_creation: '',
              topic_code: topicIdToFetch,
            });
          }
          if (topicData.lessons && topicData.lessons.length > 0) {
            topicData.lessons.forEach(apiLesson => {
              combinedItems.push({
                lesson_code: apiLesson.id,
                lesson_name: apiLesson.name,
                status: apiLesson.isComplete === true ? 'completed' : 'pending',
                lesson_type: 'common',
                lesson_description: '',
                quantity_content: 0,
                day_creation: '',
                topic_code: topicIdToFetch,
              });
            });
          }
          if (topicData.examResponseDTO) {
            combinedItems.push({
              lesson_code: topicData.examResponseDTO.id,
              lesson_name: topicData.examResponseDTO.name,
              status:
                topicData.examResponseDTO.isComplete === true
                  ? 'completed'
                  : 'pending',
              lesson_type: 'common',
              lesson_description: '',
              quantity_content: 0,
              day_creation: '',
              topic_code: topicIdToFetch,
            });
          }
          console.log(
            'CourseDetailScreen: Dữ liệu đã map (combinedItems):',
            JSON.stringify(combinedItems, null, 2),
          );
          setAllScreenItems(combinedItems);
        } else {
          setAllScreenItems([]);
          setError('Không nhận được cấu trúc dữ liệu mong đợi từ API.');
          console.log(
            'CourseDetailScreen: response.data là null hoặc undefined.',
          );
        }
      } catch (err: any) {
        console.error(
          `CourseDetailScreen: Lỗi nghiêm trọng khi tải chi tiết chủ đề ${topicIdToFetch}:`,
          err.isAxiosError ? err.toJSON() : err,
        );
        let errorMessage = 'Đã xảy ra lỗi khi tải dữ liệu.';
        if (axios.isAxiosError(err)) {
          if (err.response) {
            errorMessage = `Lỗi từ server: ${
              err.response.status
            } - ${JSON.stringify(
              err.response.data?.message ||
                err.response.data ||
                'Không có thông báo lỗi cụ thể',
            )}`;
          } else if (err.request) {
            errorMessage =
              'Không nhận được phản hồi từ server. Kiểm tra kết nối mạng và địa chỉ API.';
          } else {
            errorMessage = `Lỗi khi thiết lập request: ${err.message}`;
          }
        } else {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
        setAllScreenItems([]);
      } finally {
        setIsLoading(false);
        console.log('CourseDetailScreen: fetchTopicDetails hoàn thành.');
      }
    },
    [initialTopicTitle],
  );

  useEffect(() => {
    const getUserIdAndFetch = async () => {
      console.log(
        'CourseDetailScreen: useEffect [currentTopicIdAsNumber, fetchTopicDetails] triggered. currentTopicIdAsNumber:',
        currentTopicIdAsNumber,
      );
      if (!isNaN(currentTopicIdAsNumber)) {
        try {
          const storedUserId = await AsyncStorage.getItem('UserId');
          console.log(
            'CourseDetailScreen: UserId lấy từ AsyncStorage:',
            storedUserId,
          );
          if (storedUserId) {
            fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
          } else {
            setError(
              'Không tìm thấy UserId trong Storage. Không thể tải dữ liệu.',
            );
            setIsLoading(false);
            setAllScreenItems([]);
            console.error(
              'CourseDetailScreen: UserId không tìm thấy trong AsyncStorage.',
            );
          }
        } catch (e) {
          setError('Lỗi khi đọc UserId từ Storage.');
          setIsLoading(false);
          setAllScreenItems([]);
          console.error(
            'CourseDetailScreen: Lỗi khi đọc UserId từ AsyncStorage:',
            e,
          );
        }
      } else {
        setError(
          'Không thể tải dữ liệu: ID chủ đề không hợp lệ hoặc không được cung cấp.',
        );
        setIsLoading(false);
        setAllScreenItems([]);
        console.log(
          'CourseDetailScreen: ID chủ đề không hợp lệ, không fetch details.',
        );
      }
    };

    getUserIdAndFetch();
  }, [currentTopicIdAsNumber, fetchTopicDetails]);

  const itemsForDisplay = useMemo(() => {
    let filteredItems = [...allScreenItems];
    if (displayTitle.toLowerCase() === 'bảng chữ cái') {
      if (activeSegment === 'Hira') {
        filteredItems = filteredItems.filter(
          item => item.lesson_type === 'hira' || item.lesson_type === 'common',
        );
      } else if (activeSegment === 'Kata') {
        filteredItems = filteredItems.filter(
          item => item.lesson_type === 'kata' || item.lesson_type === 'common',
        );
      }
    }
    return filteredItems;
  }, [allScreenItems, activeSegment, displayTitle]);

  if (!courseId && !initialTopicTitle) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không có thông tin chủ đề được truyền vào.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleLessonPress = (item: Lesson) => {
    const lessonNameLower = (item.lesson_name || '').toLowerCase();
    const targetLessonId = item.lesson_code.toString();
    const targetLessonName = item.lesson_name;

    console.log('Đã chọn mục:', targetLessonName, 'ID:', targetLessonId);

    if (lessonNameLower.includes('lý thuyết')) {
      navigation.navigate('ContentsLyThuyetScreen', {
        lessonCode: targetLessonId,
        lessonName: targetLessonName,
      });
    } else {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn vào mục này không?',
        [
          {text: 'Hủy', style: 'cancel'},
          {
            text: 'Đồng ý',
            onPress: () => {
              navigation.navigate('ContentsScreen', {
                lessonCode: targetLessonId,
                lessonName: targetLessonName,
              });
            },
          },
        ],
        {cancelable: true},
      );
    }
  };

  const renderScreenItemWithCorrectIndex = ({
    item,
    index,
  }: {
    item: Lesson;
    index: number;
  }) => {
    let displayIndex = '';
    const itemNameLower = item.lesson_name.toLowerCase();

    if (itemNameLower.includes('lý thuyết')) {
      displayIndex = 'Lý thuyết';
    } else if (itemNameLower.includes('kiểm tra')) {
      displayIndex = 'Kiểm tra';
    } else {
      let lessonCounter = 0;
      for (let i = 0; i < index; i++) {
        if (
          allScreenItems[i] && // Thêm kiểm tra để đảm bảo allScreenItems[i] tồn tại
          !allScreenItems[i].lesson_name.toLowerCase().includes('lý thuyết') &&
          !allScreenItems[i].lesson_name.toLowerCase().includes('kiểm tra')
        ) {
          lessonCounter++;
        }
      }
      displayIndex = `Bài ${lessonCounter + 1}`;
    }

    return (
      <TouchableOpacity
        style={styles.lessonItemContainer}
        onPress={() => handleLessonPress(item)}>
        <Text style={styles.lessonNumberText}>{displayIndex}</Text>
        <View style={styles.lessonInfoContainer}>
          <Text style={styles.lessonNameText} numberOfLines={1}>
            {item.lesson_name}
          </Text>
        </View>
        <LessonStatusIcon status={item.status} />
      </TouchableOpacity>
    );
  };

  const showSegmentControl = displayTitle.toLowerCase() === 'bảng chữ cái';

  const handleRetryFetch = async () => {
    console.log('CourseDetailScreen: Người dùng nhấn Thử lại.');
    if (!isNaN(currentTopicIdAsNumber)) {
      try {
        const storedUserId = await AsyncStorage.getItem('UserId');
        if (storedUserId) {
          fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
        } else {
          setError('Không tìm thấy UserId. Không thể thử lại.');
          console.error(
            'CourseDetailScreen: Thử lại thất bại - UserId không tìm thấy trong AsyncStorage.',
          );
        }
      } catch (e) {
        setError('Lỗi đọc UserId khi thử lại.');
        console.error(
          'CourseDetailScreen: Thử lại thất bại - Lỗi đọc UserId từ AsyncStorage:',
          e,
        );
      }
    } else {
      console.warn(
        'CourseDetailScreen: Thử lại thất bại - ID chủ đề không hợp lệ.',
      );
    }
  };

  console.log(
    'CourseDetailScreen: Chuẩn bị render. isLoading:',
    isLoading,
    'error:',
    error,
    'itemsForDisplay length:',
    itemsForDisplay.length,
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../assets/images/nen3.jpg')}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{opacity: 0.15}}
          resizeMode="cover">
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
            <View
              style={{
                width: showSegmentControl
                  ? styles.segmentControlContainer.width || SIZES.padding * 10
                  : SIZES.padding * 4,
              }}
            />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../assets/images/nen3.jpg')}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{opacity: 0.15}}
          resizeMode="cover">
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
            <View
              style={{
                width: showSegmentControl
                  ? styles.segmentControlContainer.width || SIZES.padding * 10
                  : SIZES.padding * 4,
              }}
            />
          </View>
          <View style={styles.errorDisplayContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={handleRetryFetch}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

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
              <View style={{width: SIZES.padding * 4}} />
            )}
          </View>

          {itemsForDisplay.length > 0 ? (
            <FlatList
              data={itemsForDisplay}
              renderItem={renderScreenItemWithCorrectIndex}
              keyExtractor={(item, index) => `${item.lesson_code}-${index}`}
              style={styles.lessonsList}
              contentContainerStyle={styles.lessonsListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyLessonsContainer}>
              <Text style={styles.emptyLessonsText}>
                Chưa có nội dung nào cho chủ đề này.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (giữ nguyên)
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
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: StatusBar.currentHeight || 20,
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.gray,
  },
  backButton: {
    paddingRight: SIZES.padding,
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
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: SIZES.medium,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
    // @ts-ignore
    width: undefined,
  },
  segmentButton: {
    paddingHorizontal: SIZES.padding * 1.2,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.white,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
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
  lessonNumberText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.black,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 50,
    textAlign: 'center',
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
  lessonStatusImage: {
    width: 20,
    height: 20,
    marginLeft: SIZES.padding,
  },
  emptyLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  emptyLessonsText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  errorDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.red,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
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
