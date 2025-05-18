// src/screens/admin/LessonAdminScreen.tsx
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput, // TextInput sẽ được dùng trong AddEditLessonModal
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message';

// --- BEGIN: Định nghĩa Type và API ---
interface ApiLesson {
  // Dữ liệu trả về từ GET /api/admin/lesson?topicId=...
  id: number;
  name: string;
  // isComplete được bỏ qua theo yêu cầu
}

type Lesson = {
  // Type dùng nội bộ trong màn hình để hiển thị và quản lý
  lesson_code: number;
  lesson_name: string;
  lesson_description: string;
  quantity_content: number;
  day_creation: string;
  topic_code: number;
  status: string;
  lesson_type: string;
};

const API_ADMIN_LESSON_URL = 'http://10.0.2.2:8080/api/admin/lesson';
// --- END: Định nghĩa Type và API ---

// --- Dữ liệu và Type cho Bài Kiểm tra (Giữ nguyên) ---
type TestItem = {
  test_id: string;
  test_name: string;
  topic_code: number;
  question_count: number;
};
const initialTestData: TestItem[] = [
  {
    test_id: 'test101_1',
    test_name: 'Kiểm tra Hiragana (Topic 101)',
    topic_code: 101,
    question_count: 20,
  },
  {
    test_id: 'test101_2',
    test_name: 'Kiểm tra Katakana cơ bản (Topic 101)',
    topic_code: 101,
    question_count: 15,
  },
  {
    test_id: 'test102_1',
    test_name: 'Kiểm tra chào hỏi (Topic 102)',
    topic_code: 102,
    question_count: 10,
  },
];

// --- BEGIN: Đường dẫn tới ảnh Icons (Giữ nguyên) ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const LESSON_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const TEST_ITEM_ICON = require('../../assets/images/ngoiSao.png');

// --- ConfirmDeleteModal và modalStyles (Giữ nguyên) ---
interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | null;
  itemType?: string;
}
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemName,
  itemType = 'mục',
}) => {
  if (!visible) return null;
  const confirmationMessage = itemName
    ? `Bạn có chắc chắn muốn xóa ${itemType.toLowerCase()} "${itemName}" không?`
    : `Bạn có chắc chắn muốn xóa ${itemType.toLowerCase()} này không?`;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={modalStyles.modalContainer}>
          <Text style={modalStyles.messageText}>{confirmationMessage}</Text>
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}>
              <Text
                style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>
                Không
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={onConfirm}>
              <Text
                style={[modalStyles.buttonText, modalStyles.confirmButtonText]}>
                Có
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  confirmButton: {backgroundColor: COLORS.primary || '#fff9e6'},
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primary ? COLORS.white : '#333333'},
});

