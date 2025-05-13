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
import {COLORS} from '../../constants/theme'; // CẬP NHẬT ĐƯỜNG DẪN
import {useAuth} from '../auth/AuthContext'; // CẬP NHẬT ĐƯỜNG DẪN
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation'; // CẬP NHẬT ĐƯỜNG DẪN

// --- BEGIN: TYPES (GIỮ NGUYÊN NHƯ TRONG FILE CỦA BẠN) ---
type User = {
  user_id: string;
  oauth_subject_id: string;
  profile_picture_url: string;
  username: string;
  email: string;
  user_password?: string;
  level_id?: number;
};

type Lesson = {
  lesson_code: number;
  lesson_name: string;
  lesson_description: string;
  quantity_content: number;
  day_creation: string;
  topic_code: number;
  status: string;
  lesson_type: string;
};

type TestItem = {
  test_id: string;
  test_name: string;
  topic_code: number;
  question_count: number;
};

type TopicInfo = {
  topic_code: number;
  topic_name: string;
  level_name: string;
};

type UserLessonProgress = {
  user_id: string;
  lesson_code: number;
  correct_answers: number;
  total_questions_attempted: number;
  completion_percentage: number;
  time_spent_seconds: number;
};

type UserTestProgress = {
  user_id: string;
  test_id: string;
  score: number;
  completion_percentage: number;
  time_spent_seconds: number;
};

type DisplayLessonProgress = Lesson & Partial<UserLessonProgress>;
type DisplayTestProgress = TestItem & Partial<UserTestProgress>;
// --- END: TYPES ---

// --- BEGIN: DỮ LIỆU MẪU (GIỮ NGUYÊN) ---
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
    lesson_name: 'Lý thuyết Hiragana',
    lesson_description: 'Học bảng chữ cái Hiragana...',
    quantity_content: 5,
    day_creation: '2025-05-10 08:10:00',
    topic_code: 101,
    status: 'completed',
    lesson_type: 'hira',
  },
  {
    lesson_code: 14,
    lesson_name: 'Lý thuyết Hiragana Topic 102',
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
const initialUsersData: User[] = [
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    oauth_subject_id: 'oauth_001',
    profile_picture_url: 'https://i.pravatar.cc/150?u=alice',
    username: 'alice',
    email: 'alice@example.com',
    level_id: 1,
  },
  {
    user_id: 'a8cc7b9f-9024-4e70-b199-e390847c8201',
    oauth_subject_id: 'oauth_002',
    profile_picture_url: 'https://i.pravatar.cc/150?u=bob',
    username: 'bob',
    email: 'bob@example.com',
    level_id: 2,
  },
];
const allTopicsData: TopicInfo[] = [
  {
    topic_code: 101,
    topic_name: 'Bảng chữ cái và Phát âm',
    level_name: 'N5 Sơ Cấp',
  },
  {
    topic_code: 102,
    topic_name: 'Chào hỏi và Giới thiệu',
    level_name: 'N5 Sơ Cấp',
  },
  {topic_code: 103, topic_name: 'Từ vựng Gia Đình', level_name: 'N4 Trung Cấp'},
];
const allUserLessonProgressData: UserLessonProgress[] = [
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    lesson_code: 1,
    correct_answers: 12,
    total_questions_attempted: 15,
    completion_percentage: 73,
    time_spent_seconds: 1 * 60 + 52,
  },
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    lesson_code: 2,
    correct_answers: 25,
    total_questions_attempted: 25,
    completion_percentage: 100,
    time_spent_seconds: 1500,
  },
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    lesson_code: 12,
    correct_answers: 3,
    total_questions_attempted: 3,
    completion_percentage: 100,
    time_spent_seconds: 300,
  },
  {
    user_id: 'a8cc7b9f-9024-4e70-b199-e390847c8201',
    lesson_code: 1,
    correct_answers: 10,
    total_questions_attempted: 15,
    completion_percentage: 60,
    time_spent_seconds: 1200,
  },
];
const allTestData: TestItem[] = [
  {
    test_id: 'test_hira_101',
    test_name: 'Kiểm tra Hiragana (TC101)',
    topic_code: 101,
    question_count: 20,
  },
  {
    test_id: 'test_kata_101',
    test_name: 'Kiểm tra Katakana (TC101)',
    topic_code: 101,
    question_count: 15,
  },
  {
    test_id: 'test_chaohoi_102',
    test_name: 'Kiểm tra Chào hỏi (TC102)',
    topic_code: 102,
    question_count: 10,
  },
];
const allUserTestProgressData: UserTestProgress[] = [
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    test_id: 'test_hira_101',
    score: 18,
    completion_percentage: 90,
    time_spent_seconds: 980,
  },
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    test_id: 'test_chaohoi_102',
    score: 7,
    completion_percentage: 70,
    time_spent_seconds: 450,
  },
  {
    user_id: 'a8cc7b9f-9024-4e70-b199-e390847c8201',
    test_id: 'test_hira_101',
    score: 15,
    completion_percentage: 75,
    time_spent_seconds: 1100,
  },
];
// --- END: DỮ LIỆU MẪU ---

