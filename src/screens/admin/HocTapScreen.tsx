// src/screens/admin/HocTapScreen.tsx
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
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {Picker} from '@react-native-picker/picker';
import {showMessage} from 'react-native-flash-message';
import {
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
} from 'react-native-image-picker';

// --- BEGIN: Định nghĩa Type và API ---
interface ApiAdminTopic {
  id: number;
  levelId: number;
  name: string;
  avatarUrl: string;
  dayCreation: string;
}
type Course = {
  // Dùng cho hiển thị danh sách
  topic_code: string; // id từ API (string)
  title: string;
  imageUrl: string;
  levelCode: string; // Ví dụ: "Cấp độ 1"
  quantityLesson: number; // Sẽ không còn trong form, nhưng giữ lại trong type nếu list item vẫn dùng
  originalLevelId?: number;
};

interface LevelOption {
  // Dùng cho Picker và để lấy levelId số
  id: number;
  name: string;
}

const API_ADMIN_TOPIC_URL = 'http://10.0.2.2:8080/api/admin/topic';
const API_LEVEL_LIST_URL = 'http://10.0.2.2:8080/api/public/level'; // Hoặc admin endpoint nếu có

// --- END: Định nghĩa Type và API ---

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

// --- ConfirmDeleteModal và modalStyles (Giữ nguyên) ---
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
  if (!visible) return null;
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
  confirmButtonText: {color: COLORS.white},
});

// --- AddEditCourseModal ---
interface AddEditCourseModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: Course | null;
  onClose: () => void;
  onSubmit: (formData: FormData, topicIdToUpdate?: string) => Promise<void>; // Sửa lại để nhận FormData và topicId nếu sửa
  availableLevels: LevelOption[]; // Danh sách level cho Picker
}