// --- AddEditLessonModal ---
interface AddEditLessonModalFormData {
  // Kiểu dữ liệu form modal sẽ trả về
  lesson_name: string;
}
interface AddEditLessonModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: {lesson_name: string}; // Chỉ cần tên để edit theo DTO mới
  onClose: () => void;
  onSubmit: (data: AddEditLessonModalFormData) => void; // Sửa lại type data
}
const AddEditLessonModal: React.FC<AddEditLessonModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [lessonName, setLessonName] = useState('');
  // Bỏ các state không cần thiết: lessonDescription, quantityContent, lessonType

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setLessonName(initialData.lesson_name);
      } else {
        // Chế độ 'add' hoặc không có initialData
        setLessonName('');
      }
    }
  }, [visible, mode, initialData]);

  const handleSubmit = () => {
    if (!lessonName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền tên bài học.');
      return;
    }
    onSubmit({lesson_name: lessonName.trim()});
  };

  const handleAttemptCloseModal = () => {
    if (mode === 'add') {
      setLessonName('');
    } // Reset khi thêm mới và đóng
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleAttemptCloseModal}>
      <Pressable
        style={formModalStyles.backdrop}
        onPress={handleAttemptCloseModal}>
        <Pressable
          style={formModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={formModalStyles.modalViewContent}>
            <View style={formModalStyles.header}>
              <TouchableOpacity
                onPress={handleAttemptCloseModal}
                style={formModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStyles.headerTitle}>
                {mode === 'add' ? 'Thêm bài học mới' : 'Chỉnh sửa bài học'}
              </Text>
              <View style={{width: 30}} />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Tên bài học<Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input}
                  placeholder="Nhập tên bài học"
                  placeholderTextColor="#999"
                  value={lessonName}
                  onChangeText={setLessonName}
                />
              </View>
              {/* Các trường lessonDescription, quantityContent, lessonType đã được loại bỏ */}
              <TouchableOpacity
                style={formModalStyles.submitButton}
                onPress={handleSubmit}>
                <Text style={formModalStyles.submitButtonText}>
                  {mode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- AddEditTestModal (Giữ nguyên) ---
interface AddEditTestModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: TestItem | null;
  onClose: () => void;
  onSubmit: (data: Omit<TestItem, 'test_id' | 'topic_code'>) => void;
}
const AddEditTestModal: React.FC<AddEditTestModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [testName, setTestName] = useState('');
  const [questionCount, setQuestionCount] = useState('');
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setTestName(initialData.test_name);
        setQuestionCount(initialData.question_count.toString());
      } else {
        setTestName('');
        setQuestionCount('');
      }
    }
  }, [visible, mode, initialData]);
  const handleSubmit = () => {
    if (!testName.trim() || !questionCount.trim()) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng điền đầy đủ các trường bắt buộc (*).',
      );
      return;
    }
    const numQuestions = parseInt(questionCount, 10);
    if (isNaN(numQuestions) || numQuestions <= 0) {
      Alert.alert('Số lượng không hợp lệ', 'Số câu hỏi phải là một số dương.');
      return;
    }
    onSubmit({test_name: testName.trim(), question_count: numQuestions});
  };
  const handleAttemptCloseModal = () => {
    if (mode === 'add') {
      setTestName('');
      setQuestionCount('');
    }
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleAttemptCloseModal}>
      <Pressable
        style={formModalStyles.backdrop}
        onPress={handleAttemptCloseModal}>
        <Pressable
          style={formModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={formModalStyles.modalViewContent}>
            <View style={formModalStyles.header}>
              <TouchableOpacity
                onPress={handleAttemptCloseModal}
                style={formModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStyles.headerTitle}>
                {mode === 'add'
                  ? 'Thêm bài kiểm tra mới'
                  : 'Chỉnh sửa bài kiểm tra'}
              </Text>
              <View style={{width: 30}} />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Tên bài kiểm tra
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input}
                  placeholder="Nhập tên bài kiểm tra"
                  placeholderTextColor="#999"
                  value={testName}
                  onChangeText={setTestName}
                />
              </View>
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Số lượng câu hỏi
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input}
                  placeholder="Nhập số câu hỏi"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={questionCount}
                  onChangeText={setQuestionCount}
                />
              </View>
              <TouchableOpacity
                style={formModalStyles.submitButton}
                onPress={handleSubmit}>
                <Text style={formModalStyles.submitButtonText}>
                  {mode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- Styles cho Form Modals (formModalStyles giữ nguyên) ---
const formModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalViewContainer: {
    maxHeight: '90%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalViewContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {padding: 5},
  backIcon: {width: 22, height: 22, tintColor: '#555'},
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  formContainer: {paddingHorizontal: 20, paddingTop: 10},
  inputGroup: {marginBottom: 18},
  label: {fontSize: 15, color: '#444', marginBottom: 8, fontWeight: '500'},
  requiredStar: {color: 'red', marginLeft: 2},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
});

// --- Component LessonAdminScreen ---
type LessonAdminScreenRouteProp = RouteProp<RootStackParamList, 'LessonAdmin'>;
type LessonAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LessonAdmin'
>;

