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

// --- Định nghĩa Type cho Câu hỏi ---
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
  audio_url_questions: string | null;
  questionChoices: ApiQuestionChoice[];
}
// --- END Định nghĩa Type cho Câu hỏi ---

// --- ICONS ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');
const DELETE_CHOICE_ICON = require('../../assets/images/iconThungRac.png');
// --- END ICONS ---

// --- Định nghĩa QUESTION_TYPE_OPTIONS và QuestionTypeOption ở phạm vi module ---
const QUESTION_TYPE_OPTIONS = [
  {label: 'Sắp xếp từ (WORD_ORDER)', value: 'WORD_ORDER'},
  {label: 'Câu hỏi audio (AUDIO_CHOICE)', value: 'AUDIO_CHOICE'},
  {label: 'Chọn theo câu hỏi (TEXT_ONLY)', value: 'MULTIPLE_CHOICE_TEXT_ONLY'},
  {label: 'Chọn ảnh (VOCAB_IMAGE)', value: 'MULTIPLE_CHOICE_VOCAB_IMAGE'},
];
interface QuestionTypeOption {
  label: string;
  value: string;
}
// --- END QUESTION_TYPE_OPTIONS ---

// --- Types cho Modal Form ---
interface EditableQuestionChoiceClient {
  clientId: string; // ID duy nhất ở client (ví dụ: Date.now().toString())
  id?: number; // ID từ backend (nếu là edit)
  textForeign: string;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null;
  textBlock?: string | null;
  isCorrect: boolean | number | null;
  _shuffledTextBlockDisplay?: string; // Chỉ dùng cho UI hiển thị các từ đã trộn của WORD_ORDER
}

interface QuestionChoiceSubmitData {
  id?: number; // ID của choice, optional cho choice mới (backend sẽ tự tạo)
  textForeign: string;
  textRomaji?: string | null;
  imageUrl?: string | null;
  audioUrlForeign?: string | null;
  textBlock?: string | null;
  isCorrect: boolean | number | null;
}

interface AddEditContentModalFormData {
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  audio_url_questions: string | null;
  questionChoices: QuestionChoiceSubmitData[];
}
// --- END Types cho Modal Form ---

// --- ConfirmDeleteModal ---
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
// Style cho ConfirmDeleteModal (GIỮ NGUYÊN TỪ FILE GỐC CỦA BẠN)
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
// --- END ConfirmDeleteModal ---

// --- AddEditContentModal ---
interface AddEditContentModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: ApiQuestion | null;
  onClose: () => void;
  onSubmit: (data: AddEditContentModalFormData) => void;
}