const AddEditCourseModal: React.FC<AddEditCourseModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
  availableLevels,
}) => {
  const [title, setTitle] = useState('');
  const [selectedLevelIdValue, setSelectedLevelIdValue] = useState<
    string | undefined
  >(undefined); // Lưu ID của level (string)

  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  // quantityLesson không còn trong form này vì API create/update không có

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title);
        setPreviewImageUri(initialData.imageUrl || null); // Ảnh hiện tại để preview
        setSelectedImage(null); // Reset ảnh mới chọn
        // originalLevelId là ID số, cần tìm và set value cho Picker
        const currentLevel = availableLevels.find(
          lvl => lvl.id === initialData.originalLevelId,
        );
        setSelectedLevelIdValue(
          currentLevel
            ? String(currentLevel.id)
            : availableLevels[0]?.id
            ? String(availableLevels[0].id)
            : undefined,
        );
      } else {
        // Chế độ add
        setTitle('');
        setPreviewImageUri(null);
        setSelectedImage(null);
        setSelectedLevelIdValue(
          availableLevels[0]?.id ? String(availableLevels[0].id) : undefined,
        );
      }
    }
  }, [visible, mode, initialData, availableLevels]);

  const handleChoosePhoto = () => {
    const options: ImageLibraryOptions = {mediaType: 'photo', quality: 0.7};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        showMessage({
          message: `Lỗi chọn ảnh: ${response.errorMessage}`,
          type: 'danger',
        });
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        setPreviewImageUri(response.assets[0].uri || null);
      }
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedLevelIdValue) {
      Alert.alert('Lỗi', 'Vui lòng điền tên chủ đề và chọn cấp độ.');
      return;
    }
    if (mode === 'add' && !selectedImage) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình đại diện cho chủ đề mới.');
      return;
    }

    const formData = new FormData();
    formData.append('name', title.trim());
    formData.append('levelId', selectedLevelIdValue); // Gửi levelId dạng số (API yêu cầu Integer)

    if (
      selectedImage &&
      selectedImage.uri &&
      selectedImage.fileName &&
      selectedImage.type
    ) {
      formData.append('avatar', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName,
      } as any); // Ép kiểu nếu TypeScript báo lỗi với cấu trúc file
    } else if (mode === 'edit' && initialData?.imageUrl && !selectedImage) {
      // Nếu là edit và không chọn ảnh mới, nhưng có ảnh cũ,
      // backend của bạn cần xử lý việc không nhận file avatar mới thì giữ lại cái cũ.
      // Hoặc, bạn có thể cần gửi imageUrl cũ như một trường riêng nếu API hỗ trợ.
      // Hiện tại, nếu không có selectedImage, trường 'avatar' sẽ không được gửi.
      // Hoặc bạn có thể gửi imageUrl cũ như một field khác nếu API update cho phép, ví dụ:
      // formData.append('existingAvatarUrl', initialData.imageUrl);
    }

    // Đối với chế độ sửa, bạn cần gửi topic_id
    const topicIdToUpdate =
      mode === 'edit' && initialData ? initialData.topic_code : undefined;

    await onSubmit(formData, topicIdToUpdate); // Gọi hàm onSubmit từ props
  };

  const handleAttemptCloseModal = () => {
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
          style={[
            addEditModalStyles.modalViewContainer,
            {height: SIZES.height * 0.85},
          ]}
          onPress={() => Keyboard.dismiss()}
          accessible={false}>
          <View
            style={addEditModalStyles.modalViewContent}
            onStartShouldSetResponder={() => true}>
            <View style={addEditModalStyles.header}>
              <TouchableOpacity
                onPress={handleAttemptCloseModal}
                style={addEditModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={addEditModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={addEditModalStyles.headerTitle}>
                {mode === 'add' ? 'Thêm mới chủ đề' : 'Chỉnh sửa chủ đề'}
              </Text>
              <View style={{width: 30}} />
            </View>
            <ScrollView
              style={[addEditModalStyles.formContainer, {flex: 1}]}
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
                <Text style={addEditModalStyles.label}>
                  Hình đại diện
                  {mode === 'add' && (
                    <Text style={addEditModalStyles.requiredStar}>*</Text>
                  )}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    style={addEditModalStyles.uploadButton}
                    onPress={handleChoosePhoto}>
                    <Image
                      source={UPLOAD_ICON}
                      style={addEditModalStyles.uploadIcon}
                    />
                    <Text style={addEditModalStyles.uploadButtonText}>
                      {selectedImage ? 'Đổi ảnh khác' : 'Tải lên hình ảnh'}
                    </Text>
                  </TouchableOpacity>
                  {previewImageUri && (
                    <Image
                      source={{uri: previewImageUri}}
                      style={addEditModalStyles.previewImage}
                    />
                  )}
                </View>
              </View>

              {/* Trường số lượng bài học đã bị bỏ theo DTO */}

              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Cấp độ<Text style={addEditModalStyles.requiredStar}>*</Text>
                </Text>
                <View style={addEditModalStyles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedLevelIdValue}
                    onValueChange={itemValue =>
                      setSelectedLevelIdValue(itemValue)
                    }
                    style={addEditModalStyles.picker}
                    itemStyle={addEditModalStyles.pickerItem}
                    mode="dropdown"
                    enabled={availableLevels.length > 0}>
                    {availableLevels.length === 0 && (
                      <Picker.Item
                        label="Đang tải cấp độ..."
                        value={undefined}
                      />
                    )}
                    {availableLevels.map(level => (
                      <Picker.Item
                        key={level.id}
                        label={level.name}
                        value={String(level.id)}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <TouchableOpacity
                style={addEditModalStyles.submitButton}
                onPress={handleSubmit}>
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
const addEditModalStyles = StyleSheet.create({
  // ... (styles cũ cho modal, backdrop, header, form, input, submit button)
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalViewContainer: {width: '100%', backgroundColor: 'transparent'},
  modalViewContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? SIZES.padding * 2 : SIZES.padding,
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
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
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
    marginRight: 10 /* Khoảng cách với preview */,
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
  previewImage: {
    // Style cho ảnh preview
    width: 50,
    height: 50,
    borderRadius: 5,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: Platform.OS === 'android' ? 'hidden' : undefined,
  },
  picker: {height: Platform.OS === 'ios' ? undefined : 50, width: '100%'},
  pickerItem: {},
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

// --- Component HocTapScreen ---
const HocTapScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCourseFormModalVisible, setIsCourseFormModalVisible] =
    useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingCourse, setCurrentEditingCourse] =
    useState<Course | null>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingCourseCode, setDeletingCourseCode] = useState<string | null>(
    null,
  );

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<LevelOption[]>([]); // State cho danh sách level từ API

  const getToken = async () => {
    /* ... giữ nguyên ... */ const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Lỗi', 'Token không tồn tại.');
      logout();
      throw new Error('Token not found');
    }
    return token;
  };
  const mapApiTopicToCourse = (apiTopic: ApiAdminTopic): Course => ({
    /* ... giữ nguyên ... */ topic_code: String(apiTopic.id),
    title: apiTopic.name,
    imageUrl: apiTopic.avatarUrl || COURSE_LIST_ITEM_ICON,
    levelCode: `Cấp độ ${apiTopic.levelId}`,
    quantityLesson: 0,
    originalLevelId: apiTopic.levelId,
  });

  const fetchTopics = useCallback(
    async (keyword?: string) => {
      /* ... giữ nguyên ... */
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const url = keyword
          ? `${API_ADMIN_TOPIC_URL}/search?keyword=${encodeURIComponent(
              keyword,
            )}`
          : API_ADMIN_TOPIC_URL;
        const response = await axios.get<ApiAdminTopic[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const mappedCourses = (response.data || []).map(mapApiTopicToCourse);
        if (!keyword) setCourses(mappedCourses);
        setFilteredCourses(mappedCourses);
      } catch (apiError: any) {
        const errorMessage =
          apiError.response?.data?.message || 'Không thể tải danh sách chủ đề.';
        setError(errorMessage);
        if (!keyword) setCourses([]);
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    },
    [logout],
  );

  // Fetch danh sách tất cả level để truyền vào modal
  const fetchAllAvailableLevels = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await axios.get<LevelOption[]>(API_LEVEL_LIST_URL, {
        // API lấy danh sách level
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.data && Array.isArray(response.data)) {
        setAvailableLevels(
          response.data.map(level => ({
            id: Number(level.id),
            name: level.name,
          })),
        );
      } else {
        setAvailableLevels([]);
        showMessage({
          message: 'Không tải được danh sách cấp độ.',
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('HocTapScreen: Lỗi fetchAllAvailableLevels:', error);
      setAvailableLevels([]);
      showMessage({message: 'Lỗi tải danh sách cấp độ.', type: 'danger'});
    }
  }, [logout]);

  useEffect(() => {
    fetchTopics();
    fetchAllAvailableLevels(); // Gọi khi component mount
  }, [fetchTopics, fetchAllAvailableLevels]);

  useEffect(() => {
    /* ... useEffect cho search giữ nguyên ... */
    const timerId = setTimeout(() => {
      if (searchQuery.trim() === '') setFilteredCourses(courses);
      else fetchTopics(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchQuery, courses, fetchTopics]);

  const handleAddNewCourse = () => {
    setModalMode('add');
    setCurrentEditingCourse(null);
    // Đảm bảo đã fetch availableLevels trước khi mở modal
    if (availableLevels.length === 0) fetchAllAvailableLevels();
    setIsCourseFormModalVisible(true);
  };
  const handleEditCourse = (course: Course) => {
    setModalMode('edit');
    setCurrentEditingCourse(course);
    if (availableLevels.length === 0) fetchAllAvailableLevels();
    setIsCourseFormModalVisible(true);
  };

  // <<<<< SỬA ĐỔI HÀM NÀY ĐỂ GỌI API THÊM/SỬA TOPIC >>>>>
  const handleCourseFormSubmit = useCallback(
    async (formDataWithFile: FormData, topicIdToUpdate?: string) => {
      setIsLoading(true); // Có thể thêm state isLoading cho modal submit
      try {
        const token = await getToken();
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        let response;

        if (modalMode === 'add') {
          console.log('HocTapScreen: Gọi API Create Topic', formDataWithFile);
          response = await axios.post(
            `${API_ADMIN_TOPIC_URL}/create`,
            formDataWithFile,
            config,
          );
          showMessage({message: `Đã thêm chủ đề thành công!`, type: 'success'});
        } else if (modalMode === 'edit' && topicIdToUpdate) {
          // API update của bạn là .../update, không có id trong path
          // Giả định ID của topic cần update đã được thêm vào FormData với key 'id'
          // Nếu không, bạn cần gửi ID qua query param hoặc backend phải có cách nhận diện
          formDataWithFile.append('id', topicIdToUpdate); // Gửi ID topic để update
          console.log(
            'HocTapScreen: Gọi API Update Topic ID:',
            topicIdToUpdate,
            formDataWithFile,
          );
          response = await axios.put(
            `${API_ADMIN_TOPIC_URL}/update`,
            formDataWithFile,
            config,
          );
          showMessage({
            message: `Đã cập nhật chủ đề thành công!`,
            type: 'success',
          });
        } else {
          throw new Error(
            'Chế độ không hợp lệ hoặc thiếu ID chủ đề để cập nhật.',
          );
        }

        console.log(
          'HocTapScreen: Phản hồi từ API Create/Update:',
          response.data,
        );
        fetchTopics(); // Tải lại danh sách topics
        setIsCourseFormModalVisible(false);
        setCurrentEditingCourse(null);
      } catch (apiError: any) {
        console.error(
          'HocTapScreen: Lỗi khi thêm/sửa chủ đề:',
          apiError.response?.data || apiError.message || apiError,
        );
        const errorMessage =
          apiError.response?.data?.message ||
          `Không thể ${modalMode === 'add' ? 'thêm' : 'cập nhật'} chủ đề.`;
        Alert.alert(
          `Lỗi ${modalMode === 'add' ? 'thêm' : 'cập nhật'}`,
          errorMessage,
        );
      } finally {
        setIsLoading(false); // Tắt loading của modal submit nếu có
      }
    },
    [modalMode, getToken, fetchTopics, logout],
  );

  const performDeleteCourse = useCallback(
    async (courseCode: string) => {
      /* ... giữ nguyên ... */
      setDeletingCourseCode(courseCode);
      setError(null);
      try {
        const token = await getToken();
        const topicIdToDelete = courseCode;
        await axios.delete(
          `${API_ADMIN_TOPIC_URL}/delete?id=${topicIdToDelete}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        setCourses(prev => prev.filter(c => c.topic_code !== courseCode));
        setFilteredCourses(prev =>
          prev.filter(c => c.topic_code !== courseCode),
        );
        showMessage({message: 'Đã xóa chủ đề thành công!', type: 'success'});
      } catch (apiError: any) {
        const errorMessage =
          apiError.response?.data?.message || 'Không thể xóa chủ đề.';
        Alert.alert('Lỗi xóa chủ đề', errorMessage);
      } finally {
        setDeletingCourseCode(null);
      }
    },
    [getToken, logout],
  );

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  }, []);
  const handleDeleteModalConfirm = useCallback(() => {
    if (itemToDelete) performDeleteCourse(itemToDelete.id);
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
  }, [logout]);
  const renderCourseItem = useCallback(
    /* ... giữ nguyên ... */ ({item}: {item: Course}) => (
      <TouchableOpacity
        style={styles.courseItem}
        onPress={() => {
          navigation.navigate('LessonAdmin', {
            topic_code: item.topic_code,
            title: item.title,
          });
        }}
        activeOpacity={0.7}>
        <Image
          source={item.imageUrl ? {uri: item.imageUrl} : COURSE_LIST_ITEM_ICON}
          style={styles.courseItemIcon}
        />
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
              e.stopPropagation();
              handleEditCourse(item);
            }}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
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
    [handleDeleteCoursePress, deletingCourseCode, handleEditCourse, navigation],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header, SearchBar, Nút Thêm Mới, List, Modals giữ nguyên */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} disabled>
          <Image
            source={LOGO_ICON}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Chủ Đề</Text>
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
          placeholder="Tìm chủ đề theo tên, cấp độ..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
          clearButtonMode="while-editing"
        />
      </View>
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewCourse}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới chủ đề</Text>
        </TouchableOpacity>
      </View>
      {isLoading && filteredCourses.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chủ đề...</Text>
        </View>
      )}
      {!isLoading && error && filteredCourses.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchTopics(searchQuery.trim() || undefined)}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading && !error && filteredCourses.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            {searchQuery.trim() !== ''
              ? `Không tìm thấy kết quả cho "${searchQuery}"`
              : 'Chưa có chủ đề nào.'}
          </Text>
        </View>
      )}
      {filteredCourses.length > 0 && (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.topic_code}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}
      {isLoading && filteredCourses.length > 0 && (
        <ActivityIndicator
          style={styles.inlineSpinner}
          size="small"
          color={COLORS.primary}
        />
      )}
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
          <View
            style={profileMenuStyles.menuViewWrapper}
            onStartShouldSetResponder={() => true}>
            <View style={profileMenuStyles.menuContainer}>
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
            </View>
          </View>
        </Pressable>
      </Modal>
      <AddEditCourseModal
        visible={isCourseFormModalVisible}
        mode={modalMode}
        initialData={currentEditingCourse}
        onClose={() => {
          setIsCourseFormModalVisible(false);
          setCurrentEditingCourse(null);
        }}
        onSubmit={handleCourseFormSubmit}
        availableLevels={availableLevels} // << TRUYỀN DANH SÁCH LEVEL XUỐNG
      />
    </SafeAreaView>
  );
};

// --- Styles (styles, profileMenuStyles giữ nguyên) ---
const styles = StyleSheet.create({
  /* ... styles của HocTapScreen ... */
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
    backgroundColor: COLORS.nenItem || '#fff9e6',
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
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: COLORS.lightGray,
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
    marginTop: 20,
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.darkGray || '#888',
    textAlign: 'center',
  },
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: COLORS.gray || '#555'},
  errorText: {
    fontSize: 16,
    color: COLORS.red || 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {color: COLORS.white, fontSize: 16, fontWeight: 'bold'},
  inlineSpinner: {marginVertical: 10},
});
const profileMenuStyles = StyleSheet.create({
  /* ... styles của profileMenu ... */
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuViewWrapper: {position: 'absolute', top: 80, right: 15},
  menuContainer: {
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

export default HocTapScreen;
