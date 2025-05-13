import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import {COLORS} from '../../constants/theme'; // Đảm bảo bạn có file này và các màu cần thiết
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation'; //Đảm bảo đường dẫn đúng

// --- BEGIN: Dữ liệu và Type cho Bài học ---
type Lesson = {
  lesson_code: number;
  lesson_name: string;
  lesson_description: string;
  quantity_content: number;
  day_creation: string; // Giữ nguyên kiểu string nếu API trả về string
  topic_code: number; // Sẽ được parse từ route params (string)
  status: string;
  lesson_type: string;
};
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
// --- END: Dữ liệu và Type ---

// --- BEGIN: Dữ liệu và Type cho Bài Kiểm tra ---
type TestItem = {
  test_id: string;
  test_name: string;
  topic_code: number; // Sẽ được parse từ route params (string)
  question_count: number;
  // Thêm các trường khác nếu cần, ví dụ: duration, pass_score, etc.
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
// --- END: Dữ liệu và Type cho Bài Kiểm tra ---

// --- BEGIN: Đường dẫn tới ảnh Icons ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const LESSON_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const TEST_ITEM_ICON = require('../../assets/images/ngoiSao.png'); // << THAY THẾ BẰNG ICON PHÙ HỢP
// const UPLOAD_ICON_FORM = require('../../assets/images/upAnh.png'); // Không dùng trong các modal này
// --- END: Đường dẫn tới ảnh ---

// --- BEGIN: Định nghĩa ConfirmDeleteModal (Giữ nguyên từ code bạn cung cấp) ---
interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | null;
  itemType?: string; // 'Bài học', 'Bài kiểm tra', etc.
}
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemName,
  itemType = 'mục', // Giá trị mặc định
}) => {
  if (!visible) {
    return null;
  }
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
        <Pressable onPress={() => {}}>
          {/* Ngăn click xuyên thấu */}
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.messageText}>{confirmationMessage}</Text>
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modalStyles.buttonText,
                    modalStyles.cancelButtonText,
                  ]}>
                  Không
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modalStyles.buttonText,
                    modalStyles.confirmButtonText,
                  ]}>
                  Có
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
  confirmButton: {backgroundColor: COLORS.primary || '#fff9e6'}, // Sử dụng màu primary nếu có
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primary ? COLORS.white : '#333333'}, // Text trắng nếu nền là primary
});
// --- END: Định nghĩa ConfirmDeleteModal ---

// --- BEGIN: Định nghĩa AddEditLessonModal ---
interface AddEditLessonModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: Lesson | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      Lesson,
      'lesson_code' | 'topic_code' | 'day_creation' | 'status'
    >, // Các trường này sẽ được tạo tự động hoặc lấy từ context
  ) => void;
}

// Bỏ LESSON_TYPES_OPTIONS vì không còn dùng kiểu select nữa
// const LESSON_TYPES_OPTIONS = [
//   {label: 'Bài chung', value: 'common'},
//   {label: 'Hiragana', value: 'hira'},
//   {label: 'Katakana', value: 'kata'},
//   {label: 'Ngữ pháp', value: 'grammar'},
//   {label: 'Từ vựng', value: 'vocabulary'},
//   {label: 'Luyện thi', value: 'test_prep'},
// ];

