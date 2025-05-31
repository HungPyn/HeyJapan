// src/screens/admin/LessonAdminScreen.tsx
import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {Picker} from '@react-native-picker/picker';
import {showMessage} from 'react-native-flash-message';
import {
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {Video, VideoRef, OnLoadData} from 'react-native-video';

// --- Types & Interfaces cho Bài học (Lesson) ---
interface ApiLesson {
  id: number;
  name: string;
}

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

// --- Types & Interfaces cho Câu hỏi Kiểm tra (ExamQuestion) ---
interface ApiExamQuestionChoice {
  id: number;
  textForeign: string;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null;
  textBlock?: string | null;
  isCorrect: boolean | number | null;
}
interface ApiExamQuestion {
  id: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audioUrlExam: string | null;
  questionChoices: ApiExamQuestionChoice[];
  topicId?: number;
}

interface RequestExamChoiceDTOForJson {
  id?: number;
  textForeign: string;
  textRomaji?: string | null;
  audioUrlForeign: string | null;
  textBlock: string;
  isCorrect: boolean;
}
interface RequestExamQuestionDTOForJson {
  topicId: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audioUrlExam: string;
  questionChoices: RequestExamChoiceDTOForJson[];
}

interface EditableExamQuestionChoiceClient {
  clientId: string;
  id?: number;
  textForeign: string;
  textRomaji?: string | null;
  imageUrl: string | null;
  imageFile?: Asset | null;
  audioUrlForeign: string | null;
  textBlock?: string | null;
  isCorrect: boolean | number | null;
  _shuffledTextBlockDisplay?: string;
}

type LessonAdminScreenRouteProp = RouteProp<RootStackParamList, 'LessonAdmin'>;
type LessonAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LessonAdmin'
>;

const API_ADMIN_LESSON_URL = 'http://10.0.2.2:8080/api/admin/lesson';
const API_ADMIN_EXAM_URL = 'http://10.0.2.2:8080/api/admin/exam';

const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const LESSON_ITEM_ICON = require('../../assets/images/ngoiSao.png');

const UPLOAD_ICON_MODAL = require('../../assets/images/upAnh.png');
const AUDIO_PLAY_ICON_MODAL = require('../../assets/images/audioInconten.png');
const DELETE_CHOICE_ICON = require('../../assets/images/iconThungRac.png');

// THAY ĐỔI: Cập nhật QUESTION_TYPE_OPTIONS_EXAM
const QUESTION_TYPE_OPTIONS_EXAM = [
  {label: 'Sắp xếp từ (WORD_ORDER)', value: 'WORD_ORDER'},
  {label: 'Câu hỏi audio (AUDIO_CHOICE)', value: 'AUDIO_CHOICE'},
  {label: 'Chọn theo câu hỏi (TEXT_ONLY)', value: 'MULTIPLE_CHOICE_TEXT_ONLY'},
  {label: 'Chọn ảnh (VOCAB_IMAGE)', value: 'MULTIPLE_CHOICE_VOCAB_IMAGE'},
  {label: 'Bài luyện nói (PRONUNCIATION)', value: 'PRONUNCIATION'},
  {label: 'Bài luyện viết (WRITING)', value: 'WRITING'},
];

const getDisplayQuestionType = (type: string): string => {
  const foundType = QUESTION_TYPE_OPTIONS_EXAM.find(opt => opt.value === type);
  return foundType ? foundType.label : type;
};

const formModalStylesCommon = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalViewContainer: {
    maxHeight: '95%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalViewContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
  backButton: {padding: 5, paddingHorizontal: 5},
  backIcon: {width: 22, height: 22, tintColor: '#555'},
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    maxHeight: SIZES.height * 0.85 - 60,
  },
  inputGroup: {marginBottom: 15},
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    width: '100%',
    color: '#333',
  },
  choicesHeader: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.padding,
  },
  choiceItemContainer: {
    marginBottom: SIZES.padding,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  choiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  choiceIndexText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  imageInputContainer: {
    alignItems: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  choiceImagePreview: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray2,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignSelf: 'center',
    marginBottom: SIZES.base,
  },
  choiceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignSelf: 'center',
    marginBottom: SIZES.base,
  },
  uploadButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.base,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonText: {color: COLORS.white, fontWeight: '500', marginLeft: 5},
  uploadIcon: {width: 18, height: 18, tintColor: COLORS.white},
  correctChoiceButton: {
    backgroundColor: COLORS.lightGray2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius,
    marginTop: SIZES.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  correctChoiceButtonSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
  },
  correctChoiceButtonText: {color: COLORS.darkGray, fontWeight: '500'},
  correctChoiceButtonTextSelected: {color: COLORS.white, fontWeight: 'bold'},
  addChoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
    paddingVertical: 10,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  addChoiceButtonText: {color: COLORS.white, fontWeight: 'bold', fontSize: 15},
  deleteChoiceButtonSmall: {padding: SIZES.base / 2},
  deleteChoiceIconSmall: {width: 20, height: 20, tintColor: COLORS.red},
  readOnlyInput: {
    backgroundColor: COLORS.lightGray2,
    color: COLORS.darkGray,
    opacity: 0.7,
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
  submitButtonDisabled: {backgroundColor: COLORS.gray},
});

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

