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
} from 'react-native';
import {COLORS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {useNavigation} from '@react-navigation/native';

import {StackNavigationProp} from '@react-navigation/stack'; // Để type-check cho navigation prop
import {RootStackParamList} from '../../navigation'; // << Đảm bảo đường dẫn đúng tới file index.tsx của navigation

// --- BEGIN: Dữ liệu và Type cho Khóa học (Giữ nguyên) ---
type Course = {
  topic_code: string;
  title: string;
  imageUrl: string;
  levelCode: string;
  quantityLesson: number;
};
const initialCoursesData: Course[] = [
  {
    topic_code: '101',
    title: 'Bảng chữ cái',
    imageUrl: 'https://i.imgur.com/oVacZ4F.png',
    levelCode: 'Sơ cấp',
    quantityLesson: 5,
  },
  {
    topic_code: '102',
    title: 'Cơ bản 1',
    imageUrl:
      'https://res.cloudinary.com/de6p22cld/image/upload/v1747068056/5ce8756659087c1d807ce97d74d56ca6_p0lg88.jpg',
    levelCode: 'Cơ bản',
    quantityLesson: 10,
  },
  {
    topic_code: '2',
    title: 'Cơ bản 2',
    imageUrl: 'https://i.imgur.com/na3U2uk.png',
    levelCode: 'Cơ bản',
    quantityLesson: 8,
  },
  {
    topic_code: '3',
    title: 'Ngữ pháp',
    imageUrl: 'https://i.imgur.com/R8WeIEv.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '4',
    title: 'Trường học',
    imageUrl: 'https://i.imgur.com/BI2iGmn.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 15,
  },
  {
    topic_code: '5',
    title: 'Cây cối',
    imageUrl: 'https://i.imgur.com/4NYSRPT.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 20,
  },
  {
    topic_code: '6',
    title: 'Công việc',
    imageUrl: 'https://i.imgur.com/Q7zBfOg.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '7',
    title: 'Món ăn',
    imageUrl: 'https://i.imgur.com/loLlsoi.png',
    levelCode: 'Trung cấp',
    quantityLesson: 15,
  },
  {
    topic_code: '8',
    title: 'Động vật',
    imageUrl: 'https://i.imgur.com/CJQ8ooS.jpeg',
    levelCode: 'Trung cấp',
    quantityLesson: 20,
  },
];
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const COURSE_LIST_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const UPLOAD_ICON = require('../../assets/images/upAnh.png');
// --- END: Đường dẫn tới ảnh ---

// --- BEGIN: Định nghĩa ConfirmDeleteModal (Giữ nguyên) ---
interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | null;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  itemName,
}) => {
  if (!visible) {
    return null;
  }
  const confirmationMessage = itemName
    ? `Bạn có chắc chắn muốn xóa "${itemName}" không?`
    : 'Bạn có chắc chắn muốn xóa không?';
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
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
  /* ... styles modal giữ nguyên ... */
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
  confirmButton: {backgroundColor: '#fff9e6'},
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: '#333333'},
});
// --- END: Định nghĩa ConfirmDeleteModal ---

// --- BEGIN: Định nghĩa AddEditCourseModal và styles của nó ---
interface AddEditCourseModalProps {
  visible: boolean;
  mode: 'add' | 'edit'; // << THÊM PROP mode
  initialData?: Course | null; // << THÊM PROP initialData cho chế độ sửa
  onClose: () => void;
  onSubmit: (
    formData: Omit<Course, 'topic_code' | 'imageUrl'> & {imageUrl?: string},
  ) => void;
}