const AddEditContentModal: React.FC<AddEditContentModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [questionType, setQuestionType] = useState(
    QUESTION_TYPE_OPTIONS[0].value,
  );
  const [promptTextTemplate, setPromptTextTemplate] = useState('');
  const [targetWordNative, setTargetWordNative] = useState('');
  const [audioUrlQuestions, setAudioUrlQuestions] = useState('');
  const [currentQuestionChoices, setCurrentQuestionChoices] = useState<
    EditableQuestionChoiceClient[]
  >([]);
  const [isQuestionTypePickerVisible, setIsQuestionTypePickerVisible] =
    useState(false);

  const getDisplayQuestionTypeLabel = (value: string) => {
    // Sử dụng QUESTION_TYPE_OPTIONS toàn cục
    return (
      QUESTION_TYPE_OPTIONS.find(
        (opt: QuestionTypeOption) => opt.value === value,
      )?.label || value
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
          console.warn(
            '[getShuffledDisplayFromTextBlock] Parsed textBlock is not an array:',
            parsedArray,
            'Original textBlock:',
            textBlockString,
          );
          return '[Lỗi dữ liệu khối từ]';
        }
      } catch (error) {
        console.error(
          '[getShuffledDisplayFromTextBlock] Failed to parse textBlock JSON:',
          textBlockString,
          error,
        );
        return '[Lỗi parse khối từ]';
      }
    }
    return '';
  };

  const initializeChoices = useCallback(
    (type: string, existingApiChoices?: ApiQuestionChoice[]) => {
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
          ...c,
          clientId: c.id ? `db-${c.id}` : `edit-temp-${Date.now()}-${index}`,
          id: c.id,
          _shuffledTextBlockDisplay: getShuffledDisplayFromTextBlock(
            c.textBlock,
          ),
          textRomaji: c.textRomaji === undefined ? null : c.textRomaji,
          audioUrlForeign:
            c.audioUrlForeign === undefined ? null : c.audioUrlForeign,
          imageUrl: c.imageUrl === undefined ? null : c.imageUrl,
          textBlock: c.textBlock === undefined ? null : c.textBlock,
        }));
      }

      if (type === 'WORD_ORDER') {
        if (newChoices.length === 0) {
          let textForWordOrder = '';
          let initialTextBlockValue = null;

          if (
            mode === 'edit' &&
            initialData &&
            initialData.questionType === 'WORD_ORDER'
          ) {
            textForWordOrder =
              initialData.questionChoices?.[0]?.textForeign ||
              initialData.targetWordNative ||
              '';
            initialTextBlockValue =
              initialData.questionChoices?.[0]?.textBlock || null;
          } else if (mode === 'add') {
            textForWordOrder = targetWordNative || '';
          }

          newChoices = [
            {
              clientId: `temp-${Date.now()}`,
              id:
                mode === 'edit' && initialData?.questionChoices?.[0]?.id
                  ? initialData.questionChoices[0].id
                  : undefined,
              textForeign: textForWordOrder,
              textRomaji: null,
              imageUrl: null,
              audioUrlForeign: null,
              textBlock: initialTextBlockValue,
              _shuffledTextBlockDisplay: getShuffledDisplayFromTextBlock(
                initialTextBlockValue,
              ),
              isCorrect: null,
            },
          ];
        } else if (newChoices.length >= 1) {
          newChoices = [newChoices[0]];
          if (!newChoices[0]._shuffledTextBlockDisplay) {
            newChoices[0]._shuffledTextBlockDisplay =
              getShuffledDisplayFromTextBlock(newChoices[0].textBlock);
          }
        }
      } else {
        const minChoices = 4; // Yêu cầu ít nhất 4 cho các loại khác
        while (newChoices.length < minChoices) {
          newChoices.push({
            clientId: `temp-${Date.now()}-${newChoices.length}`,
            textForeign: '',
            textRomaji: '',
            imageUrl: null,
            audioUrlForeign: null,
            isCorrect: false,
            textBlock: null,
          });
        }
      }
      setCurrentQuestionChoices(newChoices);
    },
    [mode, initialData, targetWordNative],
  );

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setQuestionType(initialData.questionType);
        setPromptTextTemplate(initialData.promptTextTemplate || '');
        setTargetWordNative(initialData.targetWordNative || '');
        setAudioUrlQuestions(initialData.audio_url_questions || '');
        initializeChoices(
          initialData.questionType,
          initialData.questionChoices,
        );
      } else {
        const defaultType = QUESTION_TYPE_OPTIONS[0].value;
        setQuestionType(defaultType);
        setPromptTextTemplate('');
        setTargetWordNative('');
        setAudioUrlQuestions('');
        initializeChoices(defaultType);
      }
    }
  }, [visible, mode, initialData, initializeChoices]);

  useEffect(() => {
    if (visible) {
      if (
        mode === 'edit' &&
        initialData &&
        initialData.questionType !== questionType
      ) {
        initializeChoices(questionType);
      } else if (mode === 'add') {
        initializeChoices(questionType);
      }

      if (questionType === 'AUDIO_CHOICE') {
        setTargetWordNative('');
      } else if (
        questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' &&
        mode === 'add'
      ) {
        if (
          !initialData ||
          initialData.questionType !== 'MULTIPLE_CHOICE_VOCAB_IMAGE'
        ) {
          setTargetWordNative('');
        }
      }
    }
  }, [questionType, visible, mode, initialData, initializeChoices]);

  const handleChoiceChange = (
    choiceClientId: string,
    field: keyof Omit<
      EditableQuestionChoiceClient,
      'id' | 'clientId' | '_shuffledTextBlockDisplay'
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

  const handleSetCorrectChoice = (choiceClientId: string) => {
    if (questionType === 'WORD_ORDER') return;
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map(choice => ({
        ...choice,
        isCorrect: choice.clientId === choiceClientId,
      })),
    );
  };

  const handleAddChoice = () => {
    if (questionType === 'WORD_ORDER') {
      Alert.alert(
        'Thông báo',
        'Loại câu hỏi Sắp xếp từ chỉ có một trường nhập câu gốc.',
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
        audioUrlForeign: null,
        isCorrect: false,
        textBlock: null,
      },
    ]);
  };

  const handleRemoveChoice = (choiceClientId: string) => {
    const minChoices = questionType === 'WORD_ORDER' ? 1 : 4;
    if (currentQuestionChoices.length <= minChoices) {
      Alert.alert('Thông báo', `Cần ít nhất ${minChoices} lựa chọn trả lời.`);
      return;
    }
    if (questionType === 'WORD_ORDER') return;

    setCurrentQuestionChoices(prev =>
      prev.filter(choice => choice.clientId !== choiceClientId),
    );
  };

  const shuffleWordsForTextBlock = (text: string): string[] => {
    if (!text || text.trim() === '') return [];
    const words =
      text.match(
        /[\u3000\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF65-\uFF9F0-9a-zA-Z]+|\S/g,
      ) || [];

    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words.filter(w => w.trim() !== '');
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

  const handleSubmit = () => {
    if (!promptTextTemplate.trim())
      return Alert.alert('Lỗi', 'Vui lòng nhập "Mẫu câu hỏi/Yêu cầu".');

    if (questionType === 'WORD_ORDER') {
      if (!targetWordNative.trim())
        return Alert.alert(
          'Lỗi',
          'WORD_ORDER: Vui lòng nhập "Nội dung/Đáp án chính" (câu đúng).',
        );
      if (currentQuestionChoices.length !== 1) {
        Alert.alert(
          'Lỗi',
          'Lỗi cấu hình: Câu hỏi WORD_ORDER cần đúng 1 lựa chọn.',
        );
        return;
      }
      const choice = currentQuestionChoices[0];
      if (!choice.textForeign.trim())
        return Alert.alert(
          'Lỗi',
          "WORD_ORDER: Vui lòng nhập câu gốc vào 'Nội dung tiếng nước ngoài'.",
        );
      if (
        !choice.textBlock ||
        choice.textBlock.trim() === '' ||
        choice.textBlock === '[]'
      )
        return Alert.alert(
          'Lỗi',
          "WORD_ORDER: Vui lòng nhấn 'Trộn từ' để tạo khối từ xáo trộn.",
        );
    } else if (questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE') {
      if (!targetWordNative.trim())
        return Alert.alert(
          'Lỗi',
          'Chọn Ảnh: Vui lòng nhập "Từ vựng" cho câu hỏi.',
        );
    } else if (questionType === 'AUDIO_CHOICE') {
      if (!audioUrlQuestions || !audioUrlQuestions.trim())
        return Alert.alert(
          'Lỗi',
          'Câu hỏi Audio: Yêu cầu "URL Audio câu hỏi".',
        );
    } else if (questionType === 'MULTIPLE_CHOICE_TEXT_ONLY') {
      if (!targetWordNative.trim())
        return Alert.alert(
          'Lỗi',
          'Chọn câu hỏi Text: Vui lòng nhập "Nội dung/Đáp án chính".',
        );
    }

    if (questionType !== 'WORD_ORDER') {
      if (currentQuestionChoices.length < 4)
        return Alert.alert('Lỗi', 'Cần ít nhất 4 lựa chọn trả lời.');
      let isCorrectChoiceSelected = false;
      for (let i = 0; i < currentQuestionChoices.length; i++) {
        const choice = currentQuestionChoices[i];
        if (!choice.textForeign || !choice.textForeign.trim())
          return Alert.alert(
            'Lỗi',
            `Lựa chọn ${
              i + 1
            }: "Nội dung tiếng nước ngoài" không được để trống.`,
          );

        if (questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE') {
          if (!choice.imageUrl || !choice.imageUrl.trim())
            return Alert.alert(
              'Lỗi',
              `Lựa chọn ${i + 1}: Yêu cầu "URL Hình ảnh".`,
            );
          if (!choice.textRomaji || !choice.textRomaji.trim())
            return Alert.alert('Lỗi', `Lựa chọn ${i + 1}: Yêu cầu "Romaji".`);
        } else if (
          questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
          questionType === 'AUDIO_CHOICE'
        ) {
          if (!choice.textRomaji || !choice.textRomaji.trim())
            return Alert.alert('Lỗi', `Lựa chọn ${i + 1}: Yêu cầu "Romaji".`);
        }
        if (choice.isCorrect === true) isCorrectChoiceSelected = true;
      }
      if (!isCorrectChoiceSelected)
        return Alert.alert('Lỗi', 'Vui lòng chọn một đáp án đúng.');
    }

    const choicesToSubmit: QuestionChoiceSubmitData[] =
      currentQuestionChoices.map(clientChoice => {
        const {
          clientId,
          _shuffledTextBlockDisplay,
          id: clientSideId,
          ...apiData
        } = clientChoice; // Lấy id từ clientChoice (có thể là number hoặc undefined)
        return {
          id: typeof clientSideId === 'number' ? clientSideId : undefined, // Chỉ gửi id nếu nó là number (từ DB)
          textForeign: apiData.textForeign,
          textRomaji: apiData.textRomaji,
          imageUrl: apiData.imageUrl,
          audioUrlForeign:
            questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' ||
            questionType === 'MULTIPLE_CHOICE_TEXT_ONLY' ||
            questionType === 'WORD_ORDER'
              ? null
              : apiData.audioUrlForeign,
          textBlock: apiData.textBlock,
          isCorrect: apiData.isCorrect,
        };
      });

    onSubmit({
      questionType: questionType,
      promptTextTemplate: promptTextTemplate.trim(),
      targetWordNative:
        questionType === 'AUDIO_CHOICE' ? '' : targetWordNative.trim(),
      audio_url_questions:
        questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' ||
        questionType === 'MULTIPLE_CHOICE_TEXT_ONLY'
          ? null
          : audioUrlQuestions.trim() || null,
      questionChoices: choicesToSubmit,
    });
  };

  const handleSelectQuestionType = (typeValue: string) => {
    setQuestionType(typeValue);
    setIsQuestionTypePickerVisible(false);
  };

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
                    (formModalStyles.backButton.paddingHorizontal ||
                      formModalStyles.backButton.padding ||
                      5) *
                      2,
                }}
              />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              contentContainerStyle={{paddingBottom: SIZES.padding * 10}}
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
                  <TouchableOpacity
                    style={[
                      formModalStyles.input,
                      formModalStyles.pickerDisplayButton,
                    ]}
                    onPress={() => setIsQuestionTypePickerVisible(true)}>
                    <Text style={formModalStyles.pickerDisplayText}>
                      {getDisplayQuestionTypeLabel(questionType) ||
                        'Chọn loại câu hỏi'}
                    </Text>
                    <Text style={formModalStyles.pickerDropdownIcon}>▼</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={formModalStyles.inputGroup}>
                <Text style={[formModalStyles.label, {fontWeight: 'bold'}]}>
                  Mẫu câu hỏi/Yêu cầu{' '}
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
                />
              </View>

              {questionType !== 'AUDIO_CHOICE' &&
                questionType !== 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                  <View style={formModalStyles.inputGroup}>
                    <Text style={[formModalStyles.label, {fontWeight: 'bold'}]}>
                      Nội dung/Đáp án chính
                      {questionType !== 'WORD_ORDER' && (
                        <Text style={formModalStyles.requiredStar}>*</Text>
                      )}
                      {questionType === 'WORD_ORDER' && (
                        <Text style={formModalStyles.requiredStar}>* </Text>
                      )}
                      (Câu đúng nếu là WORD_ORDER)
                    </Text>
                    <TextInput
                      style={[
                        formModalStyles.input,
                        (questionType === 'WORD_ORDER' ||
                          questionType === 'MULTIPLE_CHOICE_TEXT_ONLY') && {
                          height: 80,
                          textAlignVertical: 'top',
                        },
                      ]}
                      placeholder={
                        questionType === 'WORD_ORDER'
                          ? 'Nhập câu đúng (vd: わたしは ごはんを たべます)'
                          : 'Nhập nội dung hoặc đáp án'
                      }
                      value={targetWordNative}
                      onChangeText={setTargetWordNative}
                      multiline={
                        questionType === 'WORD_ORDER' ||
                        questionType === 'MULTIPLE_CHOICE_TEXT_ONLY'
                      }
                    />
                  </View>
                )}
              {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                <View style={formModalStyles.inputGroup}>
                  <Text style={[formModalStyles.label, {fontWeight: 'bold'}]}>
                    Từ vựng (cho câu hỏi chọn ảnh){' '}
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="Nhập từ vựng (vd: りんご)"
                    value={targetWordNative}
                    onChangeText={setTargetWordNative}
                  />
                </View>
              )}

              {(questionType === 'AUDIO_CHOICE' ||
                questionType === 'WORD_ORDER') && (
                <View style={formModalStyles.inputGroup}>
                  <Text
                    style={[
                      formModalStyles.label,
                      questionType === 'AUDIO_CHOICE' && {fontWeight: 'bold'},
                    ]}>
                    URL Audio câu hỏi{' '}
                    {questionType === 'AUDIO_CHOICE' && (
                      <Text style={formModalStyles.requiredStar}>*</Text>
                    )}
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder="https://example.com/audio.mp3 (tùy chọn cho WORD_ORDER)"
                    value={audioUrlQuestions}
                    onChangeText={setAudioUrlQuestions}
                  />
                </View>
              )}

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
                    {questionType !== 'WORD_ORDER' &&
                      currentQuestionChoices.length > 4 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveChoice(choice.clientId)}
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
                      ? 'Câu gốc (để tạo khối từ)'
                      : 'Nội dung tiếng nước ngoài'}
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={formModalStyles.input}
                    placeholder={
                      questionType === 'WORD_ORDER'
                        ? 'VD: わたしは ごはんを たべます'
                        : 'Nhập nội dung...'
                    }
                    value={choice.textForeign}
                    onChangeText={text =>
                      handleChoiceChange(choice.clientId, 'textForeign', text)
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
                        style={[formModalStyles.input]}
                        placeholder="Nhập Romaji"
                        value={choice.textRomaji || ''}
                        onChangeText={text =>
                          handleChoiceChange(
                            choice.clientId,
                            'textRomaji',
                            text,
                          )
                        }
                      />
                    </View>
                  )}

                  {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                    <View style={formModalStyles.inputGroup}>
                      <Text style={formModalStyles.label}>
                        URL Hình ảnh{' '}
                        <Text style={formModalStyles.requiredStar}>*</Text>
                      </Text>
                      <View style={formModalStyles.imageInputContainer}>
                        <TextInput
                          style={[
                            formModalStyles.input,
                            {flex: 1, marginRight: SIZES.base},
                          ]}
                          placeholder="https://example.com/image.png"
                          value={choice.imageUrl || ''}
                          onChangeText={text =>
                            handleChoiceChange(
                              choice.clientId,
                              'imageUrl',
                              text,
                            )
                          }
                        />
                        {choice.imageUrl ? (
                          <Image
                            source={{uri: choice.imageUrl}}
                            style={formModalStyles.choiceImagePreview}
                          />
                        ) : (
                          <View
                            style={formModalStyles.choiceImagePlaceholder}
                          />
                        )}
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
                          Các khối từ xáo trộn (JSON - tự động tạo):
                        </Text>
                        <TextInput
                          style={[
                            formModalStyles.input,
                            formModalStyles.readOnlyInput,
                            {minHeight: 60, textAlignVertical: 'top'},
                          ]}
                          value={choice.textBlock || 'Nhấn "Trộn từ" để tạo'}
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
                          styles.addNewButton,
                          {
                            alignSelf: 'flex-start',
                            marginTop: SIZES.base,
                            backgroundColor: COLORS.secondary,
                          },
                        ]}
                        onPress={() =>
                          handleShuffleWordOrderChoice(choice.clientId)
                        }>
                        <Text style={styles.addNewButtonText}>Trộn từ</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {questionType !== 'WORD_ORDER' && (
                    <TouchableOpacity
                      style={[
                        formModalStyles.correctChoiceButton,
                        choice.isCorrect === true &&
                          formModalStyles.correctChoiceButtonSelected,
                      ]}
                      onPress={() => handleSetCorrectChoice(choice.clientId)}>
                      <Text
                        style={[
                          formModalStyles.correctChoiceButtonText,
                          choice.isCorrect === true &&
                            formModalStyles.correctChoiceButtonTextSelected,
                        ]}>
                        {choice.isCorrect === true
                          ? '✓ Đáp án đúng'
                          : 'Chọn làm đáp án đúng'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {questionType !== 'WORD_ORDER' && (
                <TouchableOpacity
                  onPress={handleAddChoice}
                  style={formModalStyles.addChoiceButton}>
                  <Text style={formModalStyles.addChoiceButtonText}>
                    Thêm lựa chọn
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={formModalStyles.submitButton}
                onPress={handleSubmit}>
                <Text style={formModalStyles.submitButtonText}>
                  {mode === 'add' ? 'Thêm câu hỏi' : 'Lưu thay đổi'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
      <Modal
        transparent={true}
        visible={isQuestionTypePickerVisible}
        onRequestClose={() => setIsQuestionTypePickerVisible(false)}
        animationType="fade">
        <Pressable
          style={formModalStyles.pickerBackdrop}
          onPress={() => setIsQuestionTypePickerVisible(false)}>
          <View style={formModalStyles.pickerModalContainer}>
            <Text style={formModalStyles.pickerModalTitle}>
              Chọn loại câu hỏi
            </Text>
            {QUESTION_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={formModalStyles.pickerModalOption}
                onPress={() => handleSelectQuestionType(opt.value)}>
                <Text style={formModalStyles.pickerModalOptionText}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
};
// --- END: AddEditContentModal ---

// --- STYLES for AddEditContentModal ---
// Đảm bảo formModalStyles được định nghĩa ở đây, bên ngoài component AddEditContentModal
// nhưng trong cùng file để AddEditContentModal có thể truy cập.
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
    maxHeight: SIZES.height * 0.85,
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
  pickerDisplayButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerDisplayText: {fontSize: 16, color: '#333'},
  pickerDropdownIcon: {fontSize: 16, color: COLORS.gray},
  pickerBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContainer: {
    backgroundColor: 'white',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '80%',
    maxHeight: '60%',
  },
  pickerModalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  pickerModalOption: {
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  pickerModalOptionText: {fontSize: SIZES.medium, textAlign: 'center'},
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  choiceImagePreview: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.base,
    backgroundColor: COLORS.lightGray2,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  choiceImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.base,
    backgroundColor: COLORS.lightGray2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  wordOrderCorrectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base,
    justifyContent: 'flex-start',
  },
  labelInline: {fontSize: 14, color: '#444', marginRight: SIZES.base},
  inputSmall: {
    width: 60,
    height: 40,
    textAlign: 'center',
    paddingVertical: Platform.OS === 'ios' ? 8 : 2,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginLeft: SIZES.base,
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
  audioPreviewButton: {
    // Style này chưa được dùng trong code modal, bạn có thể bỏ nếu không cần
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.base / 1.5,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    alignSelf: 'flex-start',
  },
  audioPreviewIcon: {
    // Style này chưa được dùng trong code modal
    width: 18,
    height: 18,
    tintColor: COLORS.primary,
    marginRight: SIZES.base / 2,
  },
  audioPreviewText: {color: COLORS.primary, fontSize: SIZES.font * 0.9}, // Style này chưa được dùng
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
});

type ContentAdminScreenRouteProp = RouteProp<
  RootStackParamList,
  'ContentAdmin'
>;
type ContentAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ContentAdmin'
>;

const ContensAdminScreen: React.FC = () => {
  const route = useRoute<ContentAdminScreenRouteProp>();
  const navigation = useNavigation<ContentAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {lesson_code: currentLessonCode, lesson_name: currentLessonName} =
    route.params;

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
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

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

  const fetchQuestions = useCallback(async () => {
    if (currentLessonCode === undefined || currentLessonCode === null) {
      setError('Không có ID bài học để tải câu hỏi.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await axios.get<ApiQuestion[]>(
        `http://10.0.2.2:8080/api/admin/lesson-question/lesson?lessonId=${currentLessonCode}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (response.data && Array.isArray(response.data)) {
        setQuestions(response.data);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      console.error(
        'ContentAdminScreen: Lỗi tải câu hỏi:',
        JSON.stringify(err, null, 2),
      );
      if (axios.isAxiosError(err) && err.response) {
        console.error(
          'Axios error data:',
          JSON.stringify(err.response.data, null, 2),
        );
        setError(
          err.response.data.message ||
            err.message ||
            'Không thể tải danh sách câu hỏi.',
        );
      } else {
        setError(err.message || 'Không thể tải danh sách câu hỏi.');
      }
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLessonCode, getToken]);

  useEffect(() => {
    if (currentLessonCode !== undefined && currentLessonCode !== null) {
      fetchQuestions();
    }
  }, [currentLessonCode, fetchQuestions]);

  const getDisplayQuestionType = (type: string): string => {
    const foundType = QUESTION_TYPE_OPTIONS.find(
      (opt: QuestionTypeOption) => opt.value === type,
    );
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

  const performDeleteItem = useCallback(async (questionId: number) => {
    setDeletingItemCode(questionId);
    setQuestions(prev => prev.filter(item => item.id !== questionId));
    showMessage({
      message: `Đã xóa câu hỏi ID: ${questionId} (client-side)`,
      type: 'info',
    });
    setDeletingItemCode(null);
    setIsDeleteConfirmVisible(false);
    setItemToDelete(null);
  }, []);

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
    (formData: AddEditContentModalFormData) => {
      const ensureFullApiQuestionChoice = (
        choiceData: QuestionChoiceSubmitData,
        index: number,
      ): ApiQuestionChoice => {
        let idForClientState: number;
        if (choiceData.id !== undefined && typeof choiceData.id === 'number') {
          idForClientState = choiceData.id;
        } else {
          idForClientState =
            Date.now() + index + Math.floor(Math.random() * 10000);
        }
        return {
          id: idForClientState,
          textForeign: choiceData.textForeign || '',
          textRomaji:
            choiceData.textRomaji === undefined ? null : choiceData.textRomaji,
          imageUrl:
            choiceData.imageUrl === undefined ? null : choiceData.imageUrl,
          audioUrlForeign:
            choiceData.audioUrlForeign === undefined
              ? null
              : choiceData.audioUrlForeign,
          textBlock:
            choiceData.textBlock === undefined ? null : choiceData.textBlock,
          isCorrect:
            choiceData.isCorrect === undefined ? null : choiceData.isCorrect,
        };
      };

      if (modalMode === 'add') {
        const newItem: ApiQuestion = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          questionType: formData.questionType,
          promptTextTemplate: formData.promptTextTemplate,
          targetWordNative: formData.targetWordNative,
          audio_url_questions: formData.audio_url_questions,
          targetLanguageCode: 'ja',
          optionsLanguageCode: 'vi',
          questionChoices: formData.questionChoices.map((qc, index) =>
            ensureFullApiQuestionChoice(qc, index),
          ),
        };
        setQuestions(prev => [newItem, ...prev].sort((a, b) => a.id - b.id));
        showMessage({
          message: `Đã thêm câu hỏi "${newItem.promptTextTemplate}"! (client-side)`,
          type: 'success',
        });
      } else if (modalMode === 'edit' && currentEditingItem) {
        const updatedQuestion: ApiQuestion = {
          ...currentEditingItem,
          questionType: formData.questionType,
          promptTextTemplate: formData.promptTextTemplate,
          targetWordNative: formData.targetWordNative,
          audio_url_questions: formData.audio_url_questions,
          targetLanguageCode: currentEditingItem.targetLanguageCode || 'ja',
          optionsLanguageCode: currentEditingItem.optionsLanguageCode || 'vi',
          questionChoices: formData.questionChoices.map((qc, index) =>
            ensureFullApiQuestionChoice(qc, index),
          ),
        };
        setQuestions(prev =>
          prev.map(item =>
            item.id === currentEditingItem.id ? updatedQuestion : item,
          ),
        );
        showMessage({
          message: `Đã cập nhật câu hỏi "${formData.promptTextTemplate}"! (client-side)`,
          type: 'success',
        });
      }
      setIsAddEditModalVisible(false);
      setCurrentEditingItem(null);
    },
    [modalMode, currentEditingItem],
  );

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
          {item.questionType !== 'AUDIO_CHOICE' &&
            item.questionType !== 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
              <Text style={styles.itemDetailExtraText} numberOfLines={2}>
                Đáp án: {item.targetWordNative}
              </Text>
            )}
        </View>

        {item.audio_url_questions && (
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={() =>
              Alert.alert(
                'Phát Audio Câu Hỏi',
                item.audio_url_questions || 'Không có URL',
              )
            }>
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
      getDisplayQuestionType,
      handleEditItem,
      handleDeletePress,
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
              (styles.backButtonSubHeader.padding ||
                styles.backButtonSubHeader.padding ||
                styles.backButtonSubHeader.padding ||
                0) *
                2,
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
  },
  actionButton: {padding: 6},
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
    backgroundColor: COLORS.lightGray2,
    color: COLORS.darkGray,
    opacity: 0.7,
  },
  audioPlayButton: {
    padding: SIZES.base / 2,
    marginLeft: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIconInList: {width: 24, height: 24},
  audioActivityIndicator: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  audioErrorText: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    color: COLORS.red,
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 3,
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
// --- END: Styles ---

export default ContensAdminScreen;