interface AddEditLessonModalFormData {
  lesson_name: string;
}
interface AddEditLessonModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: {lesson_name: string};
  onClose: () => void;
  onSubmit: (data: AddEditLessonModalFormData) => void;
}
const AddEditLessonModal: React.FC<AddEditLessonModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [lessonName, setLessonName] = useState('');
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setLessonName(initialData.lesson_name);
      } else {
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
        style={formModalStylesCommon.backdrop}
        onPress={handleAttemptCloseModal}>
        <Pressable
          style={formModalStylesCommon.modalViewContainer}
          onPress={() => {}}>
          <View style={formModalStylesCommon.modalViewContent}>
            <View style={formModalStylesCommon.header}>
              <TouchableOpacity
                onPress={handleAttemptCloseModal}
                style={formModalStylesCommon.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStylesCommon.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStylesCommon.headerTitle}>
                {mode === 'add' ? 'Thêm bài học mới' : 'Chỉnh sửa bài học'}
              </Text>
              <View
                style={{
                  width:
                    formModalStylesCommon.backIcon.width +
                    ((formModalStylesCommon.backButton
                      .paddingHorizontal as number) ||
                      (formModalStylesCommon.backButton.padding as number) ||
                      5) *
                      2,
                }}
              />
            </View>
            <ScrollView
              style={formModalStylesCommon.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStylesCommon.inputGroup}>
                <Text style={formModalStylesCommon.label}>
                  Tên bài học
                  <Text style={formModalStylesCommon.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={formModalStylesCommon.input}
                  placeholder="Nhập tên bài học"
                  placeholderTextColor="#999"
                  value={lessonName}
                  onChangeText={setLessonName}
                />
              </View>
              <TouchableOpacity
                style={formModalStylesCommon.submitButton}
                onPress={handleSubmit}>
                <Text style={formModalStylesCommon.submitButtonText}>
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

interface AddEditExamQuestionModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: ApiExamQuestion | null;
  currentTopicId: number | null;
  onClose: () => void;
  onSubmit: (
    jsonData: RequestExamQuestionDTOForJson,
    imageFiles: Asset[],
  ) => Promise<void>;
  playSoundInModal?: (url: string | null) => void;
  isSubmitting: boolean;
}

const AddEditExamQuestionModal: React.FC<AddEditExamQuestionModalProps> = ({
  visible,
  mode,
  initialData,
  currentTopicId,
  onClose,
  onSubmit,
  playSoundInModal,
  isSubmitting,
}) => {
  const [questionType, setQuestionType] = useState(
    QUESTION_TYPE_OPTIONS_EXAM[0].value,
  );
  const [promptTextTemplate, setPromptTextTemplate] = useState('');
  const [targetWordNative, setTargetWordNative] = useState('');
  const [audioUrlForm, setAudioUrlForm] = useState('');
  const [currentQuestionChoices, setCurrentQuestionChoices] = useState<
    EditableExamQuestionChoiceClient[]
  >([]);
  const isInitialMountForVisibleModal = useRef(true);

  const getShuffledDisplayFromTextBlock = (
    textBlockString: string | null | undefined,
  ): string => {
    if (
      textBlockString &&
      String(textBlockString).trim() !== '' &&
      textBlockString !== '[]' &&
      textBlockString !== 'null'
    ) {
      try {
        const parsedArray = JSON.parse(textBlockString);
        return Array.isArray(parsedArray)
          ? parsedArray.join(' / ')
          : '[Lỗi dữ liệu khối từ]';
      } catch (error) {
        return '[Lỗi parse khối từ]';
      }
    }
    return '';
  };
  const shuffleWordsForTextBlock = (text: string): string[] => {
    if (!text || text.trim() === '') return [];
    const words =
      text.match(
        /[\u3000\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF65-\uFF9F0-9a-zA-Z]+|[.,?!;:]+|\S/g,
      ) || [];
    const nonEmptyWords = words.filter(w => w.trim() !== '');
    for (let i = nonEmptyWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonEmptyWords[i], nonEmptyWords[j]] = [
        nonEmptyWords[j],
        nonEmptyWords[i],
      ];
    }
    return nonEmptyWords;
  };

  const initializeChoices = useCallback(
    (
      type: string,
      existingApiChoices?: ApiExamQuestionChoice[],
      baseTargetWord?: string,
    ) => {
      // THAY ĐỔI: Xử lý cho PRONUNCIATION và WRITING (không có choices)
      if (type === 'PRONUNCIATION' || type === 'WRITING') {
        setCurrentQuestionChoices([]);
        return;
      }

      let newChoices: EditableExamQuestionChoiceClient[] = [];
      const currentInitialDataForChoices =
        mode === 'edit' && initialData && initialData.questionType === type
          ? initialData.questionChoices
          : existingApiChoices || [];
      if (
        currentInitialDataForChoices &&
        currentInitialDataForChoices.length > 0
      ) {
        newChoices = currentInitialDataForChoices.map((c, index) => ({
          clientId: c.id
            ? `db-exam-${c.id}`
            : `edit-exam-temp-${Date.now()}-${index}`,
          id: c.id,
          textForeign: c.textForeign || '',
          textRomaji: c.textRomaji === undefined ? null : c.textRomaji,
          imageUrl: c.imageUrl === undefined ? null : c.imageUrl,
          imageFile: null,
          audioUrlForeign:
            c.audioUrlForeign === undefined ? null : c.audioUrlForeign,
          textBlock: c.textBlock === undefined ? '[]' : c.textBlock || '[]',
          isCorrect: c.isCorrect === 1 || c.isCorrect === true,
          _shuffledTextBlockDisplay: getShuffledDisplayFromTextBlock(
            c.textBlock,
          ),
        }));
      }
      if (type === 'WORD_ORDER') {
        const textForWordOrder =
          baseTargetWord ||
          (mode === 'edit' &&
          initialData &&
          initialData.questionType === 'WORD_ORDER' &&
          initialData.targetWordNative
            ? initialData.targetWordNative
            : newChoices.length > 0 && newChoices[0].textForeign
            ? newChoices[0].textForeign
            : '');
        const existingChoice = newChoices.length > 0 ? newChoices[0] : null;
        let currentTextBlock = existingChoice?.textBlock || '[]';
        if (
          textForWordOrder &&
          (!currentTextBlock ||
            currentTextBlock === '[]' ||
            (existingChoice && existingChoice.textForeign !== textForWordOrder))
        ) {
          currentTextBlock = JSON.stringify(
            shuffleWordsForTextBlock(textForWordOrder),
          );
        }
        newChoices = [
          {
            clientId: existingChoice?.clientId || `temp-exam-wo-${Date.now()}`,
            id: existingChoice?.id,
            textForeign: textForWordOrder,
            textRomaji: null,
            imageUrl: null,
            imageFile: null,
            audioUrlForeign: null,
            textBlock: currentTextBlock,
            _shuffledTextBlockDisplay:
              getShuffledDisplayFromTextBlock(currentTextBlock),
            isCorrect: true,
          },
        ];
      } else {
        // Áp dụng cho AUDIO_CHOICE, MULTIPLE_CHOICE_TEXT_ONLY, MULTIPLE_CHOICE_VOCAB_IMAGE
        const minChoices = 4;
        let validChoices = newChoices.filter(
          c => c.textForeign || c.imageUrl || c.imageFile,
        );
        // Chỉ thêm choices rỗng ở mode 'add' cho các loại này
        if (mode === 'add') {
          while (validChoices.length < minChoices) {
            validChoices.push({
              clientId: `temp-exam-${Date.now()}-${validChoices.length}`,
              textForeign: '',
              textRomaji: '',
              imageUrl: null,
              imageFile: null,
              audioUrlForeign: null,
              isCorrect: false,
              textBlock: '[]',
              _shuffledTextBlockDisplay: '',
            });
          }
        }
        newChoices = validChoices;
      }
      setCurrentQuestionChoices(newChoices);
    },
    [mode, initialData],
  );

  useEffect(() => {
    if (visible) {
      isInitialMountForVisibleModal.current = true;
      if (mode === 'edit' && initialData) {
        setQuestionType(initialData.questionType);
        setPromptTextTemplate(initialData.promptTextTemplate || '');
        setTargetWordNative(initialData.targetWordNative || '');
        setAudioUrlForm(initialData.audioUrlExam || '');
        initializeChoices(
          initialData.questionType,
          initialData.questionChoices,
          initialData.targetWordNative,
        );
      } else {
        const defaultType = QUESTION_TYPE_OPTIONS_EXAM[0].value;
        setQuestionType(defaultType);
        setPromptTextTemplate('');
        setTargetWordNative('');
        setAudioUrlForm('');
        initializeChoices(defaultType, [], '');
      }
    }
  }, [visible, mode, initialData, initializeChoices]);

  useEffect(() => {
    if (!visible || mode !== 'add') return; // Chỉ reset choices khi type thay đổi ở mode add
    if (isInitialMountForVisibleModal.current) {
      isInitialMountForVisibleModal.current = false;
      return;
    }
    // Khi questionType thay đổi (chỉ ở mode 'add'), khởi tạo lại choices
    // initializeChoices sẽ xử lý việc set rỗng cho PRONUNCIATION/WRITING
    initializeChoices(questionType, [], targetWordNative);
  }, [visible, questionType, initializeChoices, targetWordNative, mode]);

  useEffect(() => {
    if (!visible || questionType !== 'WORD_ORDER') return;
    setCurrentQuestionChoices(prevChoices => {
      if (prevChoices.length === 1) {
        const choice = prevChoices[0];
        if (
          choice.textForeign !== targetWordNative ||
          !choice.textBlock ||
          choice.textBlock === '[]'
        ) {
          const newTextBlock = JSON.stringify(
            shuffleWordsForTextBlock(targetWordNative),
          );
          return [
            {
              ...choice,
              textForeign: targetWordNative,
              textBlock: newTextBlock,
              _shuffledTextBlockDisplay:
                getShuffledDisplayFromTextBlock(newTextBlock),
            },
          ];
        }
      } else if (targetWordNative && prevChoices.length === 0) {
        const newTextBlock = JSON.stringify(
          shuffleWordsForTextBlock(targetWordNative),
        );
        return [
          {
            clientId: `temp-exam-wo-${Date.now()}`,
            id: undefined,
            textForeign: targetWordNative,
            textRomaji: null,
            imageUrl: null,
            imageFile: null,
            audioUrlForeign: null,
            textBlock: newTextBlock,
            _shuffledTextBlockDisplay:
              getShuffledDisplayFromTextBlock(newTextBlock),
            isCorrect: true,
          },
        ];
      }
      return prevChoices;
    });
  }, [visible, questionType, targetWordNative]);

  const handleChoiceChange = (
    choiceClientId: string,
    field: keyof Omit<
      EditableExamQuestionChoiceClient,
      'id' | 'clientId' | '_shuffledTextBlockDisplay' | 'imageFile'
    >,
    value: string | boolean | number | null,
  ) => {
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map(choice =>
        choice.clientId === choiceClientId
          ? {...choice, [field]: value}
          : choice,
      ),
    );
  };
  const handlePickImageForChoice = useCallback((choiceClientId: string) => {
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
        setCurrentQuestionChoices(prevChoices =>
          prevChoices.map(choice =>
            choice.clientId === choiceClientId
              ? {
                  ...choice,
                  imageFile: imageAsset,
                  imageUrl: imageAsset.uri || null,
                }
              : choice,
          ),
        );
      }
    });
  }, []);

  const handleSetCorrectChoice = (choiceClientId: string) => {
    // THAY ĐỔI: Không áp dụng cho PRONUNCIATION, WRITING
    if (
      questionType === 'WORD_ORDER' ||
      questionType === 'PRONUNCIATION' ||
      questionType === 'WRITING'
    )
      return;
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map(choice => ({
        ...choice,
        isCorrect: choice.clientId === choiceClientId,
      })),
    );
  };

  const handleAddChoice = () => {
    if (mode === 'edit') return; // Không cho thêm choice ở mode edit (nếu không muốn)
    // THAY ĐỔI: Không áp dụng cho PRONUNCIATION, WRITING
    if (
      questionType === 'WORD_ORDER' ||
      questionType === 'PRONUNCIATION' ||
      questionType === 'WRITING'
    ) {
      Alert.alert(
        'Thông báo',
        `Loại câu hỏi "${getDisplayQuestionType(
          questionType,
        )}" không hỗ trợ thêm lựa chọn theo cách này.`,
      );
      return;
    }
    if (currentQuestionChoices.length >= 10) {
      Alert.alert('Thông báo', 'Đã đạt số lượng lựa chọn tối đa (10).');
      return;
    }
    setCurrentQuestionChoices(prev => [
      ...prev,
      {
        clientId: `temp-exam-${Date.now()}-${prev.length}`,
        textForeign: '',
        textRomaji: '',
        imageUrl: null,
        imageFile: null,
        audioUrlForeign: null,
        isCorrect: false,
        textBlock: '[]',
        _shuffledTextBlockDisplay: '',
      },
    ]);
  };

  const handleRemoveChoice = (choiceClientId: string) => {
    if (mode === 'edit') return; // Không cho xóa choice ở mode edit (nếu không muốn)
    // THAY ĐỔI: Không áp dụng cho PRONUNCIATION, WRITING
    if (questionType === 'PRONUNCIATION' || questionType === 'WRITING') {
      return;
    }
    const minRequiredChoices = questionType === 'WORD_ORDER' ? 1 : 4;
    if (currentQuestionChoices.length <= minRequiredChoices) {
      Alert.alert(
        'Thông báo',
        `Cần ít nhất ${minRequiredChoices} lựa chọn trả lời cho loại câu hỏi này.`,
      );
      return;
    }
    if (questionType === 'WORD_ORDER') return; // WORD_ORDER không xóa qua đây
    setCurrentQuestionChoices(prev =>
      prev.filter(choice => choice.clientId !== choiceClientId),
    );
  };

  const handleShuffleWordOrderChoice = (choiceClientId: string) => {
    const choiceIndex = currentQuestionChoices.findIndex(
      c => c.clientId === choiceClientId,
    );
    if (questionType !== 'WORD_ORDER' || choiceIndex === -1) return;
    const originalText = currentQuestionChoices[choiceIndex].textForeign;
    if (!originalText || originalText.trim() === '') {
      Alert.alert(
        'Lỗi',
        'Vui lòng nhập nội dung câu gốc (Text Foreign) trước khi trộn.',
      );
      return;
    }
    const shuffledWordsArray = shuffleWordsForTextBlock(originalText);
    if (shuffledWordsArray.length === 0) {
      Alert.alert(
        'Lỗi',
        'Không thể tách từ từ câu gốc để trộn. Vui lòng kiểm tra lại câu gốc.',
      );
      return;
    }
    const shuffledJsonString = JSON.stringify(shuffledWordsArray);
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map(c =>
        c.clientId === choiceClientId
          ? {
              ...c,
              textBlock: shuffledJsonString,
              _shuffledTextBlockDisplay: shuffledWordsArray.join(' / '),
            }
          : c,
      ),
    );
    showMessage({message: 'Đã trộn và cập nhật Text Block!', type: 'success'});
  };

  const handleSubmitInternal = () => {
    if (isSubmitting) return;
    if (!currentTopicId) {
      Alert.alert('Lỗi', 'Không xác định được ID chủ đề.');
      return;
    }
    if (!questionType.trim())
      return Alert.alert('Lỗi', 'Loại câu hỏi không được để trống.');
    if (!promptTextTemplate.trim())
      return Alert.alert('Lỗi', 'Mẫu câu hỏi/Yêu cầu không được để trống.');
    if (!targetWordNative.trim())
      return Alert.alert(
        'Lỗi',
        'Từ khóa (Nội dung/Đáp án chính/Từ vựng) không được để trống.',
      );

    // THAY ĐỔI: Validation cho audioUrlForm
    if (questionType === 'PRONUNCIATION' && !audioUrlForm.trim()) {
      return Alert.alert(
        'Lỗi',
        'PRONUNCIATION: Audio câu hỏi không được để trống.',
      );
    }
    // Đối với các loại khác (trừ WRITING, PRONUNCIATION đã check), audioUrlForm vẫn bắt buộc
    if (
      questionType !== 'WRITING' &&
      questionType !== 'PRONUNCIATION' &&
      !audioUrlForm.trim()
    ) {
      return Alert.alert(
        'Lỗi',
        'Audio câu hỏi không được để trống cho loại này.',
      );
    }

    // Validation cho questionChoices dựa trên questionType
    if (questionType === 'WORD_ORDER') {
      if (currentQuestionChoices.length !== 1) {
        return Alert.alert(
          'Lỗi',
          'Câu hỏi Sắp xếp từ (WORD_ORDER) chỉ cho phép đúng 1 lựa chọn.',
        );
      }
      const choice = currentQuestionChoices[0];
      if (
        !choice.textForeign.trim() ||
        targetWordNative.trim() !== choice.textForeign.trim()
      ) {
        return Alert.alert(
          'Lỗi',
          "WORD_ORDER: 'Nội dung/Đáp án chính' phải khớp với 'Câu gốc' và không rỗng.",
        );
      }
      if (
        !choice.textBlock ||
        choice.textBlock.trim() === '' ||
        choice.textBlock === '[]'
      ) {
        return Alert.alert('Lỗi', 'WORD_ORDER: Vui lòng tạo khối từ xáo trộn.');
      }
    } else if (
      // Chỉ áp dụng cho các loại có choices
      questionType === 'AUDIO_CHOICE' ||
      questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
      questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE'
    ) {
      if (currentQuestionChoices.length < 4) {
        return Alert.alert(
          'Lỗi',
          `Loại câu hỏi "${getDisplayQuestionType(
            questionType,
          )}" yêu cầu ít nhất 4 lựa chọn.`,
        );
      }
      let isOneCorrectChoicePresent = false;
      for (const choice of currentQuestionChoices) {
        if (choice.isCorrect === true || choice.isCorrect === 1) {
          isOneCorrectChoicePresent = true;
          break;
        }
      }
      if (!isOneCorrectChoicePresent) {
        return Alert.alert('Lỗi', 'Cần xác định ít nhất một lựa chọn đúng.');
      }
      for (let i = 0; i < currentQuestionChoices.length; i++) {
        const choice = currentQuestionChoices[i];
        if (!choice.textForeign || !choice.textForeign.trim()) {
          return Alert.alert(
            'Lỗi',
            `Lựa chọn ${i + 1}: "Nội dung tiếng nước ngoài" không được trống.`,
          );
        }
        if (
          (questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' ||
            questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
            questionType === 'AUDIO_CHOICE') &&
          (!choice.textRomaji || !choice.textRomaji.trim())
        ) {
          return Alert.alert('Lỗi', `Lựa chọn ${i + 1}: Yêu cầu "Romaji".`);
        }
        if (
          questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' &&
          !choice.imageUrl &&
          !choice.imageFile
        ) {
          return Alert.alert(
            'Lỗi',
            `Lựa chọn ${i + 1}: Yêu cầu chọn hình ảnh.`,
          );
        }
      }
    }
    // PRONUNCIATION và WRITING không cần validation cho choices ở đây

    // THAY ĐỔI: Tạo choicesToSubmitAPI
    const choicesToSubmitAPI: RequestExamChoiceDTOForJson[] =
      questionType === 'PRONUNCIATION' || questionType === 'WRITING'
        ? [] // Mảng rỗng
        : currentQuestionChoices.map(clientChoice => ({
            id:
              typeof clientChoice.id === 'number' ? clientChoice.id : undefined,
            textForeign: clientChoice.textForeign,
            textRomaji: clientChoice.textRomaji || null,
            audioUrlForeign: clientChoice.audioUrlForeign || null,
            textBlock:
              questionType === 'WORD_ORDER' &&
              clientChoice.clientId === currentQuestionChoices[0]?.clientId
                ? clientChoice.textBlock || '[]'
                : '[]',
            isCorrect: !!clientChoice.isCorrect,
          }));

    const examQuestionJsonData: RequestExamQuestionDTOForJson = {
      topicId: currentTopicId, // currentTopicId đã được đảm bảo không null ở đầu hàm
      questionType: questionType,
      promptTextTemplate: promptTextTemplate.trim(),
      targetWordNative: targetWordNative.trim(),
      targetLanguageCode: initialData?.targetLanguageCode || 'ja',
      optionsLanguageCode: initialData?.optionsLanguageCode || 'vi',
      audioUrlExam: audioUrlForm.trim(), // Có thể rỗng cho WRITING
      questionChoices: choicesToSubmitAPI,
    };
    const imageFilesToUpload: Asset[] = currentQuestionChoices
      .map(choice => choice.imageFile)
      .filter(file => file !== null && file !== undefined) as Asset[];
    onSubmit(examQuestionJsonData, imageFilesToUpload);
  };

  // Biến cờ để kiểm tra xem có nên hiển thị phần choices không
  const showChoicesSectionForExam = !(
    questionType === 'PRONUNCIATION' || questionType === 'WRITING'
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable
        style={formModalStylesCommon.backdrop}
        onPress={Keyboard.dismiss}>
        <Pressable
          style={formModalStylesCommon.modalViewContainer}
          onPress={() => {}}>
          <View style={formModalStylesCommon.modalViewContent}>
            <View style={formModalStylesCommon.header}>
              <TouchableOpacity
                onPress={onClose}
                style={formModalStylesCommon.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStylesCommon.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStylesCommon.headerTitle}>
                {mode === 'add'
                  ? 'Thêm Câu Hỏi Kiểm Tra'
                  : 'Chỉnh Sửa Câu Hỏi Kiểm Tra'}
              </Text>
              <View
                style={{
                  width:
                    formModalStylesCommon.backIcon.width +
                    ((formModalStylesCommon.backButton
                      .paddingHorizontal as number) ||
                      (formModalStylesCommon.backButton.padding as number) ||
                      5) *
                      2,
                }}
              />
            </View>
            <ScrollView
              style={formModalStylesCommon.formContainer}
              contentContainerStyle={{paddingBottom: SIZES.padding * 12}}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStylesCommon.inputGroup}>
                <Text style={formModalStylesCommon.label}>
                  Loại câu hỏi{' '}
                  <Text style={formModalStylesCommon.requiredStar}>*</Text>
                </Text>
                {mode === 'edit' && initialData ? (
                  <TextInput
                    style={[
                      formModalStylesCommon.input,
                      formModalStylesCommon.readOnlyInput,
                    ]}
                    value={getDisplayQuestionType(questionType)} // Sử dụng hàm getDisplayQuestionType từ global scope của file
                    editable={false}
                  />
                ) : (
                  <View style={formModalStylesCommon.pickerContainer}>
                    <Picker
                      selectedValue={questionType}
                      onValueChange={itemValue => {
                        if (itemValue) {
                          setQuestionType(itemValue.toString());
                        }
                      }}
                      style={formModalStylesCommon.picker}
                      enabled={!isSubmitting && mode === 'add'}
                      dropdownIconColor={COLORS.gray}
                      mode="dropdown">
                      {QUESTION_TYPE_OPTIONS_EXAM.map(
                        (
                          opt, // Sử dụng QUESTION_TYPE_OPTIONS_EXAM
                        ) => (
                          <Picker.Item
                            key={opt.value}
                            label={opt.label}
                            value={opt.value}
                          />
                        ),
                      )}
                    </Picker>
                  </View>
                )}
              </View>
              <View style={formModalStylesCommon.inputGroup}>
                <Text style={formModalStylesCommon.label}>
                  Mẫu câu hỏi/Yêu cầu{' '}
                  <Text style={formModalStylesCommon.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    formModalStylesCommon.input,
                    {height: 80, textAlignVertical: 'top'},
                  ]}
                  placeholder="Nhập yêu cầu"
                  value={promptTextTemplate}
                  onChangeText={setPromptTextTemplate}
                  multiline
                  editable={!isSubmitting}
                />
              </View>
              <View style={formModalStylesCommon.inputGroup}>
                <Text style={formModalStylesCommon.label}>
                  {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE'
                    ? 'Từ khóa'
                    : questionType === 'WORD_ORDER'
                    ? 'Nhập đáp án đúng'
                    : questionType === 'PRONUNCIATION'
                    ? 'Câu/Từ cần luyện phát âm'
                    : questionType === 'WRITING'
                    ? 'Đề bài viết / Câu mẫu'
                    : 'Nhập từ khóa'}
                  <Text style={formModalStylesCommon.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    formModalStylesCommon.input,
                    (questionType === 'WORD_ORDER' ||
                      questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                      questionType === 'WRITING') && {
                      // Thêm WRITING
                      height: 80,
                      textAlignVertical: 'top',
                    },
                  ]}
                  placeholder={
                    questionType === 'WORD_ORDER'
                      ? 'Nhập câu đúng (vd: わたしは ごはんを たべます)'
                      : questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE'
                      ? 'Nhập từ vựng (vd: りんご)'
                      : questionType === 'PRONUNCIATION'
                      ? 'Nhập câu/từ để luyện phát âm'
                      : questionType === 'WRITING'
                      ? 'Nhập đề bài hoặc câu văn mẫu cho bài viết'
                      : 'Nhập nội dung hoặc đáp án chính'
                  }
                  value={targetWordNative}
                  onChangeText={setTargetWordNative}
                  multiline={
                    // Thêm WRITING
                    questionType === 'WORD_ORDER' ||
                    questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                    questionType === 'WRITING'
                  }
                  editable={!isSubmitting}
                />
              </View>
              <View style={formModalStylesCommon.inputGroup}>
                <Text style={formModalStylesCommon.label}>
                  URL Audio câu hỏi{' '}
                  {/* Bắt buộc cho PRONUNCIATION và các loại khác trừ WRITING */}
                  {(questionType === 'PRONUNCIATION' ||
                    (questionType !== 'WRITING' &&
                      questionType !== 'PRONUNCIATION')) && (
                    <Text style={formModalStylesCommon.requiredStar}>*</Text>
                  )}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TextInput
                    style={[
                      formModalStylesCommon.input,
                      {
                        flex: 1,
                        marginRight:
                          audioUrlForm && playSoundInModal ? SIZES.base : 0,
                      },
                    ]}
                    placeholder="https://example.com/audio_exam.mp3"
                    value={audioUrlForm}
                    onChangeText={setAudioUrlForm}
                    keyboardType="url"
                    editable={!isSubmitting}
                  />
                  {audioUrlForm && playSoundInModal && (
                    <TouchableOpacity
                      onPress={() => playSoundInModal(audioUrlForm)}
                      style={styles.audioPlayButtonSmallModal}>
                      <Image
                        source={AUDIO_PLAY_ICON_MODAL}
                        style={styles.audioIconInListSmallModal}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* THAY ĐỔI: Chỉ hiển thị phần choices nếu không phải PRONUNCIATION hoặc WRITING */}
              {showChoicesSectionForExam && (
                <>
                  <Text style={formModalStylesCommon.choicesHeader}>
                    {questionType === 'WORD_ORDER'
                      ? 'Câu gốc & Khối từ xáo trộn'
                      : 'Các lựa chọn trả lời'}
                  </Text>
                  {currentQuestionChoices.map((choice, index) => (
                    <View
                      key={choice.clientId}
                      style={formModalStylesCommon.choiceItemContainer}>
                      <View style={formModalStylesCommon.choiceHeader}>
                        <Text style={formModalStylesCommon.choiceIndexText}>
                          {questionType === 'WORD_ORDER'
                            ? 'Dữ liệu câu sắp xếp'
                            : `Lựa chọn ${index + 1}:`}
                        </Text>
                        {mode === 'add' &&
                          questionType !== 'WORD_ORDER' &&
                          currentQuestionChoices.length >
                            (questionType === 'WORD_ORDER' ? 1 : 4) && (
                            <TouchableOpacity
                              onPress={() =>
                                handleRemoveChoice(choice.clientId)
                              }
                              style={
                                formModalStylesCommon.deleteChoiceButtonSmall
                              }>
                              <Image
                                source={DELETE_CHOICE_ICON} // Đảm bảo icon này được import
                                style={
                                  formModalStylesCommon.deleteChoiceIconSmall
                                }
                              />
                            </TouchableOpacity>
                          )}
                      </View>
                      <Text style={formModalStylesCommon.label}>
                        {questionType === 'WORD_ORDER'
                          ? 'Câu gốc (đồng bộ)'
                          : 'Nội dung tiếng nước ngoài'}
                        <Text style={formModalStylesCommon.requiredStar}>
                          *
                        </Text>
                      </Text>
                      <TextInput
                        style={[
                          formModalStylesCommon.input,
                          questionType === 'WORD_ORDER' &&
                            formModalStylesCommon.readOnlyInput,
                        ]}
                        placeholder={
                          questionType === 'WORD_ORDER'
                            ? 'Tự động điền'
                            : 'Nhập nội dung...'
                        }
                        value={choice.textForeign}
                        onChangeText={text =>
                          handleChoiceChange(
                            choice.clientId,
                            'textForeign',
                            text,
                          )
                        }
                        editable={
                          !isSubmitting &&
                          (mode === 'add' ||
                            questionType !== 'WORD_ORDER' ||
                            (mode === 'edit' && questionType !== 'WORD_ORDER'))
                        }
                      />
                      {(questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' ||
                        questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                        questionType === 'AUDIO_CHOICE') && (
                        <View style={formModalStylesCommon.inputGroup}>
                          <Text style={formModalStylesCommon.label}>
                            Romaji{' '}
                            <Text style={formModalStylesCommon.requiredStar}>
                              *
                            </Text>
                          </Text>
                          <TextInput
                            style={formModalStylesCommon.input}
                            placeholder="Nhập Romaji"
                            value={choice.textRomaji || ''}
                            onChangeText={text =>
                              handleChoiceChange(
                                choice.clientId,
                                'textRomaji',
                                text,
                              )
                            }
                            editable={!isSubmitting}
                          />
                        </View>
                      )}
                      {questionType !== 'AUDIO_CHOICE' &&
                        questionType !== 'WORD_ORDER' && (
                          <View style={formModalStylesCommon.inputGroup}>
                            <Text style={formModalStylesCommon.label}>
                              URL Audio lựa chọn
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TextInput
                                style={[
                                  formModalStylesCommon.input,
                                  {
                                    flex: 1,
                                    marginRight:
                                      choice.audioUrlForeign && playSoundInModal
                                        ? SIZES.base
                                        : 0,
                                  },
                                ]}
                                placeholder="URL audio cho lựa chọn (nếu có)"
                                value={choice.audioUrlForeign || ''}
                                onChangeText={text =>
                                  handleChoiceChange(
                                    choice.clientId,
                                    'audioUrlForeign',
                                    text,
                                  )
                                }
                                keyboardType="url"
                                editable={!isSubmitting}
                              />
                              {choice.audioUrlForeign && playSoundInModal && (
                                <TouchableOpacity
                                  onPress={() =>
                                    playSoundInModal(choice.audioUrlForeign)
                                  }
                                  style={styles.audioPlayButtonSmallModal}>
                                  <Image
                                    source={AUDIO_PLAY_ICON_MODAL}
                                    style={styles.audioIconInListSmallModal}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
                      {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                        <View style={formModalStylesCommon.inputGroup}>
                          <Text style={formModalStylesCommon.label}>
                            Hình ảnh{' '}
                            <Text style={formModalStylesCommon.requiredStar}>
                              *
                            </Text>
                          </Text>
                          <View
                            style={formModalStylesCommon.imageInputContainer}>
                            {choice.imageUrl ? (
                              <Image
                                source={{uri: choice.imageUrl}}
                                style={formModalStylesCommon.choiceImagePreview}
                              />
                            ) : (
                              <View
                                style={
                                  formModalStylesCommon.choiceImagePlaceholder
                                }>
                                <Text
                                  style={{color: COLORS.gray, fontSize: 12}}>
                                  Chưa có ảnh
                                </Text>
                              </View>
                            )}
                            <TouchableOpacity
                              style={formModalStylesCommon.uploadButton}
                              onPress={() =>
                                handlePickImageForChoice(choice.clientId)
                              }
                              disabled={isSubmitting}>
                              <Image
                                source={UPLOAD_ICON_MODAL}
                                style={formModalStylesCommon.uploadIcon}
                              />
                              <Text
                                style={formModalStylesCommon.uploadButtonText}>
                                {choice.imageFile
                                  ? choice.imageFile.fileName || 'Ảnh đã chọn'
                                  : 'Chọn hoặc đổi ảnh'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                      {questionType === 'WORD_ORDER' && (
                        <>
                          <View
                            style={[
                              formModalStylesCommon.inputGroup,
                              {marginTop: SIZES.base},
                            ]}>
                            <Text style={formModalStylesCommon.label}>
                              Các khối từ xáo trộn (JSON):
                            </Text>
                            <TextInput
                              style={[
                                formModalStylesCommon.input,
                                formModalStylesCommon.readOnlyInput,
                                {minHeight: 60, textAlignVertical: 'top'},
                              ]}
                              value={choice.textBlock || '[]'}
                              editable={false}
                              multiline
                            />
                            <Text style={formModalStylesCommon.label}>
                              Xem trước xáo trộn:
                            </Text>
                            <TextInput
                              style={[
                                formModalStylesCommon.input,
                                formModalStylesCommon.readOnlyInput,
                                {
                                  minHeight: 40,
                                  textAlignVertical: 'top',
                                  marginTop: SIZES.base / 2,
                                },
                              ]}
                              value={choice._shuffledTextBlockDisplay || ''}
                              editable={false}
                              multiline
                            />
                          </View>
                          <TouchableOpacity
                            style={[
                              // Sử dụng style đã có hoặc style mới phù hợp
                              styles.addNewButton, // Tạm dùng style này từ LessonAdminScreen, cần xem lại
                              {
                                alignSelf: 'flex-start',
                                marginTop: SIZES.base,
                                backgroundColor: COLORS.secondary,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                height: 'auto',
                              },
                            ]}
                            onPress={() =>
                              handleShuffleWordOrderChoice(choice.clientId)
                            }
                            disabled={
                              isSubmitting || !choice.textForeign?.trim()
                            }>
                            <Text style={styles.addNewButtonText}>Trộn từ</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {questionType !== 'WORD_ORDER' && (
                        <TouchableOpacity
                          style={[
                            formModalStylesCommon.correctChoiceButton,
                            (choice.isCorrect === true ||
                              choice.isCorrect === 1) &&
                              formModalStylesCommon.correctChoiceButtonSelected,
                          ]}
                          onPress={() =>
                            handleSetCorrectChoice(choice.clientId)
                          }
                          disabled={isSubmitting}>
                          <Text
                            style={[
                              formModalStylesCommon.correctChoiceButtonText,
                              (choice.isCorrect === true ||
                                choice.isCorrect === 1) &&
                                formModalStylesCommon.correctChoiceButtonTextSelected,
                            ]}>
                            {choice.isCorrect === true || choice.isCorrect === 1
                              ? '✓ Đáp án đúng'
                              : 'Chọn làm đáp án đúng'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {mode === 'add' && questionType !== 'WORD_ORDER' && (
                    <TouchableOpacity
                      onPress={handleAddChoice}
                      style={formModalStylesCommon.addChoiceButton}
                      disabled={isSubmitting}>
                      <Text style={formModalStylesCommon.addChoiceButtonText}>
                        Thêm lựa chọn
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                style={[
                  formModalStylesCommon.submitButton,
                  isSubmitting && formModalStylesCommon.submitButtonDisabled,
                ]}
                onPress={handleSubmitInternal}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={formModalStylesCommon.submitButtonText}>
                    {mode === 'add' ? 'Thêm câu hỏi' : 'Lưu thay đổi'}
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

const LessonAdminScreen: React.FC = () => {
  const route = useRoute<LessonAdminScreenRouteProp>();
  const navigation = useNavigation<LessonAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {topic_code: topicCodeFromRoute, title: topicTitleFromRoute} =
    route.params;

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
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
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const [examQuestions, setExamQuestions] = useState<ApiExamQuestion[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);
  const [isDeleteExamConfirmVisible, setIsDeleteExamConfirmVisible] =
    useState(false);
  const [examToDeleteConfirm, setExamToDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<number | null>(null);
  const [isAddEditExamModalVisible, setIsAddEditExamModalVisible] =
    useState(false);
  const [examModalMode, setExamModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingExam, setCurrentEditingExam] =
    useState<ApiExamQuestion | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioErrorState, setAudioErrorState] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentTopicId = useMemo(() => {
    const id = parseInt(topicCodeFromRoute, 10);
    return isNaN(id) ? null : id;
  }, [topicCodeFromRoute]);
  const getToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showMessage({
        message: 'Lỗi xác thực, vui lòng đăng nhập lại.',
        type: 'danger',
      });
      logout();
      throw new Error('Token not found');
    }
    return token;
  }, [logout]);

  const mapApiLessonToDisplayLesson = useCallback(
    (apiLesson: ApiLesson, topicId: number): Lesson => ({
      lesson_code: apiLesson.id,
      lesson_name: apiLesson.name,
      lesson_description: '',
      quantity_content: 0,
      day_creation: '',
      topic_code: topicId,
      status: 'pending',
      lesson_type: 'common',
    }),
    [],
  );
  const fetchLessonsForTopic = useCallback(
    async (topicId: number) => {
      if (isNaN(topicId)) {
        setLessonsError('ID chủ đề không hợp lệ.');
        return;
      }
      if (!isMountedRef.current) return;
      setIsLoadingLessons(true);
      setLessonsError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiLesson[]>(
          `${API_ADMIN_LESSON_URL}?topicId=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) {
          if (response.data && Array.isArray(response.data)) {
            setLessons(
              response.data.map(apiL =>
                mapApiLessonToDisplayLesson(apiL, topicId),
              ),
            );
          } else {
            setLessons([]);
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải danh sách bài học.';
          setLessonsError(msg);
          setLessons([]);
          console.error('LessonAdminScreen: Lỗi tải bài học:', msg);
        }
      } finally {
        if (isMountedRef.current) setIsLoadingLessons(false);
      }
    },
    [getToken, mapApiLessonToDisplayLesson],
  );
  const performDeleteLesson = useCallback(
    async (lessonId: number) => {
      if (currentTopicId === null) {
        showMessage({
          message: 'Lỗi: Không xác định được chủ đề hiện tại.',
          type: 'danger',
        });
        return;
      }
      if (!isMountedRef.current) return;
      setDeletingLessonCode(lessonId);
      try {
        const token = await getToken();
        await axios.put(
          `${API_ADMIN_LESSON_URL}/delete?lessonId=${lessonId}`,
          {},
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (!isMountedRef.current) return;
        showMessage({message: 'Xóa bài học thành công!', type: 'success'});
        fetchLessonsForTopic(currentTopicId);
      } catch (apiError: any) {
        if (!isMountedRef.current) return;
        const errorMessage =
          apiError.response?.data?.message || 'Không thể xóa bài học.';
        showMessage({message: errorMessage, type: 'danger', duration: 3000});
      } finally {
        if (isMountedRef.current) {
          setDeletingLessonCode(null);
          setIsDeleteLessonConfirmVisible(false);
          setLessonToDeleteConfirm(null);
        }
      }
    },
    [currentTopicId, getToken, fetchLessonsForTopic],
  );
  const handleCloseLessonDeleteConfirm = useCallback(() => {
    setIsDeleteLessonConfirmVisible(false);
    setLessonToDeleteConfirm(null);
  }, []);
  const handleConfirmLessonDelete = useCallback(() => {
    if (lessonToDeleteConfirm) {
      performDeleteLesson(lessonToDeleteConfirm.id);
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
      if (!isMountedRef.current) return;
      setIsSubmittingLesson(true);
      try {
        const token = await getToken();
        const headers = {Authorization: `Bearer ${token}`};
        const lessonData = {
          name: formData.lesson_name,
          topicId: String(currentTopicId),
        };
        if (lessonModalMode === 'add') {
          await axios.post(`${API_ADMIN_LESSON_URL}/create`, lessonData, {
            headers,
          });
          if (!isMountedRef.current) return;
          showMessage({message: 'Thêm bài học thành công!', type: 'success'});
        } else if (lessonModalMode === 'edit' && currentEditingLesson) {
          await axios.put(
            `${API_ADMIN_LESSON_URL}/update?lessonId=${currentEditingLesson.lesson_code}`,
            lessonData,
            {headers},
          );
          if (!isMountedRef.current) return;
          showMessage({
            message: 'Cập nhật bài học thành công!',
            type: 'success',
          });
        }
        if (isMountedRef.current) {
          fetchLessonsForTopic(currentTopicId);
          setIsAddEditLessonModalVisible(false);
          setCurrentEditingLesson(null);
        }
      } catch (apiError: any) {
        if (!isMountedRef.current) return;
        const errorMessage =
          apiError.response?.data?.message ||
          `Không thể ${
            lessonModalMode === 'add' ? 'thêm' : 'cập nhật'
          } bài học.`;
        showMessage({message: errorMessage, type: 'danger', duration: 3000});
      } finally {
        if (isMountedRef.current) setIsSubmittingLesson(false);
      }
    },
    [
      lessonModalMode,
      currentEditingLesson,
      currentTopicId,
      getToken,
      fetchLessonsForTopic,
    ],
  );

  const fetchExamQuestions = useCallback(
    async (topicId: number) => {
      if (isNaN(topicId)) {
        setExamsError('ID chủ đề không hợp lệ cho bài kiểm tra.');
        return;
      }
      if (!isMountedRef.current) return;
      setIsLoadingExams(true);
      setExamsError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiExamQuestion[]>(
          `${API_ADMIN_EXAM_URL}?topicID=${topicId}`, // Đảm bảo param là topicID nếu API yêu cầu
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) {
          if (response.data && Array.isArray(response.data)) {
            setExamQuestions(response.data);
          } else {
            setExamQuestions([]);
          }
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải danh sách câu hỏi kiểm tra.';
          setExamsError(msg);
          setExamQuestions([]);
          console.error('LessonAdminScreen: Lỗi tải câu hỏi kiểm tra:', msg);
        }
      } finally {
        if (isMountedRef.current) setIsLoadingExams(false);
      }
    },
    [getToken],
  );
  const handleAddNewExamQuestion = () => {
    setExamModalMode('add');
    setCurrentEditingExam(null);
    setIsAddEditExamModalVisible(true);
  };
  const handleEditExamQuestion = (exam: ApiExamQuestion) => {
    setExamModalMode('edit');
    setCurrentEditingExam(exam);
    setIsAddEditExamModalVisible(true);
  };
  const handleExamFormSubmit = useCallback(
    async (jsonData: RequestExamQuestionDTOForJson, imageFiles: Asset[]) => {
      if (currentTopicId === null) {
        Alert.alert('Lỗi', 'Không xác định được chủ đề hiện tại.');
        return;
      }
      if (!isMountedRef.current) return;
      setIsSubmittingExam(true);
      const formData = new FormData();
      formData.append('examQuestion', JSON.stringify(jsonData));
      imageFiles.forEach(fileAsset => {
        if (fileAsset.uri && fileAsset.type && fileAsset.fileName) {
          formData.append('choiceImages', {
            uri: fileAsset.uri,
            type: fileAsset.type,
            name: fileAsset.fileName,
          } as any);
        }
      });
      let url = '';
      let method: 'POST' | 'PUT' = 'POST';
      let successMessage = '';
      try {
        const token = await getToken();
        if (examModalMode === 'add') {
          url = `${API_ADMIN_EXAM_URL}/create`;
          method = 'POST';
          successMessage = 'Thêm câu hỏi kiểm tra thành công!';
        } else {
          if (!currentEditingExam || !currentEditingExam.id) {
            throw new Error('Không tìm thấy ID câu hỏi kiểm tra để cập nhật.');
          }
          url = `${API_ADMIN_EXAM_URL}/update?id=${currentEditingExam.id}`;
          method = 'PUT';
          successMessage = 'Cập nhật câu hỏi kiểm tra thành công!';
        }
        await axios({
          method,
          url,
          data: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (!isMountedRef.current) return;
        showMessage({message: successMessage, type: 'success'});
        if (currentTopicId) fetchExamQuestions(currentTopicId);
        setIsAddEditExamModalVisible(false);
        setCurrentEditingExam(null);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        console.error(
          `Lỗi khi ${
            examModalMode === 'add' ? 'thêm' : 'sửa'
          } câu hỏi kiểm tra:`,
          err.response?.data || err.request || err.message || err,
        );
        const responseData = err.response?.data;
        let backendMessage = 'Thao tác thất bại.';
        if (typeof responseData === 'string') {
          backendMessage = responseData;
        } else if (responseData?.message) {
          backendMessage = responseData.message;
        } else if (responseData?.errors && Array.isArray(responseData.errors)) {
          backendMessage = responseData.errors
            .map((e: any) => e.defaultMessage || e.field)
            .join('\n');
        } else if (err.message) {
          backendMessage = err.message;
        }
        showMessage({message: backendMessage, type: 'danger', duration: 7000});
      } finally {
        if (isMountedRef.current) setIsSubmittingExam(false);
      }
    },
    [
      examModalMode,
      currentTopicId,
      currentEditingExam,
      getToken,
      fetchExamQuestions,
    ],
  );
  const performDeleteExamQuestion = useCallback(
    async (examId: number) => {
      if (currentTopicId === null) {
        showMessage({
          message: 'Lỗi: Không xác định được chủ đề hiện tại.',
          type: 'danger',
        });
        return;
      }
      if (!isMountedRef.current) return;
      setDeletingExamId(examId);
      try {
        const token = await getToken();
        await axios.delete(`${API_ADMIN_EXAM_URL}/delete?id=${examId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (!isMountedRef.current) return;
        showMessage({
          message: 'Xóa câu hỏi kiểm tra thành công!',
          type: 'success',
        });
        fetchExamQuestions(currentTopicId);
      } catch (apiError: any) {
        if (!isMountedRef.current) return;
        const errorMessage =
          apiError.response?.data?.message || 'Không thể xóa câu hỏi kiểm tra.';
        showMessage({message: errorMessage, type: 'danger', duration: 3000});
      } finally {
        if (isMountedRef.current) {
          setDeletingExamId(null);
          setIsDeleteExamConfirmVisible(false);
          setExamToDeleteConfirm(null);
        }
      }
    },
    [currentTopicId, getToken, fetchExamQuestions],
  );
  const handleCloseExamDeleteConfirm = useCallback(() => {
    setIsDeleteExamConfirmVisible(false);
    setExamToDeleteConfirm(null);
  }, []);
  const handleConfirmExamDelete = useCallback(() => {
    if (examToDeleteConfirm) {
      performDeleteExamQuestion(examToDeleteConfirm.id);
    }
  }, [examToDeleteConfirm, performDeleteExamQuestion]);
  const handleDeleteExamPress = useCallback(
    (examId: number, examName: string) => {
      Keyboard.dismiss();
      setExamToDeleteConfirm({id: examId, name: examName});
      setIsDeleteExamConfirmVisible(true);
    },
    [],
  );

  useEffect(() => {
    if (currentTopicId !== null) {
      if (activeTab === 'lessons') {
        fetchLessonsForTopic(currentTopicId);
      } else if (activeTab === 'tests') {
        fetchExamQuestions(currentTopicId);
      }
    } else {
      setLessons([]);
      setExamQuestions([]);
      const errorMsg = 'Không có ID chủ đề để tải dữ liệu.';
      setLessonsError(errorMsg);
      setExamsError(errorMsg);
    }
  }, [currentTopicId, fetchLessonsForTopic, fetchExamQuestions, activeTab]);
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
  const playSoundUniversal = useCallback(
    (audioUrlToPlayParam: string | null) => {
      if (!isMountedRef.current) return;
      if (!audioUrlToPlayParam) {
        setAudioUrlToPlayState(null);
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
        return;
      }
      if (
        audioRef.current &&
        isAudioPlaying &&
        audioUrlToPlayRef.current === audioUrlToPlayParam
      ) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
        return;
      }
      setAudioUrlToPlayState(null);
      audioUrlToPlayRef.current = audioUrlToPlayParam;
      setTimeout(() => {
        if (isMountedRef.current) {
          setAudioUrlToPlayState(audioUrlToPlayParam);
        }
      }, 50);
    },
    [isAudioPlaying],
  );

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

  const renderExamQuestionItem = useCallback(
    ({item}: {item: ApiExamQuestion}) => (
      <View style={styles.listItem}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={2}>
            {item.promptTextTemplate}
          </Text>
          <Text style={styles.itemDetailText} numberOfLines={1}>
            Loại: {getDisplayQuestionType(item.questionType)}
          </Text>
          {item.targetWordNative && (
            <Text style={styles.itemDetailExtraText} numberOfLines={1}>
              Từ khóa: {item.targetWordNative}
            </Text>
          )}
        </View>
        {item.audioUrlExam && (
          <TouchableOpacity
            style={styles.audioPlayButtonList}
            onPress={() => playSoundUniversal(item.audioUrlExam)}>
            <Image
              source={AUDIO_PLAY_ICON_MODAL} // Consistent icon usage
              style={styles.audioIconInList}
            />
          </TouchableOpacity>
        )}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditExamQuestion(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleDeleteExamPress(item.id, item.promptTextTemplate)
            }
            disabled={deletingExamId === item.id}>
            {deletingExamId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      deletingExamId,
      handleDeleteExamPress,
      handleEditExamQuestion,
      playSoundUniversal,
    ],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {topicTitleFromRoute || 'Chi tiết chủ đề'}
        </Text>
        <View
          style={{
            width:
              styles.backIconSubHeader.width +
              ((styles.backButtonSubHeader.padding as number) || 0) * 2,
          }}
        />
      </View>
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
      <View style={styles.buttonsRowContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => {
            if (topicCodeFromRoute && topicTitleFromRoute) {
              navigation.navigate('TheoryAdmin', {
                topic_code: topicCodeFromRoute,
                title: topicTitleFromRoute,
              });
            } else {
              Alert.alert('Lỗi', 'Không có thông tin chủ đề để xem lý thuyết.');
            }
          }}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>Lý thuyết</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={
            activeTab === 'lessons'
              ? handleAddNewLesson
              : handleAddNewExamQuestion
          }
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
      </View>
      {audioURLToPlay && (
        <Video
          ref={audioRef}
          source={{uri: audioURLToPlay}}
          paused={!isAudioPlaying}
          playInBackground={Platform.OS === 'ios'}
          playWhenInactive={Platform.OS === 'ios'}
          ignoreSilentSwitch="ignore"
          onLoadStart={() => {
            if (isMountedRef.current) {
              setIsAudioLoading(true);
              setAudioErrorState('');
            }
          }}
          onLoad={(data: OnLoadData) => {
            if (isMountedRef.current) {
              setIsAudioLoading(false);
              setIsAudioPlaying(true);
              audioRef.current?.seek(0);
            }
          }}
          onEnd={() => {
            if (isMountedRef.current) setIsAudioPlaying(false);
          }}
          onError={(videoError: any) => {
            if (isMountedRef.current) {
              console.error('Universal Audio Error:', videoError);
              setAudioErrorState('Lỗi phát audio.');
              setIsAudioLoading(false);
              setIsAudioPlaying(false);
            }
          }}
          style={{height: 0, width: 0}}
        />
      )}
      {isAudioLoading && (
        <ActivityIndicator
          style={styles.audioActivityIndicatorList}
          color={COLORS.primary}
        />
      )}
      {audioErrorState !== '' && (
        <Text style={styles.audioErrorTextList}>{audioErrorState}</Text>
      )}
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
      ) : isLoadingExams ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text>Đang tải câu hỏi kiểm tra...</Text>
        </View>
      ) : examsError ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{examsError}</Text>
        </View>
      ) : examQuestions.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Chủ đề này chưa có câu hỏi kiểm tra nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={examQuestions}
          renderItem={renderExamQuestionItem}
          keyExtractor={item => `exam-${item.id.toString()}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}
      {isSubmittingLesson && ( // Giữ nguyên loading overlay cho lesson
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.submittingText}>Đang xử lý...</Text>
        </View>
      )}
      <ConfirmDeleteModal
        visible={isDeleteLessonConfirmVisible}
        onClose={handleCloseLessonDeleteConfirm}
        onConfirm={handleConfirmLessonDelete}
        itemName={lessonToDeleteConfirm?.name ?? null}
        itemType="Bài học"
      />
      <ConfirmDeleteModal
        visible={isDeleteExamConfirmVisible}
        onClose={handleCloseExamDeleteConfirm}
        onConfirm={handleConfirmExamDelete}
        itemName={examToDeleteConfirm?.name ?? null}
        itemType="Câu hỏi kiểm tra"
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
      {isAddEditExamModalVisible && currentTopicId !== null && (
        <AddEditExamQuestionModal
          visible={isAddEditExamModalVisible}
          mode={examModalMode}
          initialData={currentEditingExam}
          currentTopicId={currentTopicId}
          onClose={() => {
            setIsAddEditExamModalVisible(false);
            setCurrentEditingExam(null);
          }}
          onSubmit={handleExamFormSubmit}
          playSoundInModal={playSoundUniversal}
          isSubmitting={isSubmittingExam}
        />
      )}
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

const styles = StyleSheet.create({
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
    paddingLeft: 0,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 10,
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
    backgroundColor: COLORS.nenItemDam, // Giả sử bạn có màu này
    borderBottomColor: COLORS.primary,
  },
  tabText: {fontSize: 16, color: COLORS.black || '#555555', fontWeight: '500'},
  tabTextActive: {color: COLORS.primary, fontWeight: 'bold'},
  buttonsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  itemDetailExtraText: {
    fontSize: 12,
    color: COLORS.darkGray, // Hoặc COLORS.textMuted
    fontStyle: 'italic',
    marginTop: 2,
  },
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
    zIndex: 10000, // Đảm bảo nó ở trên cùng
  },
  submittingText: {
    marginTop: 10,
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  audioPlayButtonList: {
    // Style cho nút play audio trong danh sách item
    padding: SIZES.base / 1.5,
    marginHorizontal: SIZES.base / 2, // Để có khoảng cách với text và action buttons
  },
  audioIconInList: {
    // Style cho icon audio trong danh sách item
    width: 24,
    height: 24,
    // tintColor: COLORS.primary, // Nếu muốn màu khác
  },
  audioActivityIndicatorList: {
    // Style cho loading audio trong danh sách (nếu cần hiển thị riêng)
    position: 'absolute', // Hoặc điều chỉnh vị trí phù hợp
    top: '50%',
    left: '50%',
    // transform: [{translateX: -12}, {translateY: -12}], // Căn giữa nếu là icon nhỏ
    zIndex: 10,
  },
  audioErrorTextList: {
    // Style cho text lỗi audio trong danh sách (nếu cần)
    textAlign: 'center',
    color: COLORS.red,
    marginVertical: SIZES.base,
  },
  audioPlayButtonSmallModal: {marginLeft: SIZES.base, padding: SIZES.base / 2},
  audioIconInListSmallModal: {
    width: 20,
    height: 20,
    // tintColor: COLORS.primary, // Nếu muốn màu khác
  },
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

export default LessonAdminScreen;