const LessonAdminScreen = () => {
  const route = useRoute<LessonAdminScreenRouteProp>();
  const navigation = useNavigation<LessonAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {topic_code: topicCodeFromRoute, title: topicTitleFromRoute} =
    route.params;

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [tests, setTests] = useState<TestItem[]>(initialTestData);
  const [isDeleteLessonConfirmVisible, setIsDeleteLessonConfirmVisible] =
    useState(false);
  const [lessonToDeleteConfirm, setLessonToDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletingLessonCode, setDeletingLessonCode] = useState<number | null>(
    null,
  );
  const [isAddEditLessonModalVisible, setIsAddEditLessonModalVisible] =
    useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingLesson, setCurrentEditingLesson] =
    useState<Lesson | null>(null);
  const [isDeleteTestConfirmVisible, setIsDeleteTestConfirmVisible] =
    useState(false);
  const [testToDeleteConfirm, setTestToDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [isAddEditTestModalVisible, setIsAddEditTestModalVisible] =
    useState(false);
  const [testModalMode, setTestModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingTest, setCurrentEditingTest] = useState<TestItem | null>(
    null,
  );
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false); // State cho submit lesson form

  const currentTopicId = useMemo(() => {
    const id = parseInt(topicCodeFromRoute, 10);
    return isNaN(id) ? null : id;
  }, [topicCodeFromRoute]);

  const getToken = async () => {
    /* ... */ const token = await AsyncStorage.getItem('token');
    if (!token) {
      showMessage({
        message: 'Lỗi xác thực, vui lòng đăng nhập lại.',
        type: 'danger',
      });
      logout();
      throw new Error('Token not found');
    }
    return token;
  };
  const mapApiLessonToDisplayLesson = (
    apiLesson: ApiLesson,
    topicId: number,
  ): Lesson => ({
    lesson_code: apiLesson.id,
    lesson_name: apiLesson.name,
    lesson_description: '',
    quantity_content: 0,
    day_creation: '',
    topic_code: topicId,
    status: 'pending',
    lesson_type: 'common',
  });

  const fetchLessonsForTopic = useCallback(
    async (topicId: number) => {
      /* ... */
      if (isNaN(topicId)) {
        setLessonsError('ID chủ đề không hợp lệ.');
        return;
      }
      setIsLoadingLessons(true);
      setLessonsError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiLesson[]>(
          `${API_ADMIN_LESSON_URL}?topicId=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data && Array.isArray(response.data)) {
          setLessons(
            response.data.map(apiL =>
              mapApiLessonToDisplayLesson(apiL, topicId),
            ),
          );
        } else {
          setLessons([]);
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message || 'Không thể tải danh sách bài học.';
        setLessonsError(msg);
        setLessons([]);
        console.error('LessonAdminScreen: Lỗi tải bài học:', msg);
      } finally {
        setIsLoadingLessons(false);
      }
    },
    [logout], // Thêm getToken vào dependency array nếu nó không phải là hàm thuần túy hoặc có thể thay đổi
  );

  useEffect(() => {
    /* ... */ if (currentTopicId !== null) {
      fetchLessonsForTopic(currentTopicId);
      const filteredTests = initialTestData.filter(
        test => test.topic_code === currentTopicId,
      );
      setTests(filteredTests);
    } else {
      setLessons([]);
      setTests([]);
      setLessonsError('Không có ID chủ đề để tải bài học.');
    }
  }, [currentTopicId, fetchLessonsForTopic]);

  // --- CRUD cho Bài học ---

  // <<<<< HÀM performDeleteLesson ĐƯỢC CẬP NHẬT Ở ĐÂY >>>>>
  const performDeleteLesson = useCallback(
    async (lessonId: number) => {
      if (currentTopicId === null) {
        showMessage({
          message: 'Lỗi: Không xác định được chủ đề hiện tại để tải lại.',
          type: 'danger',
        });
        return;
      }
      setDeletingLessonCode(lessonId);
      try {
        const token = await getToken();
        const response = await axios.put(
          `${API_ADMIN_LESSON_URL}/delete?lessonId=${lessonId}`,
          {}, // PUT request có thể không cần body, tùy thuộc vào API backend
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        // Log phản hồi từ backend (ví dụ: "Xoa thanh cong")
        console.log(
          'LessonAdminScreen: Phản hồi từ API xóa bài học:',
          response.data,
        );

        showMessage({
          message: 'Xóa bài học thành công!',
          type: 'success',
        });
        fetchLessonsForTopic(currentTopicId); // Tải lại danh sách bài học
      } catch (apiError: any) {
        console.error(
          'LessonAdminScreen: Lỗi khi xóa bài học:',
          apiError.response?.data || apiError.message,
        );
        const errorMessage =
          apiError.response?.data?.message || 'Không thể xóa bài học.';
        showMessage({message: errorMessage, type: 'danger', duration: 3000});
      } finally {
        setDeletingLessonCode(null);
        setIsDeleteLessonConfirmVisible(false); // Đóng modal xác nhận sau khi hoàn tất
        setLessonToDeleteConfirm(null);
      }
    },
    [currentTopicId, getToken, fetchLessonsForTopic, logout], //Thêm logout vào dependency array
  );
  // <<<<< KẾT THÚC CẬP NHẬT performDeleteLesson >>>>>

  const handleCloseLessonDeleteConfirm = useCallback(() => {
    setIsDeleteLessonConfirmVisible(false);
    setLessonToDeleteConfirm(null);
  }, []);

  const handleConfirmLessonDelete = useCallback(() => {
    if (lessonToDeleteConfirm) {
      performDeleteLesson(lessonToDeleteConfirm.id);
      // Không cần đóng modal hay reset state ở đây nữa, vì performDeleteLesson sẽ làm
    }
  }, [lessonToDeleteConfirm, performDeleteLesson]);

  const handleDeleteLessonPress = useCallback(
    (lessonCode: number, lessonName: string) => {
      Keyboard.dismiss();
      setLessonToDeleteConfirm({id: lessonCode, name: lessonName});
      setIsDeleteLessonConfirmVisible(true);
    },
    [],
  );

  const handleAddNewLesson = () => {
    setLessonModalMode('add');
    setCurrentEditingLesson(null);
    setIsAddEditLessonModalVisible(true);
  };
  const handleEditLesson = (lesson: Lesson) => {
    if (!lesson.lesson_name) {
      Alert.alert('Lỗi', 'Bài học không có tên.');
      return;
    }
    setLessonModalMode('edit');
    setCurrentEditingLesson(lesson);
    setIsAddEditLessonModalVisible(true);
  };

  const handleLessonFormSubmit = useCallback(
    async (formData: AddEditLessonModalFormData) => {
      if (currentTopicId === null) {
        Alert.alert('Lỗi', 'Không xác định được chủ đề hiện tại.');
        return;
      }
      setIsSubmittingLesson(true); // Báo hiệu đang submit
      try {
        const token = await getToken();
        const headers = {Authorization: `Bearer ${token}`};
        const lessonData = {
          name: formData.lesson_name,
          topicId: String(currentTopicId), // API yêu cầu topicId là string trong body
        };

        if (lessonModalMode === 'add') {
          console.log('LessonAdminScreen: Gọi API Create Lesson:', lessonData);
          await axios.post(`${API_ADMIN_LESSON_URL}/create`, lessonData, {
            headers,
          });
          showMessage({message: 'Thêm bài học thành công!', type: 'success'});
        } else if (lessonModalMode === 'edit' && currentEditingLesson) {
          const lessonIdToUpdate = currentEditingLesson.lesson_code;
          console.log(
            `LessonAdminScreen: Gọi API Update Lesson ID: ${lessonIdToUpdate}`,
            lessonData,
          );
          // API update là PUT .../update?lessonId=...
          await axios.put(
            `${API_ADMIN_LESSON_URL}/update?lessonId=${lessonIdToUpdate}`,
            lessonData,
            {headers},
          );
          showMessage({
            message: 'Cập nhật bài học thành công!',
            type: 'success',
          });
        }

        fetchLessonsForTopic(currentTopicId); // Tải lại danh sách bài học
        setIsAddEditLessonModalVisible(false);
        setCurrentEditingLesson(null);
      } catch (apiError: any) {
        console.error(
          'LessonAdminScreen: Lỗi khi thêm/sửa bài học:',
          apiError.response?.data || apiError.message,
        );
        const errorMessage =
          apiError.response?.data?.message ||
          `Không thể ${
            lessonModalMode === 'add' ? 'thêm' : 'cập nhật'
          } bài học.`;
        showMessage({message: errorMessage, type: 'danger', duration: 3000});
      } finally {
        setIsSubmittingLesson(false); // Kết thúc submit
      }
    },
    [
      lessonModalMode,
      currentEditingLesson,
      currentTopicId,
      getToken,
      fetchLessonsForTopic,
      logout, // Thêm logout vào dependency array
    ],
  );

  // --- CRUD cho Bài kiểm tra (giữ nguyên logic client-side) ---
  // ... (Các hàm performDeleteTest, handleCloseTestDeleteConfirm, etc. giữ nguyên) ...
  const performDeleteTest = useCallback(async (testId: string) => {
    /* ... */ setDeletingTestId(testId);

    setTests(prev => prev.filter(t => t.test_id !== testId));
    setDeletingTestId(null);
    Alert.alert('Thành công', 'Đã xóa bài kiểm tra (client-side).');
  }, []);
  const handleCloseTestDeleteConfirm = useCallback(() => {
    setIsDeleteTestConfirmVisible(false);
    setTestToDeleteConfirm(null);
  }, []);
  const handleConfirmTestDelete = useCallback(() => {
    if (testToDeleteConfirm) performDeleteTest(testToDeleteConfirm.id);
    handleCloseTestDeleteConfirm();
  }, [testToDeleteConfirm, performDeleteTest, handleCloseTestDeleteConfirm]);
  const handleDeleteTestPress = useCallback(
    (testId: string, testName: string) => {
      Keyboard.dismiss();
      setTestToDeleteConfirm({id: testId, name: testName});
      setIsDeleteTestConfirmVisible(true);
    },
    [],
  );
  const handleAddNewTest = () => {
    setTestModalMode('add');
    setCurrentEditingTest(null);
    setIsAddEditTestModalVisible(true);
  };
  const handleEditTest = (test: TestItem) => {
    setTestModalMode('edit');
    setCurrentEditingTest(test);
    setIsAddEditTestModalVisible(true);
  };
  const handleTestFormSubmit = useCallback(
    (formData: Omit<TestItem, 'test_id' | 'topic_code'>) => {
      const currentTopicCodeNumber = parseInt(topicCodeFromRoute, 10);
      if (isNaN(currentTopicCodeNumber)) {
        Alert.alert('Lỗi', 'Topic không hợp lệ.');
        return;
      }
      if (testModalMode === 'add') {
        const newTest: TestItem = {
          ...formData,
          test_id: `test_${Date.now()}`,
          topic_code: currentTopicCodeNumber,
        };
        setTests(prev => [newTest, ...prev]);
        Alert.alert(
          'Thành công',
          `Đã thêm bài kiểm tra "${newTest.test_name}" (client-side)!`,
        );
      } else if (testModalMode === 'edit' && currentEditingTest) {
        setTests(prev =>
          prev.map(t =>
            t.test_id === currentEditingTest.test_id
              ? {...currentEditingTest, ...formData}
              : t,
          ),
        );
        Alert.alert(
          'Thành công',
          `Đã cập nhật bài kiểm tra "${formData.test_name}" (client-side)!`,
        );
      }
      setIsAddEditTestModalVisible(false);
      setCurrentEditingTest(null);
    },
    [testModalMode, currentEditingTest, topicCodeFromRoute],
  );

  // --- Logout ---
  const handleLogoutFromMenu = useCallback(async () => {
    /* ... */ setIsProfileMenuVisible(false);
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
  }, [logout, navigation]); // Thêm navigation vào dependencies nếu nó được sử dụng để điều hướng sau logout

  const renderLessonItem = useCallback(
    ({item}: {item: Lesson}) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ContentAdmin', {
            lesson_code: item.lesson_code,
            lesson_name: item.lesson_name,
          })
        }
        style={styles.listItem}
        activeOpacity={0.8}>
        <Image source={LESSON_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={1}>
            {item.lesson_name}
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              e.stopPropagation();
              handleEditLesson(item);
            }}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              e.stopPropagation();
              handleDeleteLessonPress(item.lesson_code, item.lesson_name);
            }}
            disabled={deletingLessonCode === item.lesson_code}>
            {deletingLessonCode === item.lesson_code ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [deletingLessonCode, handleDeleteLessonPress, handleEditLesson, navigation],
  );
  const renderTestItem = useCallback(
    ({item}: {item: TestItem}) => (
      <View style={styles.listItem}>
        <Image source={TEST_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={1}>
            {item.test_name}
          </Text>
          <Text style={styles.itemDetailText} numberOfLines={1}>
            {item.question_count} câu hỏi
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTest(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTestPress(item.test_id, item.test_name)}
            disabled={deletingTestId === item.test_id}>
            {deletingTestId === item.test_id ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary || '#007bff'}
              />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [deletingTestId, handleDeleteTestPress, handleEditTest],
  );

  // --- Phần return JSX của LessonAdminScreen ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => console.log('Logo pressed')}>
          <Image
            source={LOGO_ICON_HEADER}
            style={styles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>JaVis</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON_HEADER}
            style={styles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {/* Sub Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButtonSubHeader}
          onPress={() => navigation.goBack()}>
          <Image
            source={BACK_ARROW_ICON}
            style={styles.backIconSubHeader}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.topicTitleStyle} numberOfLines={1}>
          {topicTitleFromRoute || 'Chi tiết chủ đề'}
        </Text>
        <View style={{width: 30}} />
      </View>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'lessons' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('lessons')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'lessons' && styles.tabTextActive,
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
              styles.tabText,
              activeTab === 'tests' && styles.tabTextActive,
            ]}>
            Kiểm tra
          </Text>
        </TouchableOpacity>
      </View>
      {/* Add New Button */}
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={
            activeTab === 'lessons' ? handleAddNewLesson : handleAddNewTest
          }
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {activeTab === 'lessons' ? (
        isLoadingLessons ? (
          <View style={styles.loadingContainerFull}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text>Đang tải bài học...</Text>
          </View>
        ) : lessonsError ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.errorText}>{lessonsError}</Text>
          </View>
        ) : lessons.length === 0 ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Chủ đề này chưa có bài học nào.
            </Text>
          </View>
        ) : (
          <FlatList
            data={lessons}
            renderItem={renderLessonItem}
            keyExtractor={item => `lesson-${item.lesson_code.toString()}`}
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : /* tests tab */ tests.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Chủ đề này chưa có bài kiểm tra nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTestItem}
          keyExtractor={item => `test-${item.test_id}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Loading overlay for form submission */}
      {isSubmittingLesson && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.submittingText}>Đang xử lý...</Text>
        </View>
      )}

      {/* Modals */}
      <ConfirmDeleteModal
        visible={isDeleteLessonConfirmVisible}
        onClose={handleCloseLessonDeleteConfirm}
        onConfirm={handleConfirmLessonDelete}
        itemName={lessonToDeleteConfirm?.name ?? null}
        itemType="Bài học"
      />
      <ConfirmDeleteModal
        visible={isDeleteTestConfirmVisible}
        onClose={handleCloseTestDeleteConfirm}
        onConfirm={handleConfirmTestDelete}
        itemName={testToDeleteConfirm?.name ?? null}
        itemType="Bài kiểm tra"
      />
      <AddEditLessonModal
        visible={isAddEditLessonModalVisible}
        mode={lessonModalMode}
        initialData={
          lessonModalMode === 'edit' && currentEditingLesson
            ? {lesson_name: currentEditingLesson.lesson_name}
            : undefined
        }
        onClose={() => {
          setIsAddEditLessonModalVisible(false);
          setCurrentEditingLesson(null);
        }}
        onSubmit={handleLessonFormSubmit}
      />
      <AddEditTestModal
        visible={isAddEditTestModalVisible}
        mode={testModalMode}
        initialData={currentEditingTest}
        onClose={() => {
          setIsAddEditTestModalVisible(false);
          setCurrentEditingTest(null);
        }}
        onSubmit={handleTestFormSubmit}
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
            <Pressable onPress={() => {}}>
              <TouchableOpacity
                style={profileMenuStyles.menuItem}
                onPress={handleLogoutFromMenu}>
                <Image
                  source={LOGOUT_ICON_MENU}
                  style={profileMenuStyles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={profileMenuStyles.menuText}>Đăng xuất</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component LessonAdminScreen ---

// --- BEGIN: Styles cho LessonAdminScreen (Giữ nguyên phần lớn) ---
const styles = StyleSheet.create({
  /* ... styles giữ nguyên ... */
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#ECECEC',
    marginBottom: 0,
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {
    width: 20,
    height: 20,
    tintColor: COLORS.black || '#333333',
  },
  topicTitleStyle: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'left',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray || '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
    height: 45,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.nenItemDam,
    borderBottomColor: COLORS.primary,
  },
  tabText: {fontSize: 16, color: COLORS.black || '#555555', fontWeight: '500'},
  tabTextActive: {color: COLORS.primary, fontWeight: 'bold'},
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginBottom: 12,
    marginTop: 5,
  },
  addNewButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingHorizontal: 18,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    height: 39,
    borderRadius: 5,
  },
  addNewButtonText: {color: COLORS.white, fontSize: 15, fontWeight: 'bold'},
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: COLORS.darkGray || '#777',
  },
  itemTextContainer: {flex: 1, justifyContent: 'center'},
  itemNameText: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDetailText: {fontSize: 13, color: '#777777'},
  actionButtonsContainer: {flexDirection: 'row', alignItems: 'center'},
  actionButton: {padding: 6, marginLeft: 8},
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.gray || '#888888',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {fontSize: 16, color: '#888888', textAlign: 'center'},
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red || 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  }, // Cho loading overlay
  submittingText: {
    marginTop: 10,
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 80,
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

export default LessonAdminScreen;
