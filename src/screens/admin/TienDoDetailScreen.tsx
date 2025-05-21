// screens/admin/TienDoDetailScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import {COLORS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Định nghĩa kiểu dữ liệu cho API response ---
interface ApiLessonResult {
  id: number | null;
  userId: string;
  lessonId: number;
  name: string;
  total_attempts: number;
  studyTime: number | null;
  completionPercent: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
}

interface ApiExamResult {
  id: number | null;
  userId: string;
  topicId: number;
  total_attempts: number;
  examTime: number | null;
  topicName: string;
  scorePercent: number | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
}

interface ApiOverallStatsSummary {
  accuracyPercent: number | null;
  completionAverage: number | null;
  totalStudyTime: number | null;
  totalSum: number | null;
}
// --- END Định nghĩa kiểu dữ liệu cho API response ---

// --- ICONS ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const STATS_ICON = require('../../assets/images/huyHieu.png');
const LESSON_LIST_ICON = require('../../assets/images/ngoiSao.png');
const TEST_LIST_ICON = require('../../assets/images/ngoiSao.png');
// --- END: ICONS ---

// --- Helper Function ---
const formatTime = (totalSeconds: number | null | undefined): string => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    isNaN(totalSeconds) ||
    totalSeconds < 0
  )
    return '0 giây';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let timeString = '';
  if (hours > 0) timeString += `${hours} giờ `;
  if (minutes > 0) timeString += `${minutes} phút `;
  if (seconds > 0 || (hours === 0 && minutes === 0))
    timeString += `${seconds} giây`;
  return timeString.trim() || '0 giây';
};
// --- END Helper Function ---

