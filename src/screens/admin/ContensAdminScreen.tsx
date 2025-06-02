// screens/admin/ContensAdminScreen.tsx
import React, {useState, useEffect, useCallback, useRef} from 'react';
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
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Video, VideoRef, OnLoadData} from 'react-native-video';
import {
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';

// --- Định nghĩa Type cho Câu hỏi (Client-side, dựa trên API response GET) ---
interface ApiQuestionChoice {
  id: number;
  textForeign: string;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null;
  textBlock?: string | null;
  isCorrect: boolean | number | null;
}
interface ApiQuestion {
  id: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audio_url_questions: string | null; // Giữ nguyên tên này nếu API trả về như vậy
  questionChoices: ApiQuestionChoice[];
  lessonId?: number;
}

// --- ICONS ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');
const DELETE_CHOICE_ICON = require('../../assets/images/iconThungRac.png');
const UPLOAD_ICON = require('../../assets/images/upAnh.png');

const QUESTION_TYPE_OPTIONS = [
  {label: 'Sắp xếp từ (WORD_ORDER)', value: 'WORD_ORDER'},
  {label: 'Câu hỏi audio (AUDIO_CHOICE)', value: 'AUDIO_CHOICE'},
  {
    label: 'Chọn theo câu hỏi (TEXT_ONLY)',
    value: 'MULTIPLE_CHOICE_TEXT_ONLY',
  },
  {
    label: 'Chọn ảnh (VOCAB_IMAGE)',
    value: 'MULTIPLE_CHOICE_VOCAB_IMAGE',
  },
  // THÊM MỚI 2 LOẠI CÂU HỎI
  {label: 'Bài luyện nói (PRONUNCIATION)', value: 'PRONUNCIATION'},
  {label: 'Bài luyện viết (WRITING)', value: 'WRITING'},
];

// --- Types cho Modal Form ---
interface RequestChoiceDTOForJson {
  id?: number;
  textForeign: string;
  textRomaji?: string | null;
  audioUrlForeign: string | null;
  textBlock: string;
  isCorrect: boolean;
}

interface RequestLessonQuesDTOForJson {
  lessonId: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audioUrlQuestions: string; // backend có thể nhận tên này hoặc audio_url_questions
  questionChoices: RequestChoiceDTOForJson[];
}

interface EditableQuestionChoiceClient {
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

// --- Types cho Navigation và Route ---
type ContensAdminScreenRouteProp = RouteProp<
  RootStackParamList,
  'ContentAdmin'
>;
type ContensAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ContentAdmin'
>;

// --- ConfirmDeleteModal (GIỮ NGUYÊN) ---
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

// --- STYLES for AddEditContentModal (GIỮ NGUYÊN) ---
const formModalStyles = StyleSheet.create({
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
  uploadButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    marginLeft: 5,
  },
  uploadIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
  },
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

// --- AddEditContentModal Component Definition ---
interface AddEditContentModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: ApiQuestion | null;
  currentLessonId: number | null;
  onClose: () => void;
  onSubmit: (
    jsonData: RequestLessonQuesDTOForJson,
    imageFiles: Asset[],
  ) => Promise<void>;
  playSoundInModal?: (url: string | null) => void;
  isSubmitting: boolean;
}

const AddEditContentModal: React.FC<AddEditContentModalProps> = ({
  visible,
  mode,
  initialData,
  currentLessonId,
  onClose,
  onSubmit,
  playSoundInModal,
  isSubmitting,
}) => {
  const [questionType, setQuestionType] = useState(
    QUESTION_TYPE_OPTIONS[0].value,
  );
  const [promptTextTemplate, setPromptTextTemplate] = useState('');
  const [targetWordNative, setTargetWordNative] = useState('');
  const [audioUrlQuestionsForm, setAudioUrlQuestionsForm] = useState('');
  const [currentQuestionChoices, setCurrentQuestionChoices] = useState<
    EditableQuestionChoiceClient[]
  >([]);

  const isInitialMountForVisibleModal = useRef(true);

  const getDisplayQuestionTypeLabel = (value: string) => {
    return (
      QUESTION_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value
    );
  };

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
        if (Array.isArray(parsedArray)) {
          return parsedArray.join(' / ');
        } else {
          return '[Lỗi dữ liệu khối từ]';
        }
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
      existingApiChoices?: ApiQuestionChoice[],
      baseTargetWord?: string,
    ) => {
      // THAY ĐỔI: Xử lý cho PRONUNCIATION và WRITING (không có choices)
      if (type === 'PRONUNCIATION' || type === 'WRITING') {
        setCurrentQuestionChoices([]);
        return;
      }

      let newChoices: EditableQuestionChoiceClient[] = [];
      const currentInitialDataForChoices =
        mode === 'edit' && initialData && initialData.questionType === type
          ? initialData.questionChoices
          : existingApiChoices || [];

      if (
        currentInitialDataForChoices &&
        currentInitialDataForChoices.length > 0
      ) {
        newChoices = currentInitialDataForChoices.map((c, index) => ({
          clientId: c.id ? `db-${c.id}` : `edit-temp-${Date.now()}-${index}`,
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
            clientId: existingChoice?.clientId || `temp-wo-${Date.now()}`,
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
        // Các loại câu hỏi khác (AUDIO_CHOICE, MULTIPLE_CHOICE_TEXT_ONLY, MULTIPLE_CHOICE_VOCAB_IMAGE)
        const minChoices = 4;
        const currentValidChoices = newChoices.filter(
          c => c.textForeign || c.imageUrl || c.imageFile,
        );
        while (currentValidChoices.length < minChoices) {
          currentValidChoices.push({
            clientId: `temp-${Date.now()}-${currentValidChoices.length}`,
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
        newChoices = currentValidChoices;
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
        setAudioUrlQuestionsForm(
          initialData.audio_url_questions || // Sử dụng audio_url_questions từ API
            (initialData as any).audioUrlQuestions || // Fallback nếu tên khác
            '',
        );
        initializeChoices(
          initialData.questionType,
          initialData.questionChoices,
          initialData.targetWordNative,
        );
      } else {
        const defaultType = QUESTION_TYPE_OPTIONS[0].value;
        setQuestionType(defaultType);
        setPromptTextTemplate('');
        setTargetWordNative('');
        setAudioUrlQuestionsForm('');
        initializeChoices(defaultType, [], '');
      }
    }
  }, [visible, mode, initialData, initializeChoices]);

  useEffect(() => {
    if (!visible) return;
    if (isInitialMountForVisibleModal.current) {
      isInitialMountForVisibleModal.current = false;
      return;
    }
    initializeChoices(questionType, [], targetWordNative);
  }, [visible, questionType, initializeChoices, targetWordNative]);

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
            clientId: `temp-wo-${Date.now()}`,
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
      EditableQuestionChoiceClient,
      'id' | 'clientId' | '_shuffledTextBlockDisplay' | 'imageFile'
    >,
    value: string | boolean | number | null,
  ) => {
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map(choice => {
        if (choice.clientId === choiceClientId) {
          return {...choice, [field]: value};
        }
        return choice;
      }),
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
          prevChoices.map(choice => {
            if (choice.clientId === choiceClientId) {
              return {
                ...choice,
                imageFile: imageAsset,
                imageUrl: imageAsset.uri || null,
              };
            }
            return choice;
          }),
        );
      }
    });
  }, []);

  const handleSetCorrectChoice = (choiceClientId: string) => {
    if (
      questionType === 'WORD_ORDER' ||
      questionType === 'PRONUNCIATION' || // THÊM
      questionType === 'WRITING' // THÊM
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
    if (
      questionType === 'WORD_ORDER' ||
      questionType === 'PRONUNCIATION' || // THÊM
      questionType === 'WRITING' // THÊM
    ) {
      Alert.alert(
        'Thông báo',
        `Loại câu hỏi "${getDisplayQuestionTypeLabel(
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
        clientId: `temp-${Date.now()}-${prev.length}`,
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
    if (
      questionType === 'PRONUNCIATION' || // THÊM
      questionType === 'WRITING' // THÊM
    ) {
      return; // Không áp dụng cho 2 loại này
    }
    const minRequiredChoices = questionType === 'WORD_ORDER' ? 1 : 4;
    if (currentQuestionChoices.length <= minRequiredChoices) {
      Alert.alert(
        'Thông báo',
        `Cần ít nhất ${minRequiredChoices} lựa chọn trả lời cho loại câu hỏi này.`,
      );
      return;
    }
    if (questionType === 'WORD_ORDER') return;
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
    if (!currentLessonId) {
      Alert.alert('Lỗi', 'Không xác định được ID bài học.');
      return;
    }

    if (!questionType.trim())
      return Alert.alert('Lỗi', 'Loại câu hỏi không được để trống.');
    if (!promptTextTemplate.trim())
      return Alert.alert('Lỗi', 'Mẫu câu hỏikhông được để trống.');
    if (!targetWordNative.trim())
      return Alert.alert('Lỗi', 'Từ khóa/Nội dung chính không được để trống.');

    // THAY ĐỔI: Validation cho audioUrlQuestionsForm
    if (questionType === 'PRONUNCIATION' && !audioUrlQuestionsForm.trim()) {
      return Alert.alert(
        'Lỗi',
        'Bài luyện nói (PRONUNCIATION) yêu cầu URL Audio câu hỏi.',
      );
    }
    // Đối với WRITING, audioUrlQuestionsForm không bắt buộc nên không cần kiểm tra ở đây.
    // Đối với các loại khác, audioUrlQuestionsForm vẫn bắt buộc như cũ.
    // (Nếu không phải PRONUNCIATION)
    if (
      questionType !== 'WRITING' &&
      questionType !== 'PRONUNCIATION' &&
      questionType !== 'MULTIPLE_CHOICE_VOCAB_IMAGE' &&
      questionType !== 'MULTIPLE_CHOICE_TEXT_ONLY' &&
      questionType !== 'WORD_ORDER' && // WRITING không bắt buộc audio
      !audioUrlQuestionsForm.trim()
    ) {
      return Alert.alert('Lỗi', 'URL Audio câu hỏi không được để trống.');
    }

    // Validation cho questionChoices dựa trên questionType
    if (questionType === 'WORD_ORDER') {
      if (currentQuestionChoices.length !== 1) {
        return Alert.alert(
          'Lỗi',
          'Câu hỏi Sắp xếp từ (WORD_ORDER) chỉ cho phép đúng 1 lựa chọn (là câu gốc).',
        );
      }
      const choice = currentQuestionChoices[0];
      if (
        !choice.textForeign.trim() ||
        targetWordNative.trim() !== choice.textForeign.trim()
      ) {
        return Alert.alert(
          'Lỗi',
          "WORD_ORDER: 'Nội dung/Đáp án chính' phải khớp với 'Câu gốc' trong lựa chọn và không được rỗng.",
        );
      }
      if (
        !choice.textBlock ||
        choice.textBlock.trim() === '' ||
        choice.textBlock === '[]'
      ) {
        return Alert.alert(
          'Lỗi',
          "WORD_ORDER: Vui lòng nhấn 'Trộn từ' hoặc đảm bảo 'Câu gốc' có nội dung để tạo khối từ xáo trộn.",
        );
      }
    } else if (
      // Áp dụng cho các loại có choices
      questionType === 'AUDIO_CHOICE' ||
      questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
      questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE'
    ) {
      if (currentQuestionChoices.length < 4) {
        return Alert.alert(
          'Lỗi',
          `Loại câu hỏi "${getDisplayQuestionTypeLabel(
            questionType,
          )}" yêu cầu ít nhất 4 lựa chọn trả lời.`,
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
            `Lựa chọn ${
              i + 1
            }: "Nội dung tiếng nước ngoài" không được để trống.`,
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
        if (questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE') {
          if (!choice.imageUrl && !choice.imageFile) {
            return Alert.alert(
              'Lỗi',
              `Lựa chọn ${i + 1}: Yêu cầu chọn một hình ảnh.`,
            );
          }
        }
      }
    }
    // PRONUNCIATION và WRITING không có validation cho choices ở đây

    // THAY ĐỔI: Tạo choicesToSubmitAPI
    const choicesToSubmitAPI: RequestChoiceDTOForJson[] =
      questionType === 'PRONUNCIATION' || questionType === 'WRITING'
        ? [] // Mảng rỗng cho PRONUNCIATION và WRITING
        : currentQuestionChoices.map(clientChoice => {
            const textBlockValue =
              questionType === 'WORD_ORDER' &&
              clientChoice.clientId === currentQuestionChoices[0]?.clientId
                ? clientChoice.textBlock || '[]'
                : '[]';
            return {
              id:
                typeof clientChoice.id === 'number'
                  ? clientChoice.id
                  : undefined,
              textForeign: clientChoice.textForeign,
              textRomaji: clientChoice.textRomaji || null,
              audioUrlForeign: clientChoice.audioUrlForeign || null,
              textBlock: textBlockValue,
              isCorrect: !!clientChoice.isCorrect,
            };
          });

    const lessonQuestionJsonData: RequestLessonQuesDTOForJson = {
      lessonId: currentLessonId,
      questionType: questionType,
      promptTextTemplate: promptTextTemplate.trim(),
      targetWordNative: targetWordNative.trim(),
      targetLanguageCode: initialData?.targetLanguageCode || 'ja',
      optionsLanguageCode: initialData?.optionsLanguageCode || 'vi',
      audioUrlQuestions: audioUrlQuestionsForm.trim(), // Đã trim, có thể rỗng cho WRITING
      questionChoices: choicesToSubmitAPI,
    };

    const imageFilesToUpload: Asset[] = currentQuestionChoices
      .map(choice => choice.imageFile)
      .filter(file => file !== null && file !== undefined) as Asset[];

    onSubmit(lessonQuestionJsonData, imageFilesToUpload);
  };

  // Biến cờ để kiểm tra xem có nên hiển thị phần choices không
  const showChoicesSection = !(
    questionType === 'PRONUNCIATION' || questionType === 'WRITING'
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={formModalStyles.backdrop} onPress={Keyboard.dismiss}>
        <Pressable
          style={formModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={formModalStyles.modalViewContent}>
            <View style={formModalStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={formModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStyles.headerTitle}>
                {mode === 'add' ? 'Thêm Câu Hỏi Mới' : 'Chỉnh Sửa Câu Hỏi'}
              </Text>
              <View
                style={{
                  width:
                    formModalStyles.backIcon.width +
                    ((formModalStyles.backButton.paddingHorizontal as number) ||
                      5) *
                      2,
                }}
              />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              contentContainerStyle={{paddingBottom: SIZES.padding * 12}}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Loại câu hỏi{' '}
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                {mode === 'edit' && initialData ? (
                  <TextInput
                    style={[
                      formModalStyles.input,
                      formModalStyles.readOnlyInput,
                    ]}
                    value={getDisplayQuestionTypeLabel(questionType)}
                    editable={false}
                  />
                ) : (
                  <View style={formModalStyles.pickerContainer}>
                    <Picker
                      selectedValue={questionType}
                      onValueChange={itemValue => {
                        if (itemValue) {
                          setQuestionType(itemValue.toString());
                        }
                      }}
                      style={formModalStyles.picker}
                      enabled={!isSubmitting && mode === 'add'}
                      dropdownIconColor={COLORS.gray}
                      mode="dropdown">
                      {QUESTION_TYPE_OPTIONS.map(opt => (
                        <Picker.Item
                          key={opt.value}
                          label={opt.label}
                          value={opt.value}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Nội dung câu hỏi
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    formModalStyles.input,
                    {height: 80, textAlignVertical: 'top'},
                  ]}
                  placeholder="Nhập yêu cầu hoặc mẫu câu hỏi"
                  value={promptTextTemplate}
                  onChangeText={setPromptTextTemplate}
                  multiline
                  editable={!isSubmitting}
                />
              </View>

              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE'
                    ? 'Từ khóa'
                    : questionType === 'WORD_ORDER'
                    ? 'Đáp án'
                    : questionType === 'PRONUNCIATION'
                    ? 'Câu/Từ cần luyện phát âm'
                    : questionType === 'WRITING'
                    ? 'Đề bài viết / Câu mẫu'
                    : 'Nhập từ khóa'}
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    formModalStyles.input,
                    (questionType === 'WORD_ORDER' ||
                      questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                      questionType === 'WRITING') && {
                      // Thêm WRITING cho multiline
                      height: 80,
                      textAlignVertical: 'top',
                    },
                  ]}
                  placeholder={
                    questionType === 'WORD_ORDER'
                      ? ''
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
                    questionType === 'WORD_ORDER' ||
                    questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                    questionType === 'WRITING' // Thêm WRITING
                  }
                  editable={!isSubmitting}
                />
              </View>

              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  URL Audio câu hỏi
                  {(questionType === 'PRONUNCIATION' ||
                    (questionType !== 'WRITING' &&
                      questionType !== 'WORD_ORDER' &&
                      questionType !== 'MULTIPLE_CHOICE_TEXT_ONLY' &&
                      questionType !== 'MULTIPLE_CHOICE_VOCAB_IMAGE')) && (
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  )}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TextInput
                    style={[
                      formModalStyles.input,
                      {
                        flex: 1,
                        marginRight:
                          audioUrlQuestionsForm && playSoundInModal
                            ? SIZES.base
                            : 0,
                      },
                    ]}
                    placeholder="https://example.com/audio.mp3"
                    value={audioUrlQuestionsForm}
                    onChangeText={setAudioUrlQuestionsForm}
                    keyboardType="url"
                    editable={!isSubmitting}
                  />
                  {audioUrlQuestionsForm && playSoundInModal && (
                    <TouchableOpacity
                      onPress={() => playSoundInModal(audioUrlQuestionsForm)}
                      style={styles.audioPlayButtonSmallModal}>
                      <Image
                        source={AUDIO_PLAY_ICON}
                        style={styles.audioIconInListSmallModal}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* THAY ĐỔI: Chỉ hiển thị phần choices nếu không phải PRONUNCIATION hoặc WRITING */}
              {showChoicesSection && (
                <>
                  <Text style={formModalStyles.choicesHeader}>
                    {questionType === 'WORD_ORDER'
                      ? 'Câu gốc & Khối từ xáo trộn'
                      : 'Các lựa chọn trả lời'}
                  </Text>

                  {currentQuestionChoices.map((choice, index) => (
                    <View
                      key={choice.clientId}
                      style={formModalStyles.choiceItemContainer}>
                      <View style={formModalStyles.choiceHeader}>
                        <Text style={formModalStyles.choiceIndexText}>
                          {questionType === 'WORD_ORDER'
                            ? 'Dữ liệu câu sắp xếp'
                            : `Lựa chọn ${index + 1}:`}
                        </Text>
                        {mode === 'add' &&
                          questionType !== 'WORD_ORDER' && // Đã được bao bởi showChoicesSection
                          currentQuestionChoices.length >
                            (questionType === 'WORD_ORDER' ? 1 : 4) && (
                            <TouchableOpacity
                              onPress={() =>
                                handleRemoveChoice(choice.clientId)
                              }
                              style={formModalStyles.deleteChoiceButtonSmall}>
                              <Image
                                source={DELETE_CHOICE_ICON}
                                style={formModalStyles.deleteChoiceIconSmall}
                              />
                            </TouchableOpacity>
                          )}
                      </View>

                      <Text style={formModalStyles.label}>
                        {questionType === 'WORD_ORDER'
                          ? 'Câu gốc'
                          : 'Nội dung tiếng nước ngoài'}
                        <Text style={formModalStyles.requiredStar}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          formModalStyles.input,
                          questionType === 'WORD_ORDER' &&
                            formModalStyles.readOnlyInput,
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
                          !isSubmitting && questionType !== 'WORD_ORDER'
                        }
                      />

                      {(questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' ||
                        questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
                        questionType === 'AUDIO_CHOICE') && (
                        <View style={formModalStyles.inputGroup}>
                          <Text style={formModalStyles.label}>
                            Romaji{' '}
                            <Text style={formModalStyles.requiredStar}>*</Text>
                          </Text>
                          <TextInput
                            style={formModalStyles.input}
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
                        questionType !== 'WORD_ORDER' && ( // Được bao bởi showChoicesSection
                          <View style={formModalStyles.inputGroup}>
                            <Text style={formModalStyles.label}>
                              URL Audio lựa chọn
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <TextInput
                                style={[
                                  formModalStyles.input,
                                  {
                                    flex: 1,
                                    marginRight:
                                      choice.audioUrlForeign && playSoundInModal
                                        ? SIZES.base
                                        : 0,
                                  },
                                ]}
                                placeholder="URL audio cho lựa chọn này (nếu có)"
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
                                    source={AUDIO_PLAY_ICON}
                                    style={styles.audioIconInListSmallModal}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}

                      {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                        <View style={formModalStyles.inputGroup}>
                          <Text style={formModalStyles.label}>
                            Hình ảnh{' '}
                            <Text style={formModalStyles.requiredStar}>*</Text>
                          </Text>
                          <View style={formModalStyles.imageInputContainer}>
                            {choice.imageUrl ? (
                              <Image
                                source={{uri: choice.imageUrl}}
                                style={formModalStyles.choiceImagePreview}
                              />
                            ) : (
                              <View
                                style={formModalStyles.choiceImagePlaceholder}>
                                <Text
                                  style={{color: COLORS.gray, fontSize: 12}}>
                                  Chưa có ảnh
                                </Text>
                              </View>
                            )}
                            <TouchableOpacity
                              style={formModalStyles.uploadButton}
                              onPress={() =>
                                handlePickImageForChoice(choice.clientId)
                              }
                              disabled={isSubmitting}>
                              <Image
                                source={UPLOAD_ICON}
                                style={formModalStyles.uploadIcon}
                              />
                              <Text style={formModalStyles.uploadButtonText}>
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
                              formModalStyles.inputGroup,
                              {marginTop: SIZES.base},
                            ]}>
                            <Text style={formModalStyles.label}>
                              Các khối từ xáo trộn:
                            </Text>
                            <TextInput
                              style={[
                                formModalStyles.input,
                                formModalStyles.readOnlyInput,
                                {minHeight: 60, textAlignVertical: 'top'},
                              ]}
                              value={choice.textBlock || '[]'}
                              editable={false}
                              multiline
                            />
                            <Text style={formModalStyles.label}>
                              Xem trước xáo trộn:
                            </Text>
                            <TextInput
                              style={[
                                formModalStyles.input,
                                formModalStyles.readOnlyInput,
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
                              styles.addNewButton, // Sử dụng style chung nếu phù hợp, hoặc tạo style mới
                              {
                                alignSelf: 'flex-start',
                                marginTop: SIZES.base,
                                backgroundColor: COLORS.secondary,
                                paddingVertical: 8, // Điều chỉnh padding
                                paddingHorizontal: 12, // Điều chỉnh padding
                                height: 'auto', // Cho phép chiều cao tự động
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

                      {questionType !== 'WORD_ORDER' && ( // Được bao bởi showChoicesSection
                        <TouchableOpacity
                          style={[
                            formModalStyles.correctChoiceButton,
                            (choice.isCorrect === true ||
                              choice.isCorrect === 1) &&
                              formModalStyles.correctChoiceButtonSelected,
                          ]}
                          onPress={() =>
                            handleSetCorrectChoice(choice.clientId)
                          }
                          disabled={isSubmitting}>
                          <Text
                            style={[
                              formModalStyles.correctChoiceButtonText,
                              (choice.isCorrect === true ||
                                choice.isCorrect === 1) &&
                                formModalStyles.correctChoiceButtonTextSelected,
                            ]}>
                            {choice.isCorrect === true || choice.isCorrect === 1
                              ? '✓ Đáp án đúng'
                              : 'Chọn làm đáp án đúng'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Được bao bởi showChoicesSection */}
                  {mode === 'add' && questionType !== 'WORD_ORDER' && (
                    <TouchableOpacity
                      onPress={handleAddChoice}
                      style={formModalStyles.addChoiceButton}
                      disabled={isSubmitting}>
                      <Text style={formModalStyles.addChoiceButtonText}>
                        Thêm lựa chọn
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                style={[
                  formModalStyles.submitButton,
                  isSubmitting && formModalStyles.submitButtonDisabled,
                ]}
                onPress={handleSubmitInternal}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={formModalStyles.submitButtonText}>
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

const ContensAdminScreen: React.FC = () => {
  const route = useRoute<ContensAdminScreenRouteProp>();
  const navigation = useNavigation<ContensAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {lesson_code: currentLessonIdParam, lesson_name: currentLessonName} =
    route.params;
  const currentLessonId = Number(currentLessonIdParam);

  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deletingItemCode, setDeletingItemCode] = useState<number | null>(null);
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditingItem, setCurrentEditingItem] =
    useState<ApiQuestion | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
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

  const API_BASE_URL = 'http://10.0.2.2:8080/api/admin/lesson-question';

  const fetchQuestions = useCallback(async () => {
    if (!currentLessonId) {
      if (isMountedRef.current) setError('Không có ID bài học.');
      if (isMountedRef.current) setIsLoading(false);
      return;
    }
    if (!isMountedRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.get<ApiQuestion[]>(
        `${API_BASE_URL}?lessonId=${currentLessonId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (isMountedRef.current) {
        const fetchedQuestions =
          response.data && Array.isArray(response.data) ? response.data : [];
        const standardizedQuestions = fetchedQuestions.map(q => ({
          ...q,
          // Đảm bảo audio_url_questions được chuẩn hóa từ các tên có thể có
          audio_url_questions:
            q.audio_url_questions || (q as any).audioUrlQuestions || null,
        }));
        setQuestions(standardizedQuestions);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      const msg =
        err.response?.data?.message || err.message || 'Không thể tải câu hỏi.';
      setError(msg);
      showMessage({message: msg, type: 'danger'});
      setQuestions([]);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [currentLessonId, getToken]);

  useEffect(() => {
    if (currentLessonId) {
      fetchQuestions();
    }
  }, [currentLessonId, fetchQuestions]);

  const getDisplayQuestionType = (type: string): string => {
    const foundType = QUESTION_TYPE_OPTIONS.find(opt => opt.value === type);
    return foundType ? foundType.label : type;
  };

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
          onPress: async () => await logout(),
        },
      ],
      {cancelable: true},
    );
  }, [logout]);

  const playSound = useCallback(
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

  const handleAddNewItem = () => {
    setModalMode('add');
    setCurrentEditingItem(null);
    setIsAddEditModalVisible(true);
  };
  const handleEditItem = (item: ApiQuestion) => {
    setModalMode('edit');
    setCurrentEditingItem(item);
    setIsAddEditModalVisible(true);
  };

  const handleFormSubmit = useCallback(
    async (
      lessonQuestionJsonData: RequestLessonQuesDTOForJson,
      imageFiles: Asset[],
    ) => {
      if (!currentLessonId) {
        showMessage({
          message: 'Không có ID bài học, không thể lưu.',
          type: 'danger',
        });
        return;
      }
      if (!isMountedRef.current) return;
      setIsSubmittingForm(true);

      const formData = new FormData();
      formData.append('lessonQuestion', JSON.stringify(lessonQuestionJsonData));

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
        if (modalMode === 'add') {
          url = `${API_BASE_URL}/create`;
          method = 'POST';
          successMessage = 'Thêm câu hỏi thành công!';
        } else {
          if (!currentEditingItem || !currentEditingItem.id) {
            throw new Error('Không tìm thấy ID câu hỏi để cập nhật.');
          }
          url = `${API_BASE_URL}/update?id=${currentEditingItem.id}`;
          method = 'PUT';
          successMessage = 'Cập nhật câu hỏi thành công!';
        }

        await axios({
          method: method,
          url: url,
          data: formData,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (!isMountedRef.current) return;
        showMessage({message: successMessage, type: 'success'});
        fetchQuestions(); // Tải lại danh sách câu hỏi
        setIsAddEditModalVisible(false);
        setCurrentEditingItem(null);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        console.error(
          `Lỗi khi ${modalMode === 'add' ? 'thêm' : 'sửa'} câu hỏi:`,
          err.response?.data || err.request || err.message || err,
        );
        const responseData = err.response?.data;
        let backendMessage = 'Thao tác thất bại. Vui lòng thử lại.';
        if (typeof responseData === 'string') {
          backendMessage = responseData;
        } else if (responseData && responseData.message) {
          backendMessage = responseData.message;
        } else if (
          responseData &&
          responseData.errors &&
          Array.isArray(responseData.errors)
        ) {
          backendMessage = responseData.errors
            .map((e: any) => e.defaultMessage || e.field)
            .join('\n');
        } else if (err.message) {
          backendMessage = err.message;
        }
        showMessage({message: backendMessage, type: 'danger', duration: 7000});
      } finally {
        if (isMountedRef.current) setIsSubmittingForm(false);
      }
    },
    [
      modalMode,
      currentLessonId,
      currentEditingItem,
      getToken,
      fetchQuestions,
      API_BASE_URL, // Đã có trong dependencies
    ],
  );

  const performDeleteItem = useCallback(
    async (questionId: number) => {
      if (!isMountedRef.current) return;
      setDeletingItemCode(questionId);
      try {
        const token = await getToken();
        await axios.delete(`${API_BASE_URL}/delete?id=${questionId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!isMountedRef.current) return;
        showMessage({
          message: `Đã xóa câu hỏi`,
          type: 'success',
        });
        fetchQuestions(); // Tải lại danh sách
      } catch (err: any) {
        if (!isMountedRef.current) return;
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Không thể xóa câu hỏi.';
        showMessage({message: msg, type: 'danger'});
      } finally {
        if (isMountedRef.current) {
          setDeletingItemCode(null);
          setIsDeleteConfirmVisible(false);
          setItemToDelete(null);
        }
      }
    },
    [getToken, fetchQuestions, API_BASE_URL], // API_BASE_URL đã có
  );

  const handleCloseDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmVisible(false);
    setItemToDelete(null);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) performDeleteItem(itemToDelete.id);
  }, [itemToDelete, performDeleteItem]);
  const handleDeletePress = useCallback((questionId: number, name: string) => {
    Keyboard.dismiss();
    setItemToDelete({id: questionId, name: name});
    setIsDeleteConfirmVisible(true);
  }, []);

  const renderContentItem = useCallback(
    ({item}: {item: ApiQuestion}) => (
      <View style={styles.listItem}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={2}>
            {item.promptTextTemplate}
          </Text>
          <Text style={styles.itemDetailText} numberOfLines={1}>
            Loại: {getDisplayQuestionType(item.questionType)}
          </Text>
          {item.targetWordNative && (
            <Text style={styles.itemDetailExtraText} numberOfLines={2}>
              Đáp án/Từ: {item.targetWordNative}
            </Text>
          )}
        </View>
        {/* Sử dụng item.audio_url_questions đã được chuẩn hóa */}
        {item.audio_url_questions && (
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={() => playSound(item.audio_url_questions)}>
            <Image source={AUDIO_PLAY_ICON} style={styles.audioIconInList} />
          </TouchableOpacity>
        )}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, {marginTop: SIZES.base}]}
            onPress={() => handleDeletePress(item.id, item.promptTextTemplate)}
            disabled={deletingItemCode === item.id}>
            {deletingItemCode === item.id ? (
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
    [
      deletingItemCode,
      getDisplayQuestionType, // Sẽ tự cập nhật khi QUESTION_TYPE_OPTIONS thay đổi
      handleEditItem,
      handleDeletePress,
      playSound,
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
          {currentLessonName || 'Nội dung bài học'}
        </Text>
        <View
          style={{
            width:
              styles.backIconSubHeader.width +
              ((styles.backButtonSubHeader.padding as number) || 0) * 2,
          }}
        />
      </View>
      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewItem}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>Thêm Câu Hỏi</Text>
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
              console.error('ContensAdmin Audio Error:', videoError);
              setAudioErrorState('Lỗi phát audio.');
              setIsAudioLoading(false);
              setIsAudioPlaying(false);
            }
          }}
          style={{height: 0, width: 0}} // Không hiển thị video player
        />
      )}
      {isAudioLoading && (
        <ActivityIndicator
          style={styles.audioActivityIndicator}
          color={COLORS.primary}
        />
      )}
      {audioErrorState !== '' && (
        <Text style={styles.audioErrorText}>{audioErrorState}</Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{marginTop: 10, color: COLORS.gray}}>
            Đang tải câu hỏi...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchQuestions} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Bài học này chưa có câu hỏi nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderContentItem}
          keyExtractor={item => `question-${item.id.toString()}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <ConfirmDeleteModal
        visible={isDeleteConfirmVisible}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name ?? null}
        itemType="Câu hỏi"
      />
      <AddEditContentModal
        visible={isAddEditModalVisible}
        mode={modalMode}
        initialData={currentEditingItem}
        currentLessonId={currentLessonId}
        onClose={() => {
          setIsAddEditModalVisible(false);
          setCurrentEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        playSoundInModal={playSound}
        isSubmitting={isSubmittingForm}
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
              {/* Added Pressable wrapper for the menu content if needed for layout */}
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
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {width: 20, height: 20, tintColor: COLORS.black},
  topicTitleStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'center',
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
  itemTextContainer: {flex: 1, justifyContent: 'center', marginRight: 8},
  itemNameText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 3,
  },
  itemDetailText: {fontSize: 13, color: '#555', marginBottom: 2},
  itemDetailExtraText: {fontSize: 13, color: '#777', fontStyle: 'italic'},
  actionButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginLeft: SIZES.base,
  },
  actionButton: {padding: SIZES.base / 2},
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.gray,
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
    color: COLORS.red,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  readOnlyInput: {
    // This style seems to be defined in formModalStyles already.
    // If used outside, it should be here or in a global style sheet.
    backgroundColor: COLORS.lightGray2,
    color: COLORS.darkGray,
    opacity: 0.7,
  },
  audioPlayButton: {padding: SIZES.base / 1.5, marginRight: SIZES.base / 2},
  audioIconInList: {width: 24, height: 24},
  audioPlayButtonSmallModal: {marginLeft: SIZES.base, padding: SIZES.base / 2},
  audioIconInListSmallModal: {
    width: 20,
    height: 20,
  },
  audioActivityIndicator: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    zIndex: 10,
  },
  audioErrorText: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    color: COLORS.red,
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 3,
    zIndex: 10,
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

export default ContensAdminScreen;