// --- BEGIN: ICONS (GIỮ NGUYÊN) ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const STATS_ICON = require('../../assets/images/huyHieu.png');
const LESSON_LIST_ICON = require('../../assets/images/ngoiSao.png');
const TEST_LIST_ICON = require('../../assets/images/ngoiSao.png');
// --- END: ICONS ---

// --- Helper Function (GIỮ NGUYÊN) ---
const formatTime = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0 giây';
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

// --- BEGIN: CẬP NHẬT MODALS ---
interface LessonProgressDetailModalProps {
  visible: boolean;
  onClose: () => void;
  lessonProgress?: DisplayLessonProgress | null;
}
const LessonProgressDetailModal: React.FC<LessonProgressDetailModalProps> = ({
  visible,
  onClose,
  lessonProgress,
}) => {
  if (!visible || !lessonProgress) return null;

  const correct = lessonProgress.correct_answers ?? 0;
  const attempted =
    lessonProgress.total_questions_attempted ??
    lessonProgress.quantity_content ??
    0;
  const tỷLệCâuĐúng = attempted > 0 ? `${correct}/${attempted}` : 'N/A';
  const phầnTrămHoànThành = `${lessonProgress.completion_percentage ?? 0}%`;
  const tốcĐộHoànThành = formatTime(lessonProgress.time_spent_seconds ?? 0);

  return (
    <Modal
      animationType="fade" // Đổi thành fade để giống fullManHinhKhiCoThognBaso.png
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={detailModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={detailModalStyles.modalViewContainer}
          onPress={() => {}} /* Ngăn press xuyên qua modal content */
        >
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
            </View>

            <ScrollView contentContainerStyle={detailModalStyles.contentScroll}>
              <Text style={detailModalStyles.headerTitle}>
                Tổng kết bài học
              </Text>

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
  testProgress?: DisplayTestProgress | null;
}
const TestProgressDetailModal: React.FC<TestProgressDetailModalProps> = ({
  visible,
  onClose,
  testProgress,
}) => {
  if (!visible || !testProgress) return null;

  const score = testProgress.score ?? 0;
  const totalQuestions = testProgress.question_count ?? 0;
  const tỷLệCâuĐúng = totalQuestions > 0 ? `${score}/${totalQuestions}` : 'N/A';
  const phầnTrămHoànThành = `${testProgress.completion_percentage ?? 0}%`;
  const tốcĐộHoànThành = formatTime(testProgress.time_spent_seconds ?? 0);
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

              <Text style={detailModalStyles.headerTitle}>
                Tổng kết kiểm tra
              </Text>
              <View style={detailModalStyles.headerSpacer} />
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

// OverallStatsModal (GIỮ NGUYÊN NHƯ TRONG FILE CỦA BẠN)
interface OverallStatsModalProps {
  visible: boolean;
  onClose: () => void;
  totalLessonTime: number;
  totalTestTime: number;
  username: string;
}
const OverallStatsModal: React.FC<OverallStatsModalProps> = ({
  visible,
  onClose,
  totalLessonTime,
  totalTestTime,
  username,
}) => {
  if (!visible) return null;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={detailModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[detailModalStyles.modalViewContainer, {height: 'auto'}]}
          onPress={() => {}}>
          <View style={detailModalStyles.modalViewContent}>
            <View style={detailModalStyles.header}>
              <View style={detailModalStyles.headerSpacer} />

              <Text style={detailModalStyles.headerTitle}>
                Thống Kê: {username}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={[
                  detailModalStyles.backButton,
                  {transform: [{translateX: 0}]},
                ]} /* Adjusted transform */
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: COLORS.darkGray || '#555555',
                  }}></Text>
              </TouchableOpacity>
            </View>

            <View style={detailModalStyles.contentScroll}>
              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Tổng thời gian học:
                </Text>

                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {formatTime(totalLessonTime)}
                  </Text>
                </View>
              </View>

              <View style={detailModalStyles.infoItem}>
                <Text style={detailModalStyles.infoLabel}>
                  Tổng thời gian kiểm tra:
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text style={detailModalStyles.infoValue}>
                    {formatTime(totalTestTime)}
                  </Text>
                </View>
              </View>

              <View style={detailModalStyles.infoItem}>
                <Text
                  style={[detailModalStyles.infoLabel, {fontWeight: 'bold'}]}>
                  Tổng cộng:
                </Text>
                <View style={detailModalStyles.infoValueContainer}>
                  <Text
                    style={[detailModalStyles.infoValue, {fontWeight: 'bold'}]}>
                    {formatTime(totalLessonTime + totalTestTime)}
                  </Text>
                </View>
              </View>
            </View>

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

const detailModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalViewContainer: {
    width: '90%', // Có thể chỉnh '85%' hoặc '90%' tùy độ rộng mong muốn
    maxHeight: '85%', // Giới hạn chiều cao tối đa
    backgroundColor: COLORS.white || '#FFFFFF', // Nền trắng cho modal
    borderRadius: 12, // Bo góc cho modal
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalViewContent: {
    // Không cần backgroundColor riêng nếu modalViewContainer đã có
    borderRadius: 12, // Đảm bảo bo tròn nội dung bên trong
    paddingBottom: 20, // Padding dưới cho nút "Đóng"
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 1,
    paddingHorizontal: 15,
    marginTop: 10,

    borderBottomColor: COLORS.lightGray || '#EEEEEE',
  },
  backButton: {
    padding: 5, // Vùng chạm cho nút back
  },
  backIcon: {
    width: 22, // Kích thước icon
    height: 22,
    tintColor: COLORS.black || '#000000', // Màu icon
  },
  headerTitle: {
    fontSize: 17, // Cỡ chữ tiêu đề
    fontWeight: '600', // Độ đậm tiêu đề (semi-bold)
    color: COLORS.black || '#000000',
    textAlign: 'left',
    flex: 1, // Để tiêu đề chiếm không gian và căn giữa
    marginBottom: 10,
  },
  headerSpacer: {
    // Dùng để căn giữa tiêu đề khi có nút back
    width: 22 + 5 * 2, // Bằng kích thước icon + padding của backButton
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 20, // Padding trên cho nội dung
    paddingBottom: 10, // Padding dưới trước nút Đóng
  },
  infoItem: {
    // Mỗi mục thông tin (label + value box)
    marginBottom: 18, // Khoảng cách giữa các mục
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.darkGray || '#555555', // Màu chữ label
    fontWeight: '500', // Độ đậm label
    marginBottom: 8, // Khoảng cách từ label đến value box
  },
  infoValueContainer: {
    width: '100%',
    backgroundColor: COLORS.white || '#FFFFFF', // Nền của value box
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#E0E0E0', // Viền của value box
    borderRadius: 6, // Bo góc value box
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center', // Căn giữa text bên trong nếu chỉ có 1 dòng
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.black || '#000000', // Màu chữ value
    textAlign: 'left', // Giá trị căn trái
  },
  closeButton: {
    backgroundColor: COLORS.primary || '#FFBF00', // Màu nút Đóng
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15, // Khoảng cách từ content đến nút Đóng
  },
  closeButtonText: {
    color: COLORS.white || '#FFFFFF', // Màu chữ nút Đóng
    fontSize: 16,
    fontWeight: '600', // Độ đậm chữ nút Đóng
  },
});
// --- END: CẬP NHẬT MODALS ---

// --- BEGIN: Component TienDoDetailScreen (PHẦN CÒN LẠI GIỮ NGUYÊN) ---
type TienDoDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'TienDoDetail'
>;
type TienDoDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoDetail'
>;

const TienDoDetailScreen = () => {
  const route = useRoute<TienDoDetailScreenRouteProp>();
  const navigation = useNavigation<TienDoDetailScreenNavigationProp>();
  const {logout} = useAuth();

  const {userId, username} = route.params;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');

  const [lessonsWithProgress, setLessonsWithProgress] = useState<
    DisplayLessonProgress[]
  >([]);
  const [testsWithProgress, setTestsWithProgress] = useState<
    DisplayTestProgress[]
  >([]);

  const [filteredLessons, setFilteredLessons] = useState<
    DisplayLessonProgress[]
  >([]);
  const [filteredTests, setFilteredTests] = useState<DisplayTestProgress[]>([]);

  const [isLessonDetailModalVisible, setIsLessonDetailModalVisible] =
    useState(false);
  const [selectedLessonDetail, setSelectedLessonDetail] =
    useState<DisplayLessonProgress | null>(null); // const [selectedLessonTopicInfo, setSelectedLessonTopicInfo] = useState<TopicInfo | null>(null);
  // Bỏ selectedLessonTopicInfo nếu không dùng trong modal nữa
  const [isTestDetailModalVisible, setIsTestDetailModalVisible] =
    useState(false);
  const [selectedTestDetail, setSelectedTestDetail] =
    useState<DisplayTestProgress | null>(null); // const [selectedTestTopicInfo, setSelectedTestTopicInfo] = useState<TopicInfo | null>(null);
  // Bỏ selectedTestTopicInfo nếu không dùng trong modal nữa
  const [isOverallStatsModalVisible, setIsOverallStatsModalVisible] =
    useState(false);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  useEffect(() => {
    const user = initialUsersData.find(u => u.user_id === userId);
    setCurrentUser(user || null);

    const lessonsProg = allLessonsData.map(lesson => {
      const progress = allUserLessonProgressData.find(
        p => p.user_id === userId && p.lesson_code === lesson.lesson_code,
      );
      return {...lesson, ...progress};
    });
    setLessonsWithProgress(lessonsProg);
    setFilteredLessons(lessonsProg);

    const testsProg = allTestData.map(test => {
      const progress = allUserTestProgressData.find(
        p => p.user_id === userId && p.test_id === test.test_id,
      );
      return {...test, ...progress};
    });
    setTestsWithProgress(testsProg);
    setFilteredTests(testsProg);
  }, [userId]);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (activeTab === 'lessons') {
      if (lowerCaseQuery === '') {
        setFilteredLessons(lessonsWithProgress);
      } else {
        setFilteredLessons(
          lessonsWithProgress.filter(lp =>
            lp.lesson_name.toLowerCase().includes(lowerCaseQuery),
          ),
        );
      }
    } else {
      if (lowerCaseQuery === '') {
        setFilteredTests(testsWithProgress);
      } else {
        setFilteredTests(
          testsWithProgress.filter(tp =>
            tp.test_name.toLowerCase().includes(lowerCaseQuery),
          ),
        );
      }
    }
  }, [searchQuery, lessonsWithProgress, testsWithProgress, activeTab]);

  const handleOpenLessonDetail = (item: DisplayLessonProgress) => {
    setSelectedLessonDetail(item);
    // const topic = allTopicsData.find(t => t.topic_code === item.topic_code); // Không cần nếu không dùng
    // setSelectedLessonTopicInfo(topic || null);
    setIsLessonDetailModalVisible(true);
  };

  const handleOpenTestDetail = (item: DisplayTestProgress) => {
    setSelectedTestDetail(item);
    // const topic = allTopicsData.find(t => t.topic_code === item.topic_code); // Không cần nếu không dùng
    // setSelectedTestTopicInfo(topic || null);
    setIsTestDetailModalVisible(true);
  };

  const handleOpenOverallStats = () => {
    setIsOverallStatsModalVisible(true);
  };

  const totalLessonTime = lessonsWithProgress.reduce(
    (sum, item) => sum + (item.time_spent_seconds || 0),
    0,
  );
  const totalTestTime = testsWithProgress.reduce(
    (sum, item) => sum + (item.time_spent_seconds || 0),
    0,
  );

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

  const renderListItem = ({
    item,
  }: {
    item: DisplayLessonProgress | DisplayTestProgress;
  }) => {
    const isLesson = 'lesson_code' in item;
    const name = isLesson
      ? (item as DisplayLessonProgress).lesson_name
      : (item as DisplayTestProgress).test_name;
    // Bỏ phần hiển thị % hoàn thành và progress bar khỏi list item nếu không có trong ảnh
    //   const completion = item.completion_percentage ?? 0;
    const icon = isLesson ? LESSON_LIST_ICON : TEST_LIST_ICON;

    return (
      <TouchableOpacity
        style={mainStyles.listItem}
        onPress={() =>
          isLesson
            ? handleOpenLessonDetail(item as DisplayLessonProgress)
            : handleOpenTestDetail(item as DisplayTestProgress)
        }>
        <Image source={icon} style={mainStyles.itemIcon} />
        <View style={mainStyles.itemTextContainer}>
          <Text style={mainStyles.itemNameText} numberOfLines={1}>
            {name}
          </Text>
          {/* Bỏ itemDetailText và progressBarContainer nếu không cần */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={mainStyles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.primary}
      />
      <View style={mainStyles.mainHeader}>
        <TouchableOpacity
          style={mainStyles.headerButton}
          onPress={() => console.log('Logo pressed')}>
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
        {/* Screen title bị ẩn đi trong ảnh fullManHinhKhiCoThognBaso.png khi modal hiển thị, 
            nhưng nó thuộc subHeader, không phải modal nên giữ nguyên logic hiển thị */}

        <View
          style={{
            width:
              mainStyles.backIconSubHeader.width +
              (mainStyles.backButtonSubHeader.padding ||
                mainStyles.backButtonSubHeader.padding ||
                0) *
                2,
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
      <FlatList
        data={activeTab === 'lessons' ? filteredLessons : filteredTests}
        renderItem={renderListItem}
        keyExtractor={item =>
          'lesson_code' in item
            ? `lesson-${(item as Lesson).lesson_code}`
            : `test-${(item as TestItem).test_id}`
        }
        style={mainStyles.listContainer}
        contentContainerStyle={mainStyles.listContentContainer}
        ListEmptyComponent={
          <View style={mainStyles.emptyListContainer}>
            <Text style={mainStyles.emptyListText}>
              Không có dữ liệu tiến độ.
            </Text>
          </View>
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
        onClose={() => setIsOverallStatsModalVisible(false)}
        totalLessonTime={totalLessonTime}
        totalTestTime={totalTestTime}
        username={username || currentUser?.username || ''}
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
            {/* Nội dung Profile Menu Modal (ví dụ: nút Đăng xuất) có thể thêm ở đây */}
            <TouchableOpacity
              style={profileMenuStyles.menuItem}
              onPress={handleLogoutFromMenu}>
              <Image
                source={require('../../assets/images/logout.png')}
                /* Thay thế bằng LOGOUT_ICON nếu đã define */ style={
                  profileMenuStyles.menuIcon
                }
              />
              <Text style={profileMenuStyles.menuText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component TienDoDetailScreen ---

// --- BEGIN: STYLES (mainStyles và profileMenuStyles giữ nguyên như bạn đã cung cấp) ---
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
  headerIconMain: {width: 30, height: 30}, // Thêm tintColor nếu cần
  mainHeaderTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Để căn đều title và spacer
    paddingHorizontal: 15,
    paddingVertical: 10, // Giảm paddingVertical nếu cần
    backgroundColor: COLORS.white, // borderBottomWidth: 1, // Bỏ border nếu không có trong ảnh // borderBottomColor: COLORS.lightGray || '#ECECEC',
  },
  backButtonSubHeader: {padding: 5 /* marginRight: 10, */}, // Bỏ marginRight nếu dùng spacer
  backIconSubHeader: {
    width: 20,
    height: 20,
    tintColor: COLORS.black || '#333333',
  },
  screenTitleStyle: {
    // flex: 1, // Bỏ flex:1 để title không chiếm hết không gian nếu không cần
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'center', // Căn giữa nếu muốn
    marginHorizontal: 10, // Thêm margin nếu cần để không sát nút back/spacer
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15, // Thay đổi từ 10 thành 15
    paddingVertical: 10, // Thay đổi từ 1 thành 10
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2 || '#f0f0f0',
    borderRadius: 20, // Giữ nguyên bo tròn
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: COLORS.darkGray,
  },
  searchInput: {flex: 1, fontSize: 15, color: COLORS.black, paddingVertical: 0},
  statsButton: {
    padding: 0, // Bỏ padding mặc định của TouchableOpacity
    marginLeft: 10,
    // backgroundColor: COLORS.lightGray2, // Bỏ nền nếu icon đã đủ rõ
    borderRadius: 20, // Giữ bo tròn cho vùng chạm
    justifyContent: 'center',
    alignItems: 'center',
    width: 40, // Set width height cho nút bấm
    height: 40,
  },
  statsIcon: {width: 28, height: 28 /* tintColor: COLORS.primary */}, // Kích thước icon huy hiệu, bỏ tint nếu icon gốc đã có màu
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 0, // Bỏ marginTop nếu subHeader không có borderBottom
    marginBottom: 10,
    backgroundColor: COLORS.lightGray || '#F0F0F0',
    borderRadius: 8, // Tăng bo tròn cho tab
    overflow: 'hidden',
    height: 45,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomWidth: 3, // Bỏ border bottom
    // borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.nenItemDam || '#E0E0E0', // Màu cho tab active (cần định nghĩa COLORS.nenItemDam)
    borderRadius: 8, // Bo tròn cho tab active khớp với container
  },
  tabText: {
    fontSize: 16,
    color: COLORS.darkGray || '#A0A0A0',
    fontWeight: '500',
  }, // Màu chữ tab thường
  tabTextActive: {color: COLORS.black || '#000000', fontWeight: 'bold'}, // Màu chữ tab active
  listContainer: {flex: 1, backgroundColor: COLORS.background || '#F5F5F5'}, // Nền cho list
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 5,
  }, // Thêm paddingTop
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6', // Màu nền item
    paddingVertical: 12, // Tăng padding dọc
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12, // Tăng khoảng cách item
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
    tintColor: COLORS.gray || '#888888',
  }, // Kích thước và màu icon
  itemTextContainer: {flex: 1},
  itemNameText: {
    fontSize: 16,
    color: COLORS.black || '#333333',
    fontWeight: '500',
  }, // Bỏ marginBottom, fontWeight
  // itemDetailText và progressBarContainer đã được comment/xóa ở renderListItem nếu không cần
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
  menuIcon: {width: 20, height: 20, marginRight: 12, tintColor: '#555'},
  menuText: {fontSize: 16, color: '#333'},
});
// --- END: STYLES ---

export default TienDoDetailScreen;
