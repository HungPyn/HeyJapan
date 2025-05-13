// screens/admin/ContentAdminScreen.tsx
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
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import {COLORS} from '../../constants/theme'; // CẬP NHẬT ĐƯỜNG DẪN
import {useAuth} from '../auth/AuthContext'; // CẬP NHẬT ĐƯỜNG DẪN
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation'; // CẬP NHẬT ĐƯỜNG DẪN

// --- BEGIN: Dữ liệu và Type cho Nội dung Bài học ---
type Skill = {
  skill_code: number;
  skill_name: string;
};

type OptionItem = {
  id: string;
  text: string;
};

type LessonContentItem = {
  content_code: number;
  content_type: 'voice' | 'select' | 'sapXep' | string;
  title: string;
  content_detail: string;
  audio_url?: string | null;
  image_url?: string | null;
  display_order: number;
  lesson_code: number;
  skill_code: Skill; // Đây là Skill object
  options?: OptionItem[];
  correct_answer?: string | string[];
};

// DANH SÁCH KỸ NĂNG ĐỊNH NGHĨA TRƯỚC
const PREDEFINED_SKILLS: Skill[] = [
  {skill_code: 1, skill_name: 'Nghe'},
  {skill_code: 2, skill_name: 'Nói'},
  {skill_code: 3, skill_name: 'Đọc'},
  {skill_code: 4, skill_name: 'Viết'},
  {skill_code: 5, skill_name: 'Ngữ pháp'},
  {skill_code: 6, skill_name: 'Từ vựng'},
  // Thêm các skill khác nếu cần
];

// Dữ liệu mẫu (Thay thế bằng API call)
const allLessonContentsData: LessonContentItem[] = [
  {
    content_code: 3,
    content_type: 'voice',
    title: 'Luyện phát âm: あ, い, う',
    content_detail: 'Ghi âm và luyện phát âm...',
    audio_url: null,
    image_url: 'https://i.imgur.com/R8WeIEv.jpeg',
    display_order: 1,
    lesson_code: 3,
    skill_code: {skill_code: 2, skill_name: 'Nói'},
  },
  {
    content_code: 5,
    content_type: 'select',
    title: 'こんにちは',
    content_detail: 'こんにちは (Konnichiwa)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 2,
    lesson_code: 3,
    skill_code: {skill_code: 3, skill_name: 'Đọc'},
    options: [
      {id: 'a', text: 'Chào buổi sáng'},
      {id: 'b', text: 'Tạm biệt'},
      {id: 'c', text: 'Xin chào (ban ngày/chiều)'},
      {id: 'd', text: 'Cảm ơn'},
    ],
    correct_answer: 'c',
  },
  // ... (các dữ liệu mẫu khác)
];
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh Icons ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const CONTENT_ITEM_ICON = require('../../assets/images/ngoiSao.png');
// --- END: Đường dẫn tới ảnh ---

// --- ConfirmDeleteModal (Giữ nguyên, không thay đổi) ---
// ... code ConfirmDeleteModal và confirmModalStyles của bạn ...
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
      <Pressable style={confirmModalStyles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={confirmModalStyles.modalContainer}>
          <Text style={confirmModalStyles.messageText}>
            {confirmationMessage}
          </Text>
          <View style={confirmModalStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                confirmModalStyles.button,
                confirmModalStyles.cancelButton,
              ]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text
                style={[
                  confirmModalStyles.buttonText,
                  confirmModalStyles.cancelButtonText,
                ]}>
                Không
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                confirmModalStyles.button,
                confirmModalStyles.confirmButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}>
              <Text
                style={[
                  confirmModalStyles.buttonText,
                  confirmModalStyles.confirmButtonText,
                ]}>
                Có
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const confirmModalStyles = StyleSheet.create({
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
    justifyContent: 'space-around',
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
  confirmButton: {backgroundColor: COLORS.primary || '#FFC107'},
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primary ? COLORS.white : '#333333'},
});

// --- BEGIN: CẬP NHẬT AddEditContentModal ---
interface AddEditContentModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: LessonContentItem | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      LessonContentItem,
      'content_code' | 'lesson_code' | 'options' | 'correct_answer'
    >,
  ) => void;
}

