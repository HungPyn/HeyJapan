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
import axios, {AxiosRequestConfig} from 'axios';
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

// --- Types & Interfaces (Giữ nguyên) ---
interface ApiAdminTopic {
  id: number;
  levelId: number;
  name: string;
  avatarUrl: string;
  dayCreation: string;
}
interface ClientRequestTopicDTO {
  name: string;
  levelId: number;
  topicID?: number;
}
type Course = {
  topic_code: string;
  title: string;
  imageUrl: string;
  levelCode: string;
  quantityLesson: number;
  originalLevelId?: number;
};
interface LevelOption {
  id: number;
  name: string;
}

const API_ADMIN_BASE_URL = 'http://10.0.2.2:8080/api/admin';
const API_ADMIN_TOPIC_URL = `${API_ADMIN_BASE_URL}/topic`;
const API_PUBLIC_LEVEL_URL = 'http://10.0.2.2:8080/api/public/level';

const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const COURSE_LIST_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const UPLOAD_ICON = require('../../assets/images/upAnh.png');

// --- ConfirmDeleteModal (Giữ nguyên) ---
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
  const msg = itemName
    ? `Bạn có chắc chắn muốn xóa chủ đề "${itemName}" không?`
    : 'Bạn có chắc chắn muốn xóa không?';
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={modalStyles.modalContainer}>
          <Text style={modalStyles.messageText}>{msg}</Text>
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
  /* ... Giữ nguyên styles ... */
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
  onSubmit: (formData: FormData) => Promise<void>;
  availableLevels: LevelOption[];
  isSubmitting: boolean; // << Thêm prop isSubmitting
}
const AddEditCourseModal: React.FC<AddEditCourseModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
  availableLevels,
  isSubmitting, // << Nhận prop isSubmitting
}) => {
  const [title, setTitle] = useState('');
  const [selectedLevelIdValue, setSelectedLevelIdValue] = useState<
    string | undefined
  >(undefined);
  const [selectedImageFile, setSelectedImageFile] = useState<Asset | null>(
    null,
  );
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title);
        setPreviewImageUri(
          initialData.imageUrl.startsWith('http') ? initialData.imageUrl : null,
        );
        setSelectedImageFile(null);
        const currentLevelId = initialData.originalLevelId
          ? String(initialData.originalLevelId)
          : availableLevels[0]?.id
          ? String(availableLevels[0].id)
          : undefined;
        setSelectedLevelIdValue(currentLevelId);
      } else {
        setTitle('');
        setPreviewImageUri(null);
        setSelectedImageFile(null);
        setSelectedLevelIdValue(
          availableLevels[0]?.id ? String(availableLevels[0].id) : undefined,
        );
      }
    }
  }, [visible, mode, initialData, availableLevels]);

  const handleChoosePhoto = useCallback(() => {
    const options: ImageLibraryOptions = {mediaType: 'photo', quality: 0.7};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
      } else if (response.errorCode) {
        showMessage({
          message: `Lỗi chọn ảnh: ${response.errorMessage || 'Không rõ lỗi'}`,
          type: 'danger',
        });
      } else if (response.assets && response.assets[0]) {
        const imageAsset = response.assets[0];
        setSelectedImageFile(imageAsset);
        setPreviewImageUri(imageAsset.uri || null);
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Chặn submit nếu đang xử lý
    if (!title.trim() || !selectedLevelIdValue) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng điền tên chủ đề và chọn cấp độ.',
      );
      return;
    }
    const levelIdNumber = parseInt(selectedLevelIdValue, 10);
    if (isNaN(levelIdNumber)) {
      Alert.alert('Lỗi', 'Cấp độ đã chọn không hợp lệ.');
      return;
    }
    const topicMetaData: ClientRequestTopicDTO = {
      name: title.trim(),
      levelId: levelIdNumber,
    };
    if (mode === 'edit' && initialData?.topic_code) {
      const topicIdParsed = parseInt(initialData.topic_code, 10);
      if (!isNaN(topicIdParsed)) {
        topicMetaData.topicID = topicIdParsed;
      } else {
        Alert.alert('Lỗi', 'ID chủ đề không hợp lệ để cập nhật.');
        return;
      }
    }
    const formData = new FormData();
    formData.append('topicMetaData', JSON.stringify(topicMetaData));
    if (
      selectedImageFile &&
      selectedImageFile.uri &&
      selectedImageFile.fileName &&
      selectedImageFile.type
    ) {
      formData.append('avatarFile', {
        uri: selectedImageFile.uri,
        type: selectedImageFile.type,
        name: selectedImageFile.fileName,
      } as any);
    } else if (mode === 'add') {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng chọn hình đại diện cho chủ đề mới.',
      );
      return;
    }
    await onSubmit(formData);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={addEditModalStyles.backdrop} onPress={onClose}>
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
                onPress={onClose}
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
              {/* ... các input fields ... */}
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Tên chủ đề{' '}
                  <Text style={addEditModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditModalStyles.input}
                  placeholder="Nhập tên chủ đề"
                  value={title}
                  onChangeText={setTitle}
                  editable={!isSubmitting}
                />
              </View>
              <View style={addEditModalStyles.inputGroup}>
                <Text style={addEditModalStyles.label}>
                  Hình đại diện{' '}
                  {mode === 'add' && (
                    <Text style={addEditModalStyles.requiredStar}>*</Text>
                  )}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    style={addEditModalStyles.uploadButton}
                    onPress={handleChoosePhoto}
                    disabled={isSubmitting}>
                    <Image
                      source={UPLOAD_ICON}
                      style={addEditModalStyles.uploadIcon}
                    />
                    <Text style={addEditModalStyles.uploadButtonText}>
                      {previewImageUri || selectedImageFile
                        ? 'Đổi ảnh khác'
                        : 'Tải lên hình ảnh'}
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
                    enabled={availableLevels.length > 0 && !isSubmitting}>
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
                style={[
                  addEditModalStyles.submitButton,
                  isSubmitting && addEditModalStyles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={addEditModalStyles.submitButtonText}>
                    {mode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const HocTapScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading chung cho danh sách
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // << Loading cho Thêm/Sửa
  const [deletingCourseCode, setDeletingCourseCode] = useState<string | null>(
    null,
  ); // << Loading cho Xóa

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
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<LevelOption[]>([]);

  const getToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showMessage({
        message: 'Token không tồn tại. Vui lòng đăng nhập lại.',
        type: 'danger',
      });
      logout();
      throw new Error('Token not found');
    }
    return token;
  }, [logout]);
  const mapApiTopicToCourse = useCallback(
    (apiTopic: ApiAdminTopic): Course => {
      const level = availableLevels.find(l => l.id === apiTopic.levelId);
      return {
        topic_code: String(apiTopic.id),
        title: apiTopic.name,
        imageUrl: apiTopic.avatarUrl || (COURSE_LIST_ITEM_ICON as any),
        levelCode: level ? level.name : `Cấp độ ${apiTopic.levelId}`,
        quantityLesson: 0,
        originalLevelId: apiTopic.levelId,
      };
    },
    [availableLevels],
  );
  const fetchTopics = useCallback(
    async (keyword?: string) => {
      setIsLoading(true);
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
        if (!keyword) {
          setCourses(mappedCourses);
        }
        setFilteredCourses(mappedCourses);
      } catch (apiError: any) {
        const errorMessage =
          apiError.response?.data?.message ||
          apiError.response?.data ||
          'Không thể tải danh sách chủ đề.';
        showMessage({message: errorMessage, type: 'danger'});
        if (!keyword) {
          setCourses([]);
        }
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    },
    [getToken, mapApiTopicToCourse],
  );
  const fetchAllAvailableLevels = useCallback(async () => {
    try {
      const response = await axios.get<LevelOption[]>(API_PUBLIC_LEVEL_URL);
      if (response.data && Array.isArray(response.data)) {
        setAvailableLevels(
          response.data
            .map(level => ({id: Number(level.id), name: level.name}))
            .sort((a, b) => a.id - b.id),
        );
      } else {
        setAvailableLevels([]);
        showMessage({
          message: 'Không tải được danh sách cấp độ.',
          type: 'warning',
        });
      }
    } catch (error: any) {
      console.error('HocTapScreen: Lỗi fetchAllAvailableLevels:', error);
      setAvailableLevels([]);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Lỗi tải danh sách cấp độ.';
      showMessage({message: message, type: 'danger'});
    }
  }, []);
  useEffect(() => {
    fetchAllAvailableLevels();
  }, [fetchAllAvailableLevels]);
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredCourses(courses);
      } else {
        if (searchQuery.trim()) {
          fetchTopics(searchQuery.trim());
        }
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchQuery, courses, fetchTopics]);
  const handleAddNewCourse = useCallback(() => {
    setModalMode('add');
    setCurrentEditingCourse(null);
    if (availableLevels.length === 0) {
      fetchAllAvailableLevels();
    }
    setIsCourseFormModalVisible(true);
  }, [availableLevels, fetchAllAvailableLevels]);
  const handleEditCourse = useCallback(
    (course: Course) => {
      setModalMode('edit');
      setCurrentEditingCourse(course);
      if (availableLevels.length === 0) {
        fetchAllAvailableLevels();
      }
      setIsCourseFormModalVisible(true);
    },
    [availableLevels, fetchAllAvailableLevels],
  );

  const handleCourseFormSubmit = useCallback(
    async (formData: FormData) => {
      setIsSubmittingForm(true); // << Bắt đầu loading cho form
      let url = '';
      let httpMethod: 'POST' | 'PUT' = 'POST';
      let successMessage = '';

      try {
        const token = await getToken();
        const fetchOptions: RequestInit = {
          method: httpMethod,
          headers: {Authorization: `Bearer ${token}`},
          body: formData,
        };

        if (modalMode === 'add') {
          url = `${API_ADMIN_TOPIC_URL}/create`;
          fetchOptions.method = 'POST';
          successMessage = 'Thêm chủ đề thành công!';
        } else {
          url = `${API_ADMIN_TOPIC_URL}/update`;
          fetchOptions.method = 'PUT';
          successMessage = 'Cập nhật chủ đề thành công!';
        }

        console.log(`Gọi API (fetch): ${fetchOptions.method} ${url}`);
        const httpResponse = await fetch(url, fetchOptions);

        if (!httpResponse.ok) {
          let errorDataText = `Lỗi server: ${httpResponse.status}`;
          try {
            const errorText = await httpResponse.text();
            try {
              const errorJson = JSON.parse(errorText);
              errorDataText = errorJson.message || errorJson.error || errorText;
            } catch (e) {
              errorDataText = errorText || errorDataText;
            }
          } catch (e) {
            console.error('Không thể đọc body lỗi từ response', e);
          }
          console.error(
            `Lỗi HTTP từ server (fetch): ${httpResponse.status}`,
            errorDataText,
          );
          throw new Error(errorDataText);
        }

        const responseData = await httpResponse.json();
        console.log('Phản hồi API (fetch):', responseData);
        showMessage({message: successMessage, type: 'success'});
        fetchTopics();
        setIsCourseFormModalVisible(false);
        setCurrentEditingCourse(null);
      } catch (error: any) {
        console.error(
          `HocTapScreen: Lỗi khi ${
            modalMode === 'add' ? 'thêm' : 'sửa'
          } chủ đề (fetch):`,
          error,
        );
        let errorMessage = `Lỗi ${
          modalMode === 'add' ? 'thêm' : 'cập nhật'
        } chủ đề.`;
        if (error.message) {
          if (
            error.message.toLowerCase().includes('network request failed') ||
            error.message.toLowerCase().includes('failed to connect') ||
            error.message
              .toLowerCase()
              .includes('typeerror: network request failed')
          ) {
            errorMessage =
              'Lỗi mạng hoặc không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.';
          } else {
            errorMessage = error.message;
          }
        }
        showMessage({message: errorMessage, type: 'danger', duration: 7000});
      } finally {
        setIsSubmittingForm(false); // << Kết thúc loading cho form
      }
    },
    [modalMode, getToken, fetchTopics],
  );

  const performDeleteCourse = useCallback(
    async (topicId: string) => {
      setDeletingCourseCode(topicId); // << Bắt đầu loading cho item này
      try {
        const token = await getToken();
        const response = await axios.delete(
          `${API_ADMIN_TOPIC_URL}/delete?id=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}, responseType: 'text'},
        );
        showMessage({
          message: response.data || 'Xóa chủ đề thành công!',
          type: 'success',
        });
        fetchTopics();
      } catch (apiError: any) {
        console.error(
          'HocTapScreen: Lỗi khi xóa chủ đề:',
          apiError.response?.data || apiError.message,
        );
        let errorMessage = 'Không thể xóa chủ đề. Vui lòng thử lại.';
        if (apiError.response) {
          if (typeof apiError.response.data === 'string') {
            errorMessage = apiError.response.data;
          } else if (
            apiError.response.data &&
            (apiError.response.data.message || apiError.response.data.error)
          ) {
            errorMessage =
              apiError.response.data.message || apiError.response.data.error;
          }
        } else {
          errorMessage = apiError.message || errorMessage;
        }
        showMessage({message: errorMessage, type: 'danger'});
      } finally {
        setDeletingCourseCode(null); // << Kết thúc loading cho item này
      }
    },
    [getToken, fetchTopics],
  );

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

  const renderCourseItem = useCallback(
    ({item}: {item: Course}) => (
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
          source={
            item.imageUrl &&
            item.imageUrl !== (COURSE_LIST_ITEM_ICON as any) &&
            item.imageUrl.startsWith('http')
              ? {uri: item.imageUrl}
              : COURSE_LIST_ITEM_ICON
          }
          style={styles.courseItemIcon}
          onError={e =>
            console.log(
              'Lỗi tải ảnh chủ đề:',
              item.imageUrl,
              e.nativeEvent.error,
            )
          }
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
            disabled={deletingCourseCode === item.topic_code} // << Sử dụng deletingCourseCode
          >
            {deletingCourseCode === item.topic_code ? ( // << Hiển thị loading cho item đang xóa
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
    [deletingCourseCode, handleEditCourse, handleDeleteCoursePress, navigation], // << Thêm deletingCourseCode
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={SEARCH_ICON}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm chủ đề theo tên..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
          clearButtonMode="while-editing"
        />
      </View>
      {/* Add New Button */}
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewCourse}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới chủ đề</Text>
        </TouchableOpacity>
      </View>

      {/* Loading or Empty List */}
      {isLoading && filteredCourses.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải chủ đề...</Text>
        </View>
      )}
      {!isLoading && filteredCourses.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            {searchQuery.trim() !== ''
              ? `Không tìm thấy kết quả cho "${searchQuery}"`
              : 'Chưa có chủ đề nào.'}
          </Text>
        </View>
      )}

      {/* Course List */}
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

      {/* Modals */}
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
        availableLevels={availableLevels}
        isSubmitting={isSubmittingForm} // << Truyền prop isSubmitting
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background || '#FFFFFF'},
  header: {
    paddingTop: 30, // Giữ nguyên
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    height: 90, // Giữ nguyên
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
});
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuViewWrapper: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 80,
    right: 15,
  },
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
const addEditModalStyles = StyleSheet.create({
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
    marginRight: 10,
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
  submitButtonDisabled: {backgroundColor: COLORS.gray}, // << Thêm style cho nút bị vô hiệu hóa
});

export default HocTapScreen;