const AddEditCourseModal: React.FC<AddEditCourseModalProps> = ({
  visible,
  mode, // << NHẬN PROP mode
  initialData, // << NHẬN PROP initialData
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantityLesson, setQuantityLesson] = useState('');
  const [levelCode, setLevelCode] = useState<string>('Tiếng Nhật mới bắt đầu');

  const levelOptions = [
    'Tiếng Nhật mới bắt đầu',
    'Tiếng Nhật cơ bản',
    'Tiếng Nhật nâng cao',
  ];

  // << THÊM useEffect để điền form khi ở chế độ 'edit' hoặc reset khi 'add' >>
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title);
        setImageUrl(initialData.imageUrl || ''); // Dùng rỗng nếu imageUrl không có
        setQuantityLesson(initialData.quantityLesson.toString());
        setLevelCode(initialData.levelCode);
      } else {
        // Chế độ 'add' hoặc không có initialData
        setTitle('');
        setImageUrl('');
        setQuantityLesson('');
        setLevelCode('Tiếng Nhật mới bắt đầu'); // Giá trị mặc định
      }
    }
  }, [visible, mode, initialData]);

  const handleSubmit = () => {
    if (!title.trim() || !quantityLesson.trim() || !levelCode) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }
    const lessons = parseInt(quantityLesson, 10);
    if (isNaN(lessons) || lessons <= 0) {
      Alert.alert('Lỗi', 'Số lượng bài học phải là một số dương.');
      return;
    }
    onSubmit({
      title: title.trim(),
      levelCode,
      quantityLesson: lessons,
      imageUrl: imageUrl.trim() || 'https://i.imgur.com/placeholder.png', // Hoặc URL mặc định khác
    });
    // Việc reset form và đóng modal sẽ do component cha quyết định sau khi onSubmit thành công
    // onClose(); // Không tự đóng ở đây nữa, để cha quản lý
  };

  // Xử lý đóng modal (có thể reset form nếu muốn khi nhấn nút back/chạm ra ngoài)
  const handleAttemptCloseModal = () => {
    // Reset form khi đóng modal bằng nút back hoặc chạm ra ngoài
    if (mode === 'add') {
      // Chỉ reset nếu đang ở chế độ thêm mới để không mất dữ liệu đang sửa
      setTitle('');
      setImageUrl('');
      setQuantityLesson('');
      setLevelCode('Tiếng Nhật mới bắt đầu');
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
        style={addEditModalStyles.backdrop}
        onPress={handleAttemptCloseModal}>
        <Pressable
          style={addEditModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={addEditModalStyles.modalViewContent}>
            <View style={addEditModalStyles.header}>
              <TouchableOpacity
                onPress={handleAttemptCloseModal}
                style={addEditModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={addEditModalStyles.backIcon}
                />
              </TouchableOpacity>
              {/* // << THAY ĐỔI TIÊU ĐỀ MODAL DỰA TRÊN MODE >> */}
              <Text style={addEditModalStyles.headerTitle}>
                {mode === 'add' ? 'Thêm mới chủ đề' : 'Chỉnh sửa chủ đề'}
              </Text>
              <View style={{width: 30}} />
            </View>

            <ScrollView
              style={addEditModalStyles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Tên chủ đề
                  <Text style={addEditModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditModalStyles.input}
                  placeholder="Nhập tên chủ đề"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>Hình đại diện</Text>
                <TouchableOpacity
                  style={addEditModalStyles.uploadButton}
                  onPress={() =>
                    Alert.alert(
                      'Thông báo',
                      'Chức năng tải ảnh sẽ được phát triển sau.',
                    )
                  }>
                  <Image
                    source={UPLOAD_ICON}
                    style={addEditModalStyles.uploadIcon}
                  />
                  <Text style={addEditModalStyles.uploadButtonText}>
                    Tải lên hình ảnh
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Số lượng bài học
                  <Text style={addEditModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditModalStyles.input}
                  placeholder="Nhập số lượng bài học"
                  keyboardType="number-pad"
                  value={quantityLesson}
                  onChangeText={setQuantityLesson}
                />
              </View>
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Cấp độ<Text style={addEditModalStyles.requiredStar}>*</Text>
                </Text>
                {levelOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      addEditModalStyles.levelOption,
                      levelCode === option &&
                        addEditModalStyles.levelOptionSelected,
                    ]}
                    onPress={() => setLevelCode(option)}>
                    <Text
                      style={[
                        addEditModalStyles.levelOptionText,
                        levelCode === option &&
                          addEditModalStyles.levelOptionTextSelected,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={addEditModalStyles.submitButton}
                onPress={handleSubmit}>
                {/* // << THAY ĐỔI TEXT NÚT SUBMIT DỰA TRÊN MODE >> */}
                <Text style={addEditModalStyles.submitButtonText}>
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
// (addEditModalStyles giữ nguyên)
const addEditModalStyles = StyleSheet.create({
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
  inputGroup: {marginBottom: 20},
  label: {fontSize: 15, color: '#444', marginBottom: 8, fontWeight: '500'},
  requiredStar: {color: 'red'},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white || '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: COLORS.orange || '#007bff',
  },
  uploadButtonText: {
    fontSize: 16,
    color: COLORS.gray || '#007bff',
    fontWeight: '500',
  },
  levelOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  levelOptionSelected: {
    borderColor: COLORS.primary || '#007bff',
    backgroundColor: '#e6f2ff',
  },
  levelOptionText: {fontSize: 16, color: '#333'},
  levelOptionTextSelected: {
    color: COLORS.primary || '#007bff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
});
// --- END: Định nghĩa AddEditCourseModal ---

// --- BEGIN: Component HocTapScreen ---
const HocTapScreen = () => {
  const {logout} = useAuth();
  const [courses, setCourses] = useState<Course[]>(initialCoursesData);
  const [filteredCourses, setFilteredCourses] =
    useState<Course[]>(initialCoursesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCourseCode, setDeletingCourseCode] = useState<string | null>(
    null,
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  // --- STATE CHO ADD/EDIT MODAL ---
  const [isCourseFormModalVisible, setIsCourseFormModalVisible] =
    useState(false); // << ĐỔI TÊN STATE
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add'); // << THÊM STATE mode
  const [currentEditingCourse, setCurrentEditingCourse] =
    useState<Course | null>(null); // << THÊM STATE lưu course đang sửa
  // ---
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  useEffect(() => {
    /* ... Lọc khóa học (giữ nguyên) ... */
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (lowerCaseQuery === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        course =>
          course.title.toLowerCase().includes(lowerCaseQuery) ||
          course.levelCode.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const performDeleteCourse = useCallback(async (courseCode: string) => {
    /* ... Xóa khóa học (giữ nguyên) ... */
    setDeletingCourseCode(courseCode);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCourses(prevCourses =>
      prevCourses.filter(course => course.topic_code !== courseCode),
    );
    setDeletingCourseCode(null);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  }, []);
  const handleDeleteModalConfirm = useCallback(() => {
    if (itemToDelete) {
      performDeleteCourse(itemToDelete.id);
    }
    handleDeleteModalClose();
  }, [itemToDelete, performDeleteCourse, handleDeleteModalClose]);
  const handleDeleteCoursePress = useCallback(
    (courseCode: string, courseTitle: string) => {
      Keyboard.dismiss();
      setItemToDelete({id: courseCode, name: courseTitle});
      setIsDeleteModalVisible(true);
    },
    [],
  );
  const handleLogout = useCallback(async () => {
    /* ... Đăng xuất (giữ nguyên) ... */
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

  // --- CẬP NHẬT handleAddNewCourse ---
  const handleAddNewCourse = () => {
    setModalMode('add'); // << SET MODE
    setCurrentEditingCourse(null); // << RESET COURSE ĐANG SỬA
    setIsCourseFormModalVisible(true); // << MỞ MODAL (tên state đã đổi)
  };

  // --- CẬP NHẬT handleEditCourse ---
  const handleEditCourse = (course: Course) => {
    setModalMode('edit'); // << SET MODE
    setCurrentEditingCourse(course); // << SET COURSE ĐANG SỬA
    setIsCourseFormModalVisible(true); // << MỞ MODAL
  };

  // --- ĐỔI TÊN VÀ CẬP NHẬT HÀM SUBMIT FORM ---
  const handleCourseFormSubmit = useCallback(
    (
      formData: Omit<Course, 'topic_code' | 'imageUrl'> & {imageUrl?: string},
    ) => {
      if (modalMode === 'add') {
        const newCourse: Course = {
          ...formData,
          topic_code: `course_${Date.now()}_${Math.floor(
            Math.random() * 1000,
          )}`,
          imageUrl: formData.imageUrl || 'https://i.imgur.com/placeholder.png',
        };
        setCourses(prevCourses => [newCourse, ...prevCourses]);
        Alert.alert('Thành công', `Đã thêm khóa học "${newCourse.title}"!`);
      } else if (modalMode === 'edit' && currentEditingCourse) {
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.topic_code === currentEditingCourse.topic_code
              ? {
                  ...currentEditingCourse,
                  ...formData,
                  imageUrl: formData.imageUrl || currentEditingCourse.imageUrl,
                } // Giữ imageUrl cũ nếu không nhập mới
              : course,
          ),
        );
        Alert.alert('Thành công', `Đã cập nhật khóa học "${formData.title}"!`);
      }
      setIsCourseFormModalVisible(false);
      setCurrentEditingCourse(null);
    },
    [modalMode, currentEditingCourse], // << Thêm dependency
  );

  // --- SỬA renderCourseItem ĐỂ CÓ THỂ NHẤN VÀO ---
  const renderCourseItem = useCallback(
    ({item}: {item: Course}) => (
      <TouchableOpacity // << BỌC TOÀN BỘ ITEM BẰNG TouchableOpacity
        style={styles.courseItem}
        onPress={() => {
          console.log('Chuyển đến bài học của:', item.title);
          navigation.navigate('LessonAdmin', {
            // << ĐIỀU HƯỚNG
            topic_code: item.topic_code,
            title: item.title, // Truyền title của topic/course
          });
        }}
        activeOpacity={0.7}>
        <Image source={COURSE_LIST_ITEM_ICON} style={styles.courseItemIcon} />
        <View style={styles.courseTextContainer}>
          <Text style={styles.courseTitleText} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.courseLevelText} numberOfLines={1}>
            {item.levelCode}
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              // Ngăn sự kiện nổi bọt lên TouchableOpacity cha
              e.stopPropagation();
              handleEditCourse(item);
            }}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              // Ngăn sự kiện nổi bọt
              e.stopPropagation();
              handleDeleteCoursePress(item.topic_code, item.title);
            }}
            disabled={deletingCourseCode === item.topic_code}>
            {deletingCourseCode === item.topic_code ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary || '#007bff'}
              />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [handleDeleteCoursePress, deletingCourseCode, handleEditCourse, navigation], // << THÊM navigation VÀO DEPENDENCY
  ); // handleEditCourse giờ là dependency

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header, SearchBar, Nút Thêm Mới */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => console.log('Logo pressed')}>
          <Image
            source={LOGO_ICON}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JaVis</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON_HEADER}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Image
          source={SEARCH_ICON}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Lọc/ Tìm kiếm khóa học..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
        />
      </View>
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewCourse}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.topic_code}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Không tìm thấy khóa học nào.
            </Text>
          </View>
        }
      />

      <ConfirmDeleteModal
        visible={isDeleteModalVisible}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteModalConfirm}
        itemName={itemToDelete?.name ?? null}
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
                onPress={handleLogout}>
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

      {/* --- SỬ DỤNG isCourseFormModalVisible VÀ TRUYỀN PROPS CHO MODAL --- */}
      <AddEditCourseModal
        visible={isCourseFormModalVisible}
        mode={modalMode}
        initialData={currentEditingCourse}
        onClose={() => {
          setIsCourseFormModalVisible(false);
          setCurrentEditingCourse(null); // Reset khi đóng
        }}
        onSubmit={handleCourseFormSubmit}
      />
    </SafeAreaView>
  );
};
// --- END: Component HocTapScreen ---

