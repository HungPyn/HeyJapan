// src/screens/tien_do/TienDoScreen.tsx
import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {RootStackParamList} from '../../navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- Định nghĩa kiểu dữ liệu cho API Response ---
interface LessonResultApiResponse {
  id: number | null;
  userId: string | null;
  lessonId: number;
  name: string;
  total_attempts: number | null;
  studyTime: number | null;
  completionPercent: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
}

interface ExamResultApiResponse {
  id: number | null;
  userId: string | null;
  topicId: number | null;
  total_attempts: number | null;
  examTime: number | null;
  topicName: string | null;
  scorePercent: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
}
// --- END Định nghĩa kiểu dữ liệu API ---

type TienDoScreenRouteProp = RouteProp<RootStackParamList, 'TienDoScreen'>;
type TienDoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoScreen'
>;

interface ProgressItem {
  id: string;
  title: string;
  correctRatio?: string;
  completion?: number;
  speed?: string;
  type: 'lesson' | 'test';
}

// Hàm format thời gian từ giây sang "X:YY phút"
// Sẽ trả về undefined nếu totalSeconds là null, undefined, hoặc <= 0
// để logic lọc item hoạt động đúng
const formatTimeDisplay = (
  totalSeconds: number | null | undefined,
): string | undefined => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    totalSeconds <= 0
  ) {
    return undefined;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} phút`;
};

const TienDoScreen: React.FC = () => {
  const route = useRoute<TienDoScreenRouteProp>();
  const navigation = useNavigation<TienDoScreenNavigationProp>();

  const {
    topic_code = 'unknown',
    title: topicTitleFromParam = 'Tiến độ học tập',
  } = route.params || {};

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [lessonProgressItems, setLessonProgressItems] = useState<
    ProgressItem[]
  >([]);
  const [examProgressItem, setExamProgressItem] = useState<ProgressItem | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (topic_code === 'unknown') {
        setError('Không tìm thấy thông tin chủ đề.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userId = await AsyncStorage.getItem('UserId');
        const token = await AsyncStorage.getItem('token');

        if (!userId || !token) {
          setError(
            'Thông tin người dùng hoặc token không hợp lệ. Vui lòng đăng nhập lại.',
          );
          setLoading(false);
          return;
        }

        const API_BASE_URL = 'http://10.0.2.2:8080/api/user/result';
        const requestHeaders = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };

        const lessonApiUrl = `${API_BASE_URL}/lesson-result?userId=${userId}&topicId=${topic_code}`;
        const examApiUrl = `${API_BASE_URL}/exam-result?userId=${userId}&topicId=${topic_code}`;

        console.log('Gọi API Bài học:', lessonApiUrl);
        const lessonResponse = await axios.get<LessonResultApiResponse[]>(
          lessonApiUrl,
          {headers: requestHeaders},
        );

        console.log('Gọi API Kiểm tra:', examApiUrl);
        const examResponse = await axios.get<ExamResultApiResponse>(
          examApiUrl,
          {headers: requestHeaders},
        );

        // Xử lý và lọc dữ liệu bài học
        const filteredLessonItems: ProgressItem[] = [];
        if (lessonResponse.data && Array.isArray(lessonResponse.data)) {
          lessonResponse.data.forEach(item => {
            // Bước 1: Kiểm tra các trường dữ liệu thô từ API không được null
            if (
              item.studyTime !== null &&
              item.completionPercent !== null &&
              item.totalQuestions !== null &&
              item.correctAnswers !== null &&
              item.lessonId !== null && // lessonId cũng cần thiết để làm ID
              item.name !== null // name cần thiết cho title
            ) {
              // Bước 2: Tính toán các giá trị hiển thị
              const calculatedCorrectRatio =
                item.totalQuestions > 0
                  ? `${item.correctAnswers}/${item.totalQuestions}`
                  : undefined;
              const calculatedCompletion = item.completionPercent; // Giá trị này đã được đảm bảo không null
              const calculatedSpeed = formatTimeDisplay(item.studyTime); // formatTimeDisplay trả về undefined nếu studyTime <= 0

              // Bước 3: Lọc item dựa trên 3 thông tin chính đã tính toán
              if (
                calculatedCorrectRatio !== undefined &&
                calculatedCompletion !== undefined && // (completionPercent đã non-null)
                calculatedSpeed !== undefined
              ) {
                filteredLessonItems.push({
                  id: `lesson_${item.lessonId}`,
                  title: item.name,
                  correctRatio: calculatedCorrectRatio,
                  completion: calculatedCompletion,
                  speed: calculatedSpeed,
                  type: 'lesson',
                });
              }
            }
          });
        }
        setLessonProgressItems(filteredLessonItems);

        // Xử lý và lọc dữ liệu kiểm tra
        let finalExamItem: ProgressItem | null = null;
        if (examResponse.data) {
          const examItemApi = examResponse.data;
          // Bước 1: Kiểm tra các trường dữ liệu thô từ API không được null
          if (
            examItemApi.examTime !== null &&
            examItemApi.scorePercent !== null &&
            examItemApi.totalQuestions !== null &&
            examItemApi.correctAnswers !== null
          ) {
            // Bước 2: Tính toán các giá trị hiển thị
            const calculatedCorrectRatio =
              examItemApi.totalQuestions > 0
                ? `${examItemApi.correctAnswers}/${examItemApi.totalQuestions}`
                : undefined;
            const calculatedCompletion = examItemApi.scorePercent; // Giá trị này đã được đảm bảo không null
            const calculatedSpeed = formatTimeDisplay(examItemApi.examTime);

            // Bước 3: Lọc item dựa trên 3 thông tin chính đã tính toán
            if (
              calculatedCorrectRatio !== undefined &&
              calculatedCompletion !== undefined && // (scorePercent đã non-null)
              calculatedSpeed !== undefined
            ) {
              finalExamItem = {
                id: `exam_${topic_code}`,
                title: `Bài kiểm tra: ${topicTitleFromParam}`,
                correctRatio: calculatedCorrectRatio,
                completion: calculatedCompletion,
                speed: calculatedSpeed,
                type: 'test',
              };
            }
          }
        }
        setExamProgressItem(finalExamItem);
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu tiến độ:', err);
        let errorMessage = 'Không thể tải dữ liệu tiến độ. Vui lòng thử lại.';
        if (err.response) {
          console.error('Error Data:', err.response.data);
          console.error('Error Status:', err.response.status);
          errorMessage = `Lỗi ${err.response.status}: ${
            err.response.data?.message ||
            err.response.data?.error ||
            'Lỗi từ server'
          }`;
        } else if (err.request) {
          errorMessage =
            'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.';
        } else {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [topic_code, topicTitleFromParam]);

  const progressItemsToDisplay = useMemo(() => {
    if (activeTab === 'lessons') {
      return lessonProgressItems;
    } else {
      return examProgressItem ? [examProgressItem] : [];
    }
  }, [activeTab, lessonProgressItems, examProgressItem]);

  const renderProgressDetail = (
    iconSource: any,
    label: string,
    value?: string | number,
    unit?: string,
  ) => {
    // Hàm này đã đúng: tự ẩn nếu value là undefined hoặc null
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'number' && isNaN(value))
    )
      return null;
    return (
      <View style={styles.progressDetailRow}>
        <Image source={iconSource} style={styles.progressDetailIcon} />
        <Text style={styles.progressDetailText}>
          {label}:{' '}
          <Text style={styles.progressDetailValue}>
            {value}
            {unit || ''}
          </Text>
        </Text>
      </View>
    );
  };

  const renderItem = ({item}: {item: ProgressItem}) => (
    <View style={styles.progressItemContainer}>
      <Text style={styles.progressItemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.progressDetailsContainer}>
        {renderProgressDetail(
          require('../../assets/images/tiLeDung.png'),
          'Tỷ lệ đúng', // Correct Ratio
          item.correctRatio,
        )}
        {renderProgressDetail(
          require('../../assets/images/TiLeHoanThanh.png'),
          'Hoàn thành', // Completion
          item.completion,
          '%',
        )}
        {renderProgressDetail(
          require('../../assets/images/tocDo.png'),
          'Thời gian', // Speed / Study Time
          item.speed,
        )}
      </View>
    </View>
  );

  // ... (Phần JSX còn lại và styles giữ nguyên như phiên bản trước)
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải tiến độ...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centeredContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Quay lại</Text>
        </TouchableOpacity>
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
                {topicTitleFromParam}
              </Text>
            </View>
            <View style={{width: SIZES.padding * 4}} />
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'lessons' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('lessons')}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'lessons' && styles.tabButtonTextActive,
                ]}>
                Bài học
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'tests' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('tests')}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'tests' && styles.tabButtonTextActive,
                ]}>
                Kiểm tra
              </Text>
            </TouchableOpacity>
          </View>

          {progressItemsToDisplay.length > 0 ? (
            <FlatList
              data={progressItemsToDisplay}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có dữ liệu tiến độ cho mục này.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (Giữ nguyên như phiên bản trước)
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
    marginTop: 15,
    backgroundColor: COLORS.white,
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
    marginBottom: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: SIZES.base,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding * 1.5,
    backgroundColor: 'transparent',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
    height: SIZES.padding * 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SIZES.padding * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.large,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 3,
  },
  progressItemContainer: {
    backgroundColor: COLORS.nenItem,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding,
    marginBottom: SIZES.margin * 1.5,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  progressItemTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.black,
    marginBottom: SIZES.padding,
    fontWeight: 'bold',
  },
  progressDetailsContainer: {
    // không cần style
  },
  progressDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.padding * 0.75,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  progressDetailIcon: {
    width: 22,
    height: 22,
    marginRight: SIZES.padding,
  },
  progressDetailText: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.darkGray,
    flex: 1,
  },
  progressDetailValue: {
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    marginTop: -SIZES.padding * 5,
  },
  emptyText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  errorText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.8,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  errorButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontSize: SIZES.medium,
  },
});

export default TienDoScreen;