const AddEditContentModal: React.FC<AddEditContentModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<'selectSkill' | 'fillForm'>('fillForm');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [contentDetail, setContentDetail] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  // skillCodeVal và skillName sẽ được tự động điền sau khi chọn skill hoặc từ initialData
  const [skillCodeVal, setSkillCodeVal] = useState('');
  const [skillName, setSkillName] = useState('');

  const resetFormFields = () => {
    setTitle('');
    setContentType('');
    setContentDetail('');
    setAudioUrl('');
    setImageUrl('');
    setDisplayOrder('');
    setSkillCodeVal('');
    setSkillName('');
    setSelectedSkill(null); // Reset cả skill đã chọn
  };

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setStep('fillForm'); // Chỉnh sửa thì vào form luôn
        setSelectedSkill(initialData.skill_code);
        setTitle(initialData.title);
        setContentType(initialData.content_type);
        setContentDetail(initialData.content_detail || '');
        setAudioUrl(initialData.audio_url || '');
        setImageUrl(initialData.image_url || '');
        setDisplayOrder(initialData.display_order.toString());
        setSkillCodeVal(initialData.skill_code.skill_code.toString());
        setSkillName(initialData.skill_code.skill_name);
      } else if (mode === 'add') {
        resetFormFields();
        setStep('selectSkill'); // Thêm mới thì bắt đầu từ chọn skill
      }
    } else {
      // Khi modal đóng, reset step về mặc định cho lần mở sau (nếu là add)
      if (mode === 'add') {
        setStep('selectSkill');
        resetFormFields(); // Đảm bảo reset khi đóng modal ở chế độ add
      }
    }
  }, [visible, mode, initialData]);

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillCodeVal(skill.skill_code.toString());
    setSkillName(skill.skill_name);
    setStep('fillForm'); // Chuyển sang bước điền form
  };

  const handleSubmit = () => {
    if (!selectedSkill) {
      // Kiểm tra lại đã chọn skill chưa (quan trọng cho mode 'add')
      Alert.alert('Lỗi', 'Vui lòng chọn kỹ năng trước.');
      setStep('selectSkill'); // Quay lại bước chọn skill nếu chưa có
      return;
    }
    if (
      !title.trim() ||
      !contentType.trim() ||
      !displayOrder.trim() ||
      !contentDetail.trim()
    ) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng điền đầy đủ các trường Tiêu đề, Loại ND, Chi tiết ND, Thứ tự (*).',
      );
      return;
    }
    // Các trường skill_code và skill_name đã được set từ selectedSkill hoặc initialData
    // nên không cần kiểm tra trim() cho skillCodeVal và skillName nữa nếu chúng là read-only
    // Nếu chúng vẫn editable, thì vẫn cần kiểm tra như cũ.

    const numDisplayOrder = parseInt(displayOrder, 10);
    if (isNaN(numDisplayOrder) || numDisplayOrder <= 0) {
      Alert.alert(
        'Thứ tự không hợp lệ',
        'Thứ tự hiển thị phải là một số dương.',
      );
      return;
    }

    // skill_code đã có từ selectedSkill
    const numSkillCode = selectedSkill.skill_code;

    onSubmit({
      title: title.trim(),
      content_type: contentType.trim(),
      content_detail: contentDetail.trim(),
      audio_url: audioUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      display_order: numDisplayOrder,
      skill_code: selectedSkill, // Truyền cả object Skill đã chọn
    });
  };

  const handleAttemptCloseModal = () => {
    onClose(); // Logic reset form đã được chuyển vào useEffect khi visible=false
  };

  const handleGoBackToSkillSelect = () => {
    resetFormFields();
    setStep('selectSkill');
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
              {mode === 'add' && step === 'fillForm' ? ( // Nút back chỉ hiển thị ở bước điền form của mode 'add'
                <TouchableOpacity
                  onPress={handleGoBackToSkillSelect}
                  style={formModalStyles.backButton}>
                  <Image
                    source={BACK_ARROW_ICON}
                    style={formModalStyles.backIcon}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleAttemptCloseModal}
                  style={formModalStyles.backButton}>
                  <Image
                    source={BACK_ARROW_ICON}
                    style={formModalStyles.backIcon}
                  />
                </TouchableOpacity>
              )}
              <Text style={formModalStyles.headerTitle}>
                {mode === 'add'
                  ? step === 'selectSkill'
                    ? 'Chọn Kỹ Năng'
                    : `Thêm Nội Dung (${selectedSkill?.skill_name || ''})`
                  : `Chỉnh Sửa Nội Dung (${
                      initialData?.skill_code.skill_name || ''
                    })`}
              </Text>
              <View style={{width: 30}} />
            </View>

            {step === 'selectSkill' && mode === 'add' ? (
              <ScrollView style={formModalStyles.formContainer}>
                <Text style={formModalStyles.label}>
                  Chọn một kỹ năng để tiếp tục:
                </Text>
                {PREDEFINED_SKILLS.map(skill => (
                  <TouchableOpacity
                    key={skill.skill_code}
                    style={formModalStyles.skillSelectionButton}
                    onPress={() => handleSkillSelect(skill)}>
                    <Text style={formModalStyles.skillSelectionButtonText}>
                      {skill.skill_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              // Bước điền form (cho cả add sau khi chọn skill và edit)
              <ScrollView
                style={formModalStyles.formContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>Kỹ năng</Text>
                  <TextInput
                    style={[formModalStyles.input, styles.readOnlyInput]} // Thêm style cho readOnly
                    value={skillName} // Lấy từ state skillName
                    editable={false} // Không cho sửa trực tiếp ở đây
                  />
                  {/* TextInput ẩn cho skill_code_val nếu cần gửi riêng */}
                  {/* <TextInput style={{display: 'none'}} value={skillCodeVal} /> */}
                </View>

                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>
                    Tiêu đề <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="Nhập tiêu đề"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>
                    Loại nội dung
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="vd: voice, select, sapXep"
                    value={contentType}
                    onChangeText={setContentType}
                    autoCapitalize="none"
                  />
                </View>
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>
                    Chi tiết nội dung
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      formModalStyles.input,
                      {height: 80, textAlignVertical: 'top'},
                    ]}
                    placeholder="Mô tả chi tiết, câu hỏi,..."
                    value={contentDetail}
                    onChangeText={setContentDetail}
                    multiline
                  />
                </View>
                {/* Các trường còn lại giữ nguyên */}
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>Audio URL</Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="https://example.com/audio.mp3"
                    value={audioUrl}
                    onChangeText={setAudioUrl}
                  />
                </View>
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>Image URL</Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                  />
                </View>
                <View style={formModalStyles.inputGroup}>
                  <Text style={formModalStyles.label}>
                    Thứ tự hiển thị
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="Nhập số thứ tự"
                    value={displayOrder}
                    onChangeText={setDisplayOrder}
                    keyboardType="number-pad"
                  />
                </View>
                {/* Không cần input cho skill_code và skill_name nữa vì đã chọn ở bước trước hoặc là edit */}

                <TouchableOpacity
                  style={formModalStyles.submitButton}
                  onPress={handleSubmit}>
                  <Text style={formModalStyles.submitButtonText}>
                    {mode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Cập nhật formModalStyles để thêm style cho skill selection
const formModalStyles = StyleSheet.create({
  // ... (các style cũ của formModalStyles)
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  }, // Tăng padding bottom
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: -30,
  }, // Căn giữa tiêu đề
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: Platform.OS === 'ios' ? 550 : 500,
  }, // Giới hạn chiều cao tối đa
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
  // Styles mới cho skill selection
  skillSelectionButton: {
    backgroundColor: COLORS.lightGray || '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  skillSelectionButtonText: {
    fontSize: 16,
    color: COLORS.darkGray || '#333',
    fontWeight: '500',
  },
});
// --- END: AddEditContentModal ---

// --- BEGIN: Component ContentAdminScreen ---
// ... (type ContentAdminScreenRouteProp, ContentAdminScreenNavigationProp giữ nguyên)
type ContentAdminScreenRouteProp = RouteProp<
  RootStackParamList,
  'ContentAdmin'
>;
type ContentAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ContentAdmin'
>;

const ContentAdminScreen = () => {
  const route = useRoute<ContentAdminScreenRouteProp>();
  const navigation = useNavigation<ContentAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {lesson_code: currentLessonCode, lesson_name: currentLessonName} =
    route.params;

  const [contents, setContents] = useState<LessonContentItem[]>([]);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletingItemCode, setDeletingItemCode] = useState<number | null>(null);

  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingItem, setCurrentEditingItem] =
    useState<LessonContentItem | null>(null);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  useEffect(() => {
    const filteredContents = allLessonContentsData
      .filter(content => content.lesson_code === currentLessonCode)
      .sort((a, b) => a.display_order - b.display_order);
    setContents(filteredContents);
  }, [currentLessonCode]);

  const handleLogoutFromMenu = useCallback(async () => {
    /* ... giữ nguyên ... */ setIsProfileMenuVisible(false);
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout(); /* navigation.replace('Login'); */
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout, navigation]);
  const performDeleteItem = useCallback(async (contentCode: number) => {
    /* ... giữ nguyên ... */ setDeletingItemCode(contentCode);
    await new Promise(resolve => setTimeout(resolve, 500));
    setContents(prev => prev.filter(item => item.content_code !== contentCode));
    setDeletingItemCode(null);
    Alert.alert('Thành công', 'Đã xóa nội dung bài học.');
  }, []);
  const handleCloseDeleteConfirm = useCallback(() => {
    /* ... giữ nguyên ... */ setIsDeleteConfirmVisible(false);
    setItemToDelete(null);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    /* ... giữ nguyên ... */ if (itemToDelete) {
      performDeleteItem(itemToDelete.id);
    }
    handleCloseDeleteConfirm();
  }, [itemToDelete, performDeleteItem, handleCloseDeleteConfirm]);
  const handleDeletePress = useCallback(
    (contentCode: number, title: string) => {
      /* ... giữ nguyên ... */ Keyboard.dismiss();
      setItemToDelete({id: contentCode, name: title});
      setIsDeleteConfirmVisible(true);
    },
    [],
  );

  const handleAddNewItem = () => {
    setModalMode('add');
    setCurrentEditingItem(null); // Đảm bảo không có initialData khi thêm mới
    setIsAddEditModalVisible(true);
  };

  const handleEditItem = (item: LessonContentItem) => {
    setModalMode('edit');
    setCurrentEditingItem(item);
    setIsAddEditModalVisible(true);
  };

  const handleFormSubmit = useCallback(
    (
      formData: Omit<
        LessonContentItem,
        'content_code' | 'lesson_code' | 'options' | 'correct_answer'
      >,
    ) => {
      if (modalMode === 'add') {
        const newItem: LessonContentItem = {
          ...formData, // formData đã bao gồm skill_code object đúng
          content_code: Date.now(),
          lesson_code: currentLessonCode,
        };
        setContents(prev =>
          [...prev, newItem].sort((a, b) => a.display_order - b.display_order),
        );
        Alert.alert('Thành công', `Đã thêm nội dung "${newItem.title}"!`);
      } else if (modalMode === 'edit' && currentEditingItem) {
        setContents(prev =>
          prev
            .map(item =>
              item.content_code === currentEditingItem.content_code
                ? {...currentEditingItem, ...formData} // formData đã bao gồm skill_code object đúng
                : item,
            )
            .sort((a, b) => a.display_order - b.display_order),
        );
        Alert.alert('Thành công', `Đã cập nhật nội dung "${formData.title}"!`);
      }
      setIsAddEditModalVisible(false);
      setCurrentEditingItem(null);
    },
    [modalMode, currentEditingItem, currentLessonCode],
  );

  const renderContentItem = useCallback(
    ({item}: {item: LessonContentItem}) => (
      <View style={styles.listItem}>
        <Image source={CONTENT_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={1}>
            {item.display_order}. {item.title}
          </Text>
          <Text style={styles.itemDetailText} numberOfLines={1}>
            Loại: {item.content_type} - Skill: {item.skill_code.skill_name}
            {/* Giờ đây skill_code là object */}
          </Text>
          {item.content_detail && (
            <Text style={styles.itemDetailExtraText} numberOfLines={2}>
              {item.content_detail}
            </Text>
          )}
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePress(item.content_code, item.title)}
            disabled={deletingItemCode === item.content_code}>
            {deletingItemCode === item.content_code ? (
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
    [deletingItemCode, handleEditItem, handleDeletePress], // Thêm handleEditItem và handleDeletePress vào dependencies
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ... StatusBar, mainHeader, subHeader, addNewButtonContainer, FlatList, Modals ... (Giữ nguyên) */}
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.primary}
      />
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
          {currentLessonName || 'Nội dung bài học'}
        </Text>
        <View style={{width: 30}} />
      </View>
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewItem}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm nội dung</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={contents}
        renderItem={renderContentItem}
        keyExtractor={item => `content-${item.content_code.toString()}`}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Bài học này chưa có nội dung nào.
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />
      <ConfirmDeleteModal
        visible={isDeleteConfirmVisible}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name ?? null}
        itemType="Nội dung bài học"
      />
      <AddEditContentModal
        visible={isAddEditModalVisible}
        mode={modalMode}
        initialData={currentEditingItem}
        onClose={() => {
          setIsAddEditModalVisible(false);
          setCurrentEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
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
// --- END: Component ContentAdminScreen ---

// --- BEGIN: Styles cho ContentAdminScreen ---
const styles = StyleSheet.create({
  // ... (styles.safeArea -> styles.emptyListText giữ nguyên)
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

    borderBottomColor: COLORS.lightGray || '#ECECEC',
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {
    width: 20,
    height: 20,
    tintColor: COLORS.black || '#333333',
  },
  topicTitleStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'left',
  },
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginVertical: 12,
  },
  addNewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    height: 39,
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
    width: 24,
    height: 24,
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
  itemDetailText: {fontSize: 13, color: '#777777', marginBottom: 2},
  itemDetailExtraText: {fontSize: 12, color: '#888888', fontStyle: 'italic'},
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

  // Style mới cho input chỉ đọc (nếu cần)
  readOnlyInput: {
    backgroundColor: COLORS.lightGray || '#e9ecef', // Màu nền khác để chỉ ra là read-only
    color: COLORS.darkGray || '#495057', // Màu chữ khác
  },
});

const profileMenuStyles = StyleSheet.create({
  // ... (profileMenuStyles giữ nguyên)
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
// --- END: Styles ---

export default ContentAdminScreen;