const AddEditLessonModal: React.FC<AddEditLessonModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [lessonName, setLessonName] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [quantityContent, setQuantityContent] = useState('');
  // Sửa: lessonType là string rỗng, không còn phụ thuộc LESSON_TYPES_OPTIONS
  const [lessonType, setLessonType] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setLessonName(initialData.lesson_name);
        setLessonDescription(initialData.lesson_description || '');
        setQuantityContent(initialData.quantity_content.toString());
        // Sửa: Gán giá trị lesson_type từ initialData hoặc rỗng
        setLessonType(initialData.lesson_type || '');
      } else {
        // Chế độ 'add' hoặc không có initialData
        setLessonName('');
        setLessonDescription('');
        setQuantityContent('');
        // Sửa: Reset lessonType thành rỗng
        setLessonType('');
      }
    }
  }, [visible, mode, initialData]);

  const handleSubmit = () => {
    if (!lessonName.trim() || !quantityContent.trim() || !lessonType.trim()) {
      // Vẫn kiểm tra lessonType.trim()
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng điền đầy đủ các trường bắt buộc (*).',
      );
      return;
    }
    const numContent = parseInt(quantityContent, 10);
    if (isNaN(numContent) || numContent <= 0) {
      Alert.alert(
        'Số lượng không hợp lệ',
        'Số lượng nội dung phải là một số dương.',
      );
      return;
    }
    onSubmit({
      lesson_name: lessonName.trim(),
      lesson_description: lessonDescription.trim(),
      quantity_content: numContent,
      lesson_type: lessonType.trim(), // Gửi giá trị lessonType đã trim
    });
  };

  const handleAttemptCloseModal = () => {
    if (mode === 'add') {
      setLessonName('');
      setLessonDescription('');
      setQuantityContent('');
      // Sửa: Reset lessonType thành rỗng
      setLessonType('');
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
          onPress={() => {}} // Ngăn click xuyên thấu
        >
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
              {/* Placeholder for alignment */}
            </View>

            <ScrollView
              style={formModalStyles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Tên bài học
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input}
                  placeholder="Nhập tên bài học"
                  placeholderTextColor="#999"
                  value={lessonName}
                  onChangeText={setLessonName}
                />
              </View>
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>Mô tả</Text>
                <TextInput
                  style={[
                    formModalStyles.input,
                    {height: 80, textAlignVertical: 'top'},
                  ]}
                  placeholder="Nhập mô tả (không bắt buộc)"
                  placeholderTextColor="#999"
                  value={lessonDescription}
                  onChangeText={setLessonDescription}
                  multiline
                />
              </View>
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Số lượng nội dung
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input}
                  placeholder="Nhập số lượng"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={quantityContent}
                  onChangeText={setQuantityContent}
                />
              </View>
              {/* ===== PHẦN THAY ĐỔI CHO LOẠI BÀI HỌC ===== */}
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Loại bài học
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStyles.input} // Sử dụng style input chung
                  placeholder="Nhập loại bài học (vd: common, hira)"
                  placeholderTextColor="#999"
                  value={lessonType}
                  onChangeText={setLessonType}
                  autoCapitalize="none" // Tùy chọn
                />
              </View>
              {/* ===== KẾT THÚC PHẦN THAY ĐỔI ===== */}
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
// --- END: Định nghĩa AddEditLessonModal ---

// --- BEGIN: Định nghĩa AddEditTestModal ---
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
    onSubmit({
      test_name: testName.trim(),
      question_count: numQuestions,
    });
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
          onPress={() => {}} // Ngăn click xuyên thấu
        >
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
              {/* Bạn có thể thêm các trường khác cho Test tại đây */}
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
// --- END: Định nghĩa AddEditTestModal ---