// --- MODALS ---
interface LessonProgressDetailModalProps {
  visible: boolean;
  onClose: () => void;
  lessonProgress?: ApiLessonResult | null;
}
const LessonProgressDetailModal: React.FC<LessonProgressDetailModalProps> = ({
  visible,
  onClose,
  lessonProgress,
}) => {
  if (!visible || !lessonProgress) return null;
  const correct = lessonProgress.correctAnswers ?? 0;
  const attempted = lessonProgress.totalQuestions ?? 0;
  const tỷLệCâuĐúng = attempted > 0 ? `${correct}/${attempted}` : 'N/A';
  const phầnTrămHoànThành = `${lessonProgress.completionPercent ?? 0}%`;
  const tốcĐộHoànThành = formatTime(lessonProgress.studyTime);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={detailModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={detailModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={detailModalStyles.modalViewContent}>
            <View style={detailModalStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={detailModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={detailModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={detailModalStyles.headerTitleInModal}>
                {lessonProgress.name || 'Chi tiết bài học'}
              </Text>
              <View
                style={{
                  width: detailModalStyles.backIcon.width,
                }}
              />
            </View>
            <ScrollView contentContainerStyle={detailModalStyles.contentScroll}>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>Tỷ lệ câu đúng</Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>{tỷLệCâuĐúng}</Text>
                </View>
              </View>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Phần trăm hoàn thành
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {phầnTrămHoànThành}
                  </Text>
                </View>
              </View>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Tốc độ hoàn thành
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {tốcĐộHoànThành}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface TestProgressDetailModalProps {
  visible: boolean;
  onClose: () => void;
  testProgress?: ApiExamResult | null;
}
const TestProgressDetailModal: React.FC<TestProgressDetailModalProps> = ({
  visible,
  onClose,
  testProgress,
}) => {
  if (!visible || !testProgress) return null;
  const score = testProgress.correctAnswers ?? 0;
  const totalQuestions = testProgress.totalQuestions ?? 0;
  const tỷLệCâuĐúng = totalQuestions > 0 ? `${score}/${totalQuestions}` : 'N/A';
  const phầnTrămHoànThành = `${testProgress.scorePercent ?? 0}%`;
  const tốcĐộHoànThành = formatTime(testProgress.examTime);
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={detailModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={detailModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={detailModalStyles.modalViewContent}>
            <View style={detailModalStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={detailModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={detailModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={detailModalStyles.headerTitleInModal}>
                {testProgress.topicName || 'Chi tiết kiểm tra'}
              </Text>
              <View
                style={{
                  width: detailModalStyles.backIcon.width,
                }}
              />
            </View>
            <ScrollView contentContainerStyle={detailModalStyles.contentScroll}>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Điểm số (Câu đúng)
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>{tỷLệCâuĐúng}</Text>
                </View>
              </View>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Phần trăm hoàn thành
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {phầnTrămHoànThành}
                  </Text>
                </View>
              </View>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Thời gian làm bài
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {tốcĐộHoànThành}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface OverallStatsModalProps {
  visible: boolean;
  onClose: () => void;
  lessonSummary: ApiOverallStatsSummary | null;
  examSummary: ApiOverallStatsSummary | null;
  username: string;
  isLoading: boolean;
  activeTab: 'lessons' | 'tests'; // Thêm activeTab để biết tab nào đang hoạt động
}
const OverallStatsModal: React.FC<OverallStatsModalProps> = ({
  visible,
  onClose,
  lessonSummary,
  examSummary,
  username,
  isLoading,
  activeTab, // Nhận activeTab
}) => {
  if (!visible) return null;

  const summaryToShow = activeTab === 'lessons' ? lessonSummary : examSummary;
  const sectionTitle = activeTab === 'lessons' ? 'Bài học' : 'Bài kiểm tra';
  const timeLabel = activeTab === 'lessons' ? 'học' : 'kiểm tra';

  // Xác định minHeight dựa trên nội dung sẽ hiển thị (3 mục)
  const modalMinHeight = 290; // Ước tính chiều cao cho header, 3 items và nút đóng

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={detailModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            detailModalStyles.modalViewContainer,
            {height: 'auto', minHeight: modalMinHeight}, // Điều chỉnh minHeight
          ]}
          onPress={() => {}}>
          <View style={detailModalStyles.modalViewContent}>
            <View style={detailModalStyles.header}>
              {/* Spacer để căn giữa tiêu đề khi không có nút back thật sự */}
              <View style={detailModalStyles.headerSpacer} />
              <Text style={detailModalStyles.headerTitleInModal}>
                Thống Kê {sectionTitle}: {username}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[detailModalStyles.backButton, {paddingHorizontal: 5}]}>
                <Text
                  style={{fontSize: 24, color: COLORS.darkGray || '#555555'}}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View
                style={{
                  height: 150, // Giảm chiều cao cho phù hợp
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{marginTop: 10, color: COLORS.darkGray}}>
                  Đang tải thống kê...
                </Text>
              </View>
            ) : summaryToShow ? (
              <ScrollView
                contentContainerStyle={detailModalStyles.contentScroll}>
                <View style={detailModalStyles.infoItem}>
                  <Text style={detailModalStyles.infoLabel}>
                    Tỷ lệ đúng ({sectionTitle}):
                  </Text>
                  <View style={detailModalStyles.infoValueContainer}>
                    <Text style={detailModalStyles.infoValue}>
                      {summaryToShow?.accuracyPercent?.toFixed(2) ?? 'N/A'}%
                    </Text>
                  </View>
                </View>
                <View style={detailModalStyles.infoItem}>
                  <Text style={detailModalStyles.infoLabel}>
                    Tỷ lệ hoàn thành ({sectionTitle}):
                  </Text>
                  <View style={detailModalStyles.infoValueContainer}>
                    <Text style={detailModalStyles.infoValue}>
                      {summaryToShow?.completionAverage?.toFixed(2) ?? 'N/A'}%
                    </Text>
                  </View>
                </View>
                <View style={detailModalStyles.infoItem}>
                  <Text style={detailModalStyles.infoLabel}>
                    Tổng thời gian {timeLabel}:
                  </Text>
                  <View style={detailModalStyles.infoValueContainer}>
                    <Text style={detailModalStyles.infoValue}>
                      {formatTime(summaryToShow?.totalStudyTime)}
                    </Text>
                  </View>
                </View>
                {/* Đã loại bỏ phần "Tổng cộng thời gian" */}
              </ScrollView>
            ) : (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                  height: 150,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.darkGray,
                    textAlign: 'center',
                  }}>
                  Không có dữ liệu thống kê để hiển thị cho{' '}
                  {sectionTitle.toLowerCase()}.
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={detailModalStyles.closeButton}
              onPress={onClose}>
              <Text style={detailModalStyles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
// --- END: MODALS ---

type TienDoDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'TienDoDetail'
>;
type TienDoDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoDetail'
>;

const API_ADMIN_BASE_URL = 'http://10.0.2.2:8080/api/admin/result';

const getAdminTokenFromStorage = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (e) {
    console.error('Lỗi khi lấy token từ AsyncStorage:', e);
    return null;
  }
};

const TienDoDetailScreen = () => {
  const route = useRoute<TienDoDetailScreenRouteProp>();
  const navigation = useNavigation<TienDoDetailScreenNavigationProp>();
  const {logout} = useAuth();

  const userIdFromParam = route.params?.userId;
  const usernameFromParam = route.params?.username;

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');

  const [allLessonResults, setAllLessonResults] = useState<ApiLessonResult[]>(
    [],
  );
  const [allExamResults, setAllExamResults] = useState<ApiExamResult[]>([]);
  const [displayedLessonResults, setDisplayedLessonResults] = useState<
    ApiLessonResult[]
  >([]);
  const [displayedExamResults, setDisplayedExamResults] = useState<
    ApiExamResult[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isLessonDetailModalVisible, setIsLessonDetailModalVisible] =
    useState(false);
  const [selectedLessonDetail, setSelectedLessonDetail] =
    useState<ApiLessonResult | null>(null);
  const [isTestDetailModalVisible, setIsTestDetailModalVisible] =
    useState(false);
  const [selectedTestDetail, setSelectedTestDetail] =
    useState<ApiExamResult | null>(null);

  const [isOverallStatsModalVisible, setIsOverallStatsModalVisible] =
    useState(false);
  const [overallLessonSummary, setOverallLessonSummary] =
    useState<ApiOverallStatsSummary | null>(null);
  const [overallExamSummary, setOverallExamSummary] =
    useState<ApiOverallStatsSummary | null>(null);
  const [isLoadingOverallStats, setIsLoadingOverallStats] = useState(false);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  const filterValidLessonResults = (
    results: ApiLessonResult[],
  ): ApiLessonResult[] => {
    return results.filter(
      item =>
        item.studyTime !== null &&
        item.completionPercent !== null &&
        item.totalQuestions !== null &&
        item.correctAnswers !== null,
    );
  };

  const filterValidExamResults = (
    results: ApiExamResult[],
  ): ApiExamResult[] => {
    return results.filter(
      item =>
        item.examTime !== null &&
        item.scorePercent !== null &&
        item.totalQuestions !== null &&
        item.correctAnswers !== null,
    );
  };

  const fetchLessonProgressInternal = useCallback(
    async (
      userId: string,
      token: string,
      lessonName?: string,
    ): Promise<ApiLessonResult[]> => {
      try {
        const url = lessonName
          ? `${API_ADMIN_BASE_URL}/lesson-result/search?userId=${userId}&lessonName=${encodeURIComponent(
              lessonName,
            )}`
          : `${API_ADMIN_BASE_URL}/lesson-result?userId=${userId}`;
        const response = await axios.get<ApiLessonResult[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });
        return filterValidLessonResults(response.data || []);
      } catch (err) {
        console.error('API Error: Lỗi khi tải/tìm kiếm tiến độ bài học:', err);
        throw err;
      }
    },
    [],
  );

  const fetchExamProgressInternalAPI = useCallback(
    async (
      userId: string,
      token: string,
      topicName?: string,
    ): Promise<ApiExamResult[]> => {
      try {
        const url = topicName
          ? `${API_ADMIN_BASE_URL}/exam-result/search?userId=${userId}&topicName=${encodeURIComponent(
              topicName,
            )}`
          : `${API_ADMIN_BASE_URL}/exam-result?userId=${userId}`;
        const response = await axios.get<ApiExamResult[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });
        return filterValidExamResults(response.data || []);
      } catch (err) {
        console.error(
          'API Error: Lỗi khi tải/tìm kiếm tiến độ bài kiểm tra:',
          err,
        );
        throw err;
      }
    },
    [],
  );

  const loadAllProgressDataForUser = useCallback(
    async (currentUserId: string) => {
      if (!currentUserId) {
        Alert.alert('Lỗi', 'Không có User ID để tải dữ liệu.');
        setError('Không có User ID để tải dữ liệu.');
        return;
      }
      setIsLoading(true);
      setError(null);
      const token = await getAdminTokenFromStorage();
      if (!token) {
        Alert.alert('Lỗi', 'Không thể lấy token xác thực. Vui lòng thử lại.');
        setError('Lỗi xác thực. Không thể tải dữ liệu.');
        setIsLoading(false);
        return;
      }

      try {
        const [lessons, exams] = await Promise.all([
          fetchLessonProgressInternal(currentUserId, token),
          fetchExamProgressInternalAPI(currentUserId, token),
        ]);

        setAllLessonResults(lessons);
        setDisplayedLessonResults(lessons);
        setAllExamResults(exams);
        setDisplayedExamResults(exams);
      } catch (err) {
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'Đã xảy ra lỗi khi tải dữ liệu tiến độ.';
        setError(errorMessage);
        Alert.alert('Lỗi tải dữ liệu', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchLessonProgressInternal, fetchExamProgressInternalAPI],
  );

  useEffect(() => {
    if (userIdFromParam) {
      loadAllProgressDataForUser(userIdFromParam);
    }
  }, [userIdFromParam, loadAllProgressDataForUser]);

  useEffect(() => {
    if (!userIdFromParam) return;
    const lowerCaseQuery = searchQuery.toLowerCase().trim();

    const applyFiltersAndSearch = async () => {
      const token = await getAdminTokenFromStorage();
      if (!token && lowerCaseQuery !== '') {
        // Chỉ kiểm tra token nếu có query
        Alert.alert('Lỗi', 'Lỗi xác thực khi tìm kiếm.');
        return;
      }

      if (activeTab === 'lessons') {
        if (lowerCaseQuery === '') {
          setDisplayedLessonResults(allLessonResults);
        } else {
          if (!token) {
            // Cần token để search API
            Alert.alert('Lỗi', 'Lỗi xác thực khi tìm kiếm bài học.');
            return;
          }
          setIsLoading(true);
          try {
            const searchResults = await fetchLessonProgressInternal(
              userIdFromParam,
              token, // Đã kiểm tra token ở trên
              lowerCaseQuery,
            );
            setDisplayedLessonResults(searchResults);
          } catch (searchError) {
            Alert.alert(
              'Lỗi tìm kiếm',
              'Không thể thực hiện tìm kiếm bài học.',
            );
            setDisplayedLessonResults(allLessonResults); // Fallback to all results
          } finally {
            setIsLoading(false);
          }
        }
      } else {
        // activeTab === 'tests'
        if (lowerCaseQuery === '') {
          setDisplayedExamResults(allExamResults);
        } else {
          if (!token) {
            // Cần token để search API
            Alert.alert('Lỗi', 'Lỗi xác thực khi tìm kiếm bài kiểm tra.');
            setIsLoading(false);
            return;
          }
          setIsLoading(true);
          try {
            const searchResults = await fetchExamProgressInternalAPI(
              userIdFromParam,
              token, // Đã kiểm tra token ở trên
              lowerCaseQuery,
            );
            setDisplayedExamResults(searchResults);
          } catch (searchError) {
            Alert.alert(
              'Lỗi tìm kiếm',
              'Không thể thực hiện tìm kiếm bài kiểm tra.',
            );
            setDisplayedExamResults(allExamResults); // Fallback to all results
          } finally {
            setIsLoading(false);
          }
        }
      }
    };
    applyFiltersAndSearch();
  }, [
    searchQuery,
    activeTab,
    userIdFromParam,
    allLessonResults,
    allExamResults,
    fetchLessonProgressInternal,
    fetchExamProgressInternalAPI,
  ]);

  const handleOpenLessonDetail = (item: ApiLessonResult) => {
    setSelectedLessonDetail(item);
    setIsLessonDetailModalVisible(true);
  };

  const handleOpenTestDetail = (item: ApiExamResult) => {
    setSelectedTestDetail(item);
    setIsTestDetailModalVisible(true);
  };

  const handleOpenOverallStats = useCallback(async () => {
    if (!userIdFromParam) return;
    setIsLoadingOverallStats(true);
    setIsOverallStatsModalVisible(true);
    // Reset cả hai summary trước khi fetch để đảm bảo modal không hiển thị dữ liệu cũ nếu API fail 1 cái
    setOverallLessonSummary(null);
    setOverallExamSummary(null);

    const token = await getAdminTokenFromStorage();
    if (!token) {
      Alert.alert('Lỗi', 'Không thể lấy token để tải thống kê.');
      setIsLoadingOverallStats(false);
      return;
    }
    try {
      // Vẫn fetch cả hai, modal sẽ quyết định hiển thị cái nào
      const lessonSummaryUrl = `${API_ADMIN_BASE_URL}/lesson/summary/${userIdFromParam}`;
      const examSummaryUrl = `${API_ADMIN_BASE_URL}/exam-result/summary/${userIdFromParam}`;

      const [lessonSummaryRes, examSummaryRes] = await Promise.all([
        axios.get<ApiOverallStatsSummary>(lessonSummaryUrl, {
          headers: {Authorization: `Bearer ${token}`},
        }),
        axios.get<ApiOverallStatsSummary>(examSummaryUrl, {
          headers: {Authorization: `Bearer ${token}`},
        }),
      ]);

      setOverallLessonSummary(lessonSummaryRes.data);
      setOverallExamSummary(examSummaryRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thống kê tổng quan:', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê.');
      // Nếu lỗi, đảm bảo cả hai summary đều null
      setOverallLessonSummary(null);
      setOverallExamSummary(null);
    } finally {
      setIsLoadingOverallStats(false);
    }
  }, [userIdFromParam]); // activeTab không cần là dependency ở đây vì logic fetch không đổi

  const handleLogoutFromMenu = useCallback(async () => {
    setIsProfileMenuVisible(false);
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout]);

  const renderListItem = ({item}: {item: ApiLessonResult | ApiExamResult}) => {
    const isLesson = 'lessonId' in item;
    const name = isLesson
      ? (item as ApiLessonResult).name
      : (item as ApiExamResult).topicName;
    const icon = isLesson ? LESSON_LIST_ICON : TEST_LIST_ICON;
    return (
      <TouchableOpacity
        style={mainStyles.listItem}
        onPress={() =>
          isLesson
            ? handleOpenLessonDetail(item as ApiLessonResult)
            : handleOpenTestDetail(item as ApiExamResult)
        }>
        <Image source={icon} style={mainStyles.itemIcon} />
        <View style={mainStyles.itemTextContainer}>
          <Text style={mainStyles.itemNameText} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (
    isLoading &&
    allLessonResults.length === 0 &&
    allExamResults.length === 0
  ) {
    return (
      <SafeAreaView
        style={[
          mainStyles.safeArea,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, fontSize: 16, color: COLORS.darkGray}}>
          Đang tải dữ liệu...
        </Text>
      </SafeAreaView>
    );
  }
  if (
    error &&
    !isLoading &&
    allLessonResults.length === 0 &&
    allExamResults.length === 0
  ) {
    return (
      <SafeAreaView
        style={[
          mainStyles.safeArea,
          {
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          },
        ]}>
        <Text style={{fontSize: 16, color: COLORS.error, textAlign: 'center'}}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (userIdFromParam) loadAllProgressDataForUser(userIdFromParam);
          }}
          style={{
            marginTop: 20,
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: COLORS.primary,
            borderRadius: 5,
          }}>
          <Text style={{color: COLORS.white, fontWeight: 'bold'}}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={mainStyles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.primary}
      />
      <View style={mainStyles.mainHeader}>
        <TouchableOpacity style={mainStyles.headerButton}>
          <Image
            source={LOGO_ICON}
            style={mainStyles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={mainStyles.mainHeaderTitle}>JaVis</Text>
        <TouchableOpacity
          style={mainStyles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON}
            style={mainStyles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={mainStyles.subHeader}>
        <TouchableOpacity
          style={mainStyles.backButtonSubHeader}
          onPress={() => navigation.goBack()}>
          <Image
            source={BACK_ARROW_ICON}
            style={mainStyles.backIconSubHeader}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={mainStyles.screenTitleStyle}>{`Tiến Độ: ${
          usernameFromParam || 'Người dùng'
        }`}</Text>
        <View
          style={{
            width:
              mainStyles.backIconSubHeader.width +
              (mainStyles.backButtonSubHeader.paddingHorizontal || 5) * 2,
          }}
        />
      </View>

      <View style={mainStyles.tabsContainer}>
        <TouchableOpacity
          style={[
            mainStyles.tabButton,
            activeTab === 'lessons' && mainStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('lessons')}>
          <Text
            style={[
              mainStyles.tabText,
              activeTab === 'lessons' && mainStyles.tabTextActive,
            ]}>
            Bài học
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            mainStyles.tabButton,
            activeTab === 'tests' && mainStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('tests')}>
          <Text
            style={[
              mainStyles.tabText,
              activeTab === 'tests' && mainStyles.tabTextActive,
            ]}>
            Kiểm tra
          </Text>
        </TouchableOpacity>
      </View>

      <View style={mainStyles.searchAndFilterContainer}>
        <View style={mainStyles.searchBar}>
          <Image
            source={SEARCH_ICON}
            style={mainStyles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={mainStyles.searchInput}
            placeholder={`Tìm ${
              activeTab === 'lessons' ? 'bài học' : 'bài kiểm tra'
            }...`}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={mainStyles.statsButton}
          onPress={handleOpenOverallStats}>
          <Image
            source={STATS_ICON}
            style={mainStyles.statsIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {isLoading &&
        (displayedLessonResults.length > 0 ||
          displayedExamResults.length > 0) && ( // Chỉ hiện loading nhỏ khi đã có list data
          <View style={{paddingVertical: 10, alignItems: 'center'}}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

      <FlatList
        data={
          activeTab === 'lessons'
            ? displayedLessonResults
            : displayedExamResults
        }
        renderItem={renderListItem}
        keyExtractor={item =>
          'lessonId' in item
            ? `lesson-${(item as ApiLessonResult).lessonId}-${
                item.id || Math.random().toString() // Thêm fallback key
              }`
            : `exam-${(item as ApiExamResult).topicId}-${
                item.id || Math.random().toString() // Thêm fallback key
              }`
        }
        style={mainStyles.listContainer}
        contentContainerStyle={mainStyles.listContentContainer}
        ListEmptyComponent={
          !isLoading ? ( // Chỉ hiện empty text khi không loading
            <View style={mainStyles.emptyListContainer}>
              <Text style={mainStyles.emptyListText}>
                {searchQuery
                  ? `Không tìm thấy kết quả cho "${searchQuery}".`
                  : `Không có dữ liệu ${
                      activeTab === 'lessons' ? 'bài học' : 'kiểm tra'
                    } để hiển thị.`}
              </Text>
            </View>
          ) : null
        }
      />

      <LessonProgressDetailModal
        visible={isLessonDetailModalVisible}
        onClose={() => setIsLessonDetailModalVisible(false)}
        lessonProgress={selectedLessonDetail}
      />
      <TestProgressDetailModal
        visible={isTestDetailModalVisible}
        onClose={() => setIsTestDetailModalVisible(false)}
        testProgress={selectedTestDetail}
      />
      <OverallStatsModal
        visible={isOverallStatsModalVisible}
        onClose={() => {
          setIsOverallStatsModalVisible(false);
          // Reset cả hai summary khi đóng để đảm bảo sạch sẽ cho lần mở tiếp theo
          setOverallLessonSummary(null);
          setOverallExamSummary(null);
        }}
        lessonSummary={overallLessonSummary}
        examSummary={overallExamSummary}
        username={usernameFromParam || ''}
        isLoading={isLoadingOverallStats}
        activeTab={activeTab} // Truyền activeTab vào đây
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isProfileMenuVisible}
        onRequestClose={() => setIsProfileMenuVisible(false)}>
        <Pressable
          style={profileMenuStyles.backdrop}
          onPress={() => setIsProfileMenuVisible(false)}>
          <View style={profileMenuStyles.menuContainer}>
            <TouchableOpacity
              style={profileMenuStyles.menuItem}
              onPress={handleLogoutFromMenu}>
              <Image
                source={require('../../assets/images/logout.png')}
                style={profileMenuStyles.menuIcon}
              />
              <Text style={profileMenuStyles.menuText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// --- STYLES (GIỮ NGUYÊN) ---
const detailModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalViewContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalViewContent: {
    borderRadius: 12,
    paddingBottom: 20,
    overflow: 'hidden', // Đảm bảo content không tràn ra ngoài borderRadius
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Để spacer hoạt động đúng
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#EEEEEE',
  },
  backButton: {
    padding: 5,
    // Không cần paddingHorizontal cố định ở đây nếu dùng spacer
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  headerTitleInModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'center',
    flex: 1, // Để tiêu đề chiếm không gian còn lại và tự căn giữa
  },
  headerSpacer: {
    // Dùng để căn giữa tiêu đề khi có nút đóng ở một bên
    width: 22 + 5 * 2, // Chiều rộng của icon + padding của nút đóng
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10, // Giảm padding bottom nếu cần thêm không gian cho nút Đóng
  },
  infoItem: {
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.darkGray || '#555555',
    fontWeight: '500',
    marginBottom: 8,
  },
  infoValueContainer: {
    width: '100%',
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center', // Căn giữa text bên trong nếu cần
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.black || '#000000',
    textAlign: 'left',
  },
  closeButton: {
    backgroundColor: COLORS.primary || '#FFBF00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15, // Đảm bảo có khoảng cách với content
  },
  closeButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySectionTitle: {
    // Giữ lại style này nếu bạn muốn dùng lại ở đâu đó, dù hiện tại không dùng trong OverallStatsModal
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text || COLORS.black,
    marginBottom: 10,
    marginTop: 10,
  },
});

const mainStyles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background || '#FFFFFF'},
  mainHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingBottom: 10,
    height:
      Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 90,
  },
  headerButton: {padding: 5},
  headerIconMain: {width: 30, height: 30},
  mainHeaderTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  backButtonSubHeader: {padding: 5, paddingHorizontal: 5},
  backIconSubHeader: {
    width: 20,
    height: 20,
  },
  screenTitleStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2 || '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {flex: 1, fontSize: 15, color: COLORS.black, paddingVertical: 0},
  statsButton: {
    padding: 0,
    marginLeft: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  statsIcon: {width: 28, height: 28},
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray || '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
    height: 45,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.nenItemDam || '#E0E0E0',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.darkGray || '#A0A0A0',
    fontWeight: '500',
  },
  tabTextActive: {color: COLORS.black || '#000000', fontWeight: 'bold'},
  listContainer: {flex: 1, backgroundColor: COLORS.background || '#F5F5F5'},
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 5,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  itemTextContainer: {flex: 1},
  itemNameText: {
    fontSize: 16,
    color: COLORS.black || '#333333',
    fontWeight: '500',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {fontSize: 16, color: COLORS.darkGray, textAlign: 'center'},
});

const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 50 : 85,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {width: 20, height: 20, marginRight: 12},
  menuText: {fontSize: 16, color: '#333'},
});
// --- END: STYLES ---

export default TienDoDetailScreen;