// --- BEGIN: Styles cho HocTapScreen (styles, profileMenuStyles giữ nguyên) ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background || '#FFFFFF'},
  header: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    height: 90,
  },
  headerButton: {padding: 5},
  headerIcon: {width: 30, height: 30},
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {width: 18, height: 18, marginRight: 10, tintColor: '#888'},
  searchInput: {flex: 1, fontSize: 16, color: '#333', paddingVertical: 0},
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  addNewButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addNewButtonText: {color: COLORS.white, fontSize: 16, fontWeight: 'bold'},
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  courseItemIcon: {
    width: 28,
    height: 28,
    marginRight: 15,
    tintColor: COLORS.gray,
  },
  courseTextContainer: {flex: 1, justifyContent: 'center'},
  courseTitleText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    marginBottom: 3,
  },
  courseLevelText: {fontSize: 13, color: '#777'},
  actionButtonsContainer: {flexDirection: 'row', alignItems: 'center'},
  actionButton: {padding: 6, marginLeft: 6},
  actionIcon: {width: 22, height: 22, resizeMode: 'contain'},
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {fontSize: 16, color: '#888'},
});
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuContainer: {
    position: 'absolute',
    top: 80,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {width: 20, height: 20, marginRight: 10, tintColor: '#555'},
  menuText: {fontSize: 16, color: '#333'},
});
// --- END: Styles ---

export default HocTapScreen;