// --- BEGIN: Styles cho các Form Modals (AddEditLessonModal, AddEditTestModal) ---
const formModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalViewContainer: {
    maxHeight: '90%', // Giới hạn chiều cao tối đa của modal
    width: '100%',
    backgroundColor: 'transparent', // Để bo góc ở modalViewContent có tác dụng
  },
  modalViewContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20, // Padding ở dưới cùng của nội dung modal
    // Không set height ở đây để ScrollView có thể hoạt động đúng
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
  backButton: {
    padding: 5, // Tăng vùng chạm cho nút back
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#555',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    // maxHeight: Dimensions.get('window').height * 0.7, // Giới hạn chiều cao của form
  },
  inputGroup: {
    marginBottom: 18, // Tăng khoảng cách giữa các input group
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    fontWeight: '500',
  },
  requiredStar: {
    color: 'red',
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10, // Điều chỉnh padding cho vừa vặn
    fontSize: 16,
    backgroundColor: '#f9f9f9', // Màu nền nhẹ cho input
    color: '#333',
  },
  selectableOption: {
    // Style này không còn dùng cho lessonType nhưng giữ lại theo yêu cầu
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectableOptionSelected: {
    // Style này không còn dùng cho lessonType nhưng giữ lại
    borderColor: COLORS.primary || '#007bff', // Sử dụng màu primary từ theme
    backgroundColor: COLORS.primary ? `${COLORS.primary}20` : '#e6f2ff', // Màu nền khi selected, có opacity
  },
  selectableOptionText: {
    // Style này không còn dùng cho lessonType nhưng giữ lại
    fontSize: 16,
    color: '#333',
  },
  selectableOptionTextSelected: {
    // Style này không còn dùng cho lessonType nhưng giữ lại
    color: COLORS.primary || '#007bff', // Màu chữ khi selected
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745', // Màu nút submit
    paddingVertical: 14, // Tăng padding cho nút submit
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15, // Khoảng cách trên nút submit
    marginBottom: 25, // Khoảng cách dưới nút submit (quan trọng khi scroll)
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
// --- END: Styles cho Form Modals ---

// --- BEGIN: Component LessonAdminScreen ---
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
    route.params; // topic_code từ route là string

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');

  // State cho Bài học
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  // State cho Bài kiểm tra
  const [tests, setTests] = useState<TestItem[]>([]);
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

  useEffect(() => {
    const currentTopicCodeNumber = parseInt(topicCodeFromRoute, 10);
    if (!isNaN(currentTopicCodeNumber)) {
      const filteredLessons = allLessonsData.filter(
        lesson => lesson.topic_code === currentTopicCodeNumber,
      );
      setLessons(filteredLessons);

      const filteredTests = initialTestData.filter(
        test => test.topic_code === currentTopicCodeNumber,
      );
      setTests(filteredTests);
    } else {
      console.error('Invalid topic_code received:', topicCodeFromRoute);
      setLessons([]);
      setTests([]);
    }
  }, [topicCodeFromRoute]);

  // --- CRUD cho Bài học ---
  const performDeleteLesson = useCallback(async (lessonCode: number) => {
    setDeletingLessonCode(lessonCode);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setLessons(prevLessons =>
      prevLessons.filter(lesson => lesson.lesson_code !== lessonCode),
    );
    setDeletingLessonCode(null);
    Alert.alert('Thành công', 'Đã xóa bài học.');
  }, []);

  const handleCloseLessonDeleteConfirm = useCallback(() => {
    setIsDeleteLessonConfirmVisible(false);
    setLessonToDeleteConfirm(null);
  }, []);

  const handleConfirmLessonDelete = useCallback(() => {
    if (lessonToDeleteConfirm) {
      performDeleteLesson(lessonToDeleteConfirm.id);
    }
    handleCloseLessonDeleteConfirm();
  }, [
    lessonToDeleteConfirm,
    performDeleteLesson,
    handleCloseLessonDeleteConfirm,
  ]);

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
    setLessonModalMode('edit');
    setCurrentEditingLesson(lesson);
    setIsAddEditLessonModalVisible(true);
  };

  const handleLessonFormSubmit = useCallback(
    (
      formData: Omit<
        Lesson,
        'lesson_code' | 'topic_code' | 'day_creation' | 'status'
      >,
    ) => {
      const currentTopicCodeNumber = parseInt(topicCodeFromRoute, 10);
      if (isNaN(currentTopicCodeNumber)) {
        Alert.alert('Lỗi', 'Topic không hợp lệ để thêm/sửa bài học.');
        return;
      }

      if (lessonModalMode === 'add') {
        const newLesson: Lesson = {
          ...formData,
          lesson_code: Date.now(), // Hoặc ID từ API
          topic_code: currentTopicCodeNumber,
          day_creation: new Date().toISOString(),
          status: 'pending', // Trạng thái mặc định khi thêm mới
        };
        setLessons(prevLessons => [newLesson, ...prevLessons]);
        Alert.alert(
          'Thành công',
          `Đã thêm bài học "${newLesson.lesson_name}"!`,
        );
      } else if (lessonModalMode === 'edit' && currentEditingLesson) {
        setLessons(prevLessons =>
          prevLessons.map(lesson =>
            lesson.lesson_code === currentEditingLesson.lesson_code
              ? {...currentEditingLesson, ...formData}
              : lesson,
          ),
        );
        Alert.alert(
          'Thành công',
          `Đã cập nhật bài học "${formData.lesson_name}"!`,
        );
      }
      setIsAddEditLessonModalVisible(false);
      setCurrentEditingLesson(null); // Reset editing state
    },
    [lessonModalMode, currentEditingLesson, topicCodeFromRoute],
  );

  // --- CRUD cho Bài kiểm tra ---
  const performDeleteTest = useCallback(async (testId: string) => {
    setDeletingTestId(testId);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTests(prevTests => prevTests.filter(test => test.test_id !== testId));
    setDeletingTestId(null);
    Alert.alert('Thành công', 'Đã xóa bài kiểm tra.');
  }, []);

  const handleCloseTestDeleteConfirm = useCallback(() => {
    setIsDeleteTestConfirmVisible(false);
    setTestToDeleteConfirm(null);
  }, []);

  const handleConfirmTestDelete = useCallback(() => {
    if (testToDeleteConfirm) {
      performDeleteTest(testToDeleteConfirm.id);
    }
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
        Alert.alert('Lỗi', 'Topic không hợp lệ để thêm/sửa bài kiểm tra.');
        return;
      }

      if (testModalMode === 'add') {
        const newTest: TestItem = {
          ...formData,
          test_id: `test_${Date.now()}`, // Hoặc ID từ API
          topic_code: currentTopicCodeNumber,
        };
        setTests(prevTests => [newTest, ...prevTests]);
        Alert.alert(
          'Thành công',
          `Đã thêm bài kiểm tra "${newTest.test_name}"!`,
        );
      } else if (testModalMode === 'edit' && currentEditingTest) {
        setTests(prevTests =>
          prevTests.map(test =>
            test.test_id === currentEditingTest.test_id
              ? {...currentEditingTest, ...formData}
              : test,
          ),
        );
        Alert.alert(
          'Thành công',
          `Đã cập nhật bài kiểm tra "${formData.test_name}"!`,
        );
      }
      setIsAddEditTestModalVisible(false);
      setCurrentEditingTest(null);
    },
    [testModalMode, currentEditingTest, topicCodeFromRoute],
  );

  // --- Logout ---
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
            // navigation.replace('Login'); // Hoặc màn hình phù hợp sau khi logout
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout, navigation]);

  // Hàm renderLessonItem của bạn, đã được sửa đổi
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
          <Text style={styles.itemDetailText} numberOfLines={1}>
            {item.quantity_content} nội dung - Loại: {item.lesson_type}
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          {/* Các nút con phải chặn sự kiện touch để không bị truyền lên TouchableOpacity cha */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              e.stopPropagation(); // ⛔ Ngăn sự kiện truyền lên thẻ cha
              navigation.navigate('ContentAdmin', {
                lesson_code: item.lesson_code,
                lesson_name: item.lesson_name,
              });
            }}></TouchableOpacity>

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

  return (
    <SafeAreaView style={styles.safeArea}>
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

      {/* Sub Header with Back Button and Topic Title */}
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
        <FlatList
          data={lessons}
          renderItem={renderLessonItem}
          keyExtractor={item => `lesson-${item.lesson_code.toString()}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                Chủ đề này chưa có bài học nào.
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={tests}
          renderItem={renderTestItem}
          keyExtractor={item => `test-${item.test_id}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                Chủ đề này chưa có bài kiểm tra nào.
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
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
        initialData={currentEditingLesson}
        onClose={() => {
          setIsAddEditLessonModalVisible(false);
          setCurrentEditingLesson(null); // Reset khi đóng
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

      {/* Profile Menu Modal (Giữ nguyên từ code bạn cung cấp) */}
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
              {/* Ngăn click xuyên thấu */}
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
              {/* Thêm các item khác cho menu ở đây nếu cần */}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component LessonAdminScreen ---

// --- BEGIN: Styles cho LessonAdminScreen ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background || '#FFFFFF'},
  mainHeader: {
    // Giữ nguyên style từ ảnh của bạn (màu cam)
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 30, // Xử lý status bar cho Android
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary, // Màu cam chính
    paddingHorizontal: 15,
    paddingBottom: 10, // Thêm padding bottom
    height:
      Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 90, // Điều chỉnh chiều cao header
  },
  headerButton: {padding: 5},
  headerIconMain: {
    width: 30,
    height: 30,
  },
  mainHeaderTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white, // Nền trắng cho sub-header

    borderBottomColor: COLORS.lightGray || '#ECECEC', // Đường kẻ mờ
    marginBottom: 0, // Khoảng cách dưới sub-header
  },
  backButtonSubHeader: {
    padding: 5, // Tăng vùng chạm
    marginRight: 10, // Khoảng cách với title
  },
  backIconSubHeader: {
    width: 20,
    height: 20,
    tintColor: COLORS.black || '#333333', // Icon back màu tối
  },
  topicTitleStyle: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'left', // Căn lề trái cho title
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 0, // Tăng margin top
    marginBottom: 10,
    backgroundColor: COLORS.lightGray || '#F0F0F0', // Nền cho toàn bộ tabs
    borderRadius: 5,
    overflow: 'hidden', // Để bo góc có tác dụng
    // elevation: 1, // Độ nổi nhẹ cho tabs (tùy chọn)
    height: 45, // Chiều cao cố định cho tabs
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2, // Đường gạch dưới cho tab không active
    borderBottomColor: 'transparent', // Mặc định trong suốt
  },
  tabButtonActive: {
    backgroundColor: COLORS.nenItemDam, // Nền trắng cho tab active
  },
  tabText: {
    fontSize: 16,
    color: COLORS.black || '#555555',
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.black, // Chữ màu cam cho tab active
    fontWeight: 'bold',
  },
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginBottom: 12, // Tăng margin bottom
    marginTop: 5, // Giảm margin top nếu tabs đã có margin bottom
  },
  addNewButton: {
    backgroundColor: COLORS.primary || '#28a745', // Màu xanh cho nút thêm mới
    paddingHorizontal: 18, // Tăng padding ngang
    paddingVertical: 9, // Tăng padding dọc
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    height: 39, // Chiều cao nút
  },
  addNewButtonText: {
    color: COLORS.white,
    fontSize: 15, // Cỡ chữ vừa phải
    fontWeight: 'bold',
  },
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6', // Màu nền item như ảnh
    padding: 12,
    borderRadius: 10, // Bo góc vừa phải
    marginBottom: 10,
    elevation: 1.5, // Độ nổi nhẹ
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 28, // Kích thước icon
    height: 28,
    marginRight: 12,
    tintColor: COLORS.darkGray || '#777', // Màu icon
  },
  itemTextContainer: {
    // Container cho tên và chi tiết
    flex: 1,
    justifyContent: 'center',
  },
  itemNameText: {
    flex: 1,
    fontSize: 16,
    color: '#444444', // Màu chữ đậm hơn chút
    fontWeight: '500',
    marginBottom: 2, // Khoảng cách giữa tên và chi tiết
  },
  itemDetailText: {
    // Style cho dòng chi tiết (số lượng nội dung, loại,...)
    fontSize: 13,
    color: '#777777',
  },
  actionButtonsContainer: {flexDirection: 'row', alignItems: 'center'},
  actionButton: {
    padding: 6, // Tăng vùng chạm
    marginLeft: 8, // Tăng khoảng cách giữa các nút action
  },
  actionIcon: {
    width: 20, // Kích thước icon action
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.gray || '#888888', // Màu icon action
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {fontSize: 16, color: '#888888', textAlign: 'center'},
});

// Styles cho Profile Menu (Giữ nguyên từ code bạn cung cấp)
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'}, // Cho phép click ra ngoài để đóng
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 80, // Điều chỉnh vị trí top cho menu
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 180, // Tăng chiều rộng menu
    elevation: 5, // Cho Android
    shadowColor: '#000', // Cho iOS
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
// --- END: Styles ---

export default LessonAdminScreen;
