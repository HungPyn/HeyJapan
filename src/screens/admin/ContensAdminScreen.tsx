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

// --- Định nghĩa Type cho Câu hỏi ---
interface ApiQuestionChoice {
  id: number;
  textForeign: string;
  textRomaji?: string; // Cho phép optional cho WORD_ORDER
  imageUrl: string | null;
  audioUrlForeign: string | null;
  isCorrect: boolean | number | null;
}

interface ApiQuestion {
  id: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string; // Sẽ ẩn đi nếu là AUDIO_CHOICE
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audio_url_questions: string | null;
  questionChoices: ApiQuestionChoice[];
}
// --- END Định nghĩa Type cho Câu hỏi ---

// --- Dữ liệu cứng ---
const hardcodedQuestionsData: ApiQuestion[] = [
  {
    id: 1,
    questionType: 'WORD_ORDER',
    promptTextTemplate: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
    targetWordNative: 'わたしは ごはんを たべます。',
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'ja',
    audio_url_questions:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=わたしは ごはんを たべます&tl=ja&client=tw-ob',
    questionChoices: [
      {
        id: 101,
        textForeign: 'ごはんを',
        textRomaji: 'gohan o',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: 2,
      },
      {
        id: 102,
        textForeign: 'わたしは',
        textRomaji: 'watashi wa',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: 1,
      },
      {
        id: 103,
        textForeign: 'たべます',
        textRomaji: 'tabemasu',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: 3,
      },
      {
        id: 104,
        textForeign: 'たべます',
        textRomaji: '.',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: 4,
      },
    ],
  },
  {
    id: 2,
    questionType: 'AUDIO_CHOICE',
    promptTextTemplate: "Nghe âm thanh và chọn nghĩa đúng cho 'こんにちは'.",
    targetWordNative: '', // Bỏ targetWordNative cho AUDIO_CHOICE theo yêu cầu
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi',
    audio_url_questions:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=こんにちは&tl=ja&client=tw-ob',
    questionChoices: [
      {
        id: 201,
        textForeign: 'Chào buổi sáng',
        textRomaji: 'Ohayou gozaimasu',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 202,
        textForeign: 'Xin chào (ban ngày/chiều)',
        textRomaji: 'Konnichiwa',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: true,
      },
      {
        id: 203,
        textForeign: 'Chào buổi tối',
        textRomaji: 'Konbanwa',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 204,
        textForeign: 'Tạm biệt',
        textRomaji: 'Sayounara',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
    ],
  },
  {
    id: 3,
    questionType: 'MULTIPLE_CHOICE_TEXT_ONLY',
    promptTextTemplate: "Đâu là cách viết đúng của 'Tôi muốn đi Nhật'?",
    targetWordNative: 'にほんへいきたいです',
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'ja',
    audio_url_questions: null,
    questionChoices: [
      {
        id: 301,
        textForeign: 'にほんへいきたいです',
        textRomaji: 'Nihon e ikitai desu',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: true,
      },
      {
        id: 302,
        textForeign: 'にほんへいきました',
        textRomaji: 'Nihon e ikimashita',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 303,
        textForeign: 'にほんへいきます',
        textRomaji: 'Nihon e ikimasu',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 304,
        textForeign: 'にほんでたべたいです',
        textRomaji: 'Nihon de tabetai desu',
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: false,
      },
    ],
  },
  {
    id: 4,
    questionType: 'MULTIPLE_CHOICE_VOCAB_IMAGE',
    promptTextTemplate: "Chọn hình ảnh tương ứng với từ 'りんご' (quả táo).",
    targetWordNative: 'りんご',
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi',
    audio_url_questions:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=りんご&tl=ja&client=tw-ob',
    questionChoices: [
      {
        id: 401,
        textForeign: 'Chuối',
        textRomaji: 'Banana',
        imageUrl: 'https://i.imgur.com/BI2iGmn.jpeg',
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 402,
        textForeign: 'Cam',
        textRomaji: 'Orenji',
        imageUrl: 'https://i.imgur.com/R8WeIEv.jpeg',
        audioUrlForeign: null,
        isCorrect: false,
      },
      {
        id: 403,
        textForeign: 'Táo',
        textRomaji: 'Ringo',
        imageUrl: 'https://i.imgur.com/oVacZ4F.png',
        audioUrlForeign: null,
        isCorrect: true,
      },
      {
        id: 404,
        textForeign: 'Nho',
        textRomaji: 'Budou',
        imageUrl: 'https://i.imgur.com/na3U2uk.png',
        audioUrlForeign: null,
        isCorrect: false,
      },
    ],
  },
];
// --- END Dữ liệu cứng ---

// --- ICONS ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');
const ADD_CHOICE_ICON = require('../../assets/images/iconThungRac.png');
const DELETE_CHOICE_ICON = require('../../assets/images/iconThungRac.png');
// --- END ICONS ---

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
const confirmModalStyles = StyleSheet.create({
  /* ... styles giữ nguyên ... */
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
interface AddEditContentModalFormData {
  // Dùng cho dữ liệu submit từ form
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string; // Sẽ là rỗng nếu là AUDIO_CHOICE
  audio_url_questions: string | null;
  questionChoices: ApiQuestionChoice[];
}

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
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE_TEXT_ONLY');
  const [promptTextTemplate, setPromptTextTemplate] = useState('');
  const [targetWordNative, setTargetWordNative] = useState('');
  const [audioUrlQuestions, setAudioUrlQuestions] = useState('');
  const [currentQuestionChoices, setCurrentQuestionChoices] = useState<
    ApiQuestionChoice[]
  >([]);
  const [isQuestionTypePickerVisible, setIsQuestionTypePickerVisible] =
    useState(false);

  const questionTypeOptions = [
    {label: 'Sắp xếp từ', value: 'WORD_ORDER'},
    {label: 'Câu hỏi audio', value: 'AUDIO_CHOICE'},
    {label: 'Chọn theo câu hỏi (text)', value: 'MULTIPLE_CHOICE_TEXT_ONLY'},
    {label: 'Chọn ảnh', value: 'MULTIPLE_CHOICE_VOCAB_IMAGE'},
  ];

  const getDisplayQuestionTypeLabel = (value: string) => {
    return questionTypeOptions.find(opt => opt.value === value)?.label || value;
  };

  const initializeOrResetChoices = (
    choices?: ApiQuestionChoice[],
    type?: string,
  ) => {
    const qType = type || questionType;
    let newChoices: ApiQuestionChoice[] = [];
    if (choices && choices.length > 0) {
      newChoices = JSON.parse(
        JSON.stringify(
          choices.map(c => ({...c, id: c.id || Date.now() + Math.random()})),
        ),
      );
    }

    while (newChoices.length < 4) {
      newChoices.push({
        id: Date.now() + newChoices.length + Math.random(),
        textForeign: '',
        textRomaji: qType === 'WORD_ORDER' ? '' : undefined, // Romaji không bắt buộc cho WORD_ORDER nữa
        imageUrl: null,
        audioUrlForeign: null,
        isCorrect: qType === 'WORD_ORDER' ? null : false,
      });
    }

    newChoices = newChoices.map(choice => ({
      ...choice,
      id: choice.id || Date.now() + Math.random(),
      textRomaji:
        qType === 'WORD_ORDER' && choice.textRomaji === undefined
          ? ''
          : choice.textRomaji, // Đảm bảo romaji là string cho WORD_ORDER nếu ban đầu là undefined
      audioUrlForeign:
        qType === 'WORD_ORDER' || qType === 'AUDIO_CHOICE'
          ? null
          : choice.audioUrlForeign, // Bỏ audio choice cho WORD_ORDER và AUDIO_CHOICE
      isCorrect:
        qType === 'WORD_ORDER'
          ? typeof choice.isCorrect === 'number'
            ? choice.isCorrect
            : null
          : typeof choice.isCorrect === 'boolean'
          ? choice.isCorrect
          : false,
    }));

    setCurrentQuestionChoices(newChoices);
  };

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setQuestionType(initialData.questionType);
        setPromptTextTemplate(initialData.promptTextTemplate);
        setTargetWordNative(
          initialData.questionType === 'AUDIO_CHOICE'
            ? ''
            : initialData.targetWordNative,
        );
        setAudioUrlQuestions(initialData.audio_url_questions || '');
        initializeOrResetChoices(
          initialData.questionChoices,
          initialData.questionType,
        );
      } else {
        const defaultType =
          questionTypeOptions[0]?.value || 'MULTIPLE_CHOICE_TEXT_ONLY';
        setQuestionType(defaultType);
        setPromptTextTemplate('');
        setTargetWordNative('');
        setAudioUrlQuestions('');
        initializeOrResetChoices(undefined, defaultType);
      }
    }
  }, [visible, mode, initialData]);

  useEffect(() => {
    if (visible && mode === 'add') {
      setCurrentQuestionChoices(prevChoices =>
        prevChoices.map(choice => ({
          ...choice,
          textRomaji:
            questionType === 'WORD_ORDER' && choice.textRomaji === undefined
              ? ''
              : choice.textRomaji,
          audioUrlForeign:
            questionType === 'WORD_ORDER' || questionType === 'AUDIO_CHOICE'
              ? null
              : choice.audioUrlForeign,
          isCorrect: questionType === 'WORD_ORDER' ? null : false,
        })),
      );
      if (questionType === 'AUDIO_CHOICE') {
        setTargetWordNative(''); // Xóa targetWordNative khi chọn AUDIO_CHOICE
      }
    }
  }, [questionType, visible, mode]);

  const handleChoiceChange = (
    index: number,
    field: keyof Omit<ApiQuestionChoice, 'id'>,
    value: string | boolean | number | null,
  ) => {
    const newChoices = [...currentQuestionChoices];
    // @ts-ignore
    newChoices[index][field] = value;
    setCurrentQuestionChoices(newChoices);
  };

  const handleSetCorrectChoice = (selectedIndex: number) => {
    if (questionType === 'WORD_ORDER') return;
    setCurrentQuestionChoices(prevChoices =>
      prevChoices.map((choice, index) => ({
        ...choice,
        isCorrect: index === selectedIndex,
      })),
    );
  };

  const handleAddChoice = () => {
    setCurrentQuestionChoices(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        textForeign: '',
        textRomaji: questionType === 'WORD_ORDER' ? '' : undefined,
        imageUrl: null,
        audioUrlForeign:
          questionType === 'WORD_ORDER' || questionType === 'AUDIO_CHOICE'
            ? null
            : '',
        isCorrect: questionType === 'WORD_ORDER' ? null : false,
      },
    ]);
  };

  const handleRemoveChoice = (idToRemove: number) => {
    if (currentQuestionChoices.length <= 4) {
      Alert.alert('Thông báo', 'Cần ít nhất 4 lựa chọn trả lời.');
      return;
    }
    setCurrentQuestionChoices(prev =>
      prev.filter(choice => choice.id !== idToRemove),
    );
  };

  const handleSubmit = () => {
    if (!promptTextTemplate.trim())
      return Alert.alert('Lỗi', 'Vui lòng nhập "Mẫu câu hỏi/Yêu cầu".');
    if (questionType !== 'AUDIO_CHOICE' && !targetWordNative.trim()) {
      // targetWordNative không bắt buộc cho AUDIO_CHOICE
      return Alert.alert('Lỗi', 'Vui lòng nhập "Nội dung/Đáp án chính".');
    }
    if (questionType === 'AUDIO_CHOICE' && !audioUrlQuestions.trim()) {
      return Alert.alert('Lỗi', 'Câu hỏi audio yêu cầu "URL Audio câu hỏi".');
    }
    if (currentQuestionChoices.length < 4)
      return Alert.alert('Lỗi', 'Cần ít nhất 4 lựa chọn trả lời.');

    for (let i = 0; i < currentQuestionChoices.length; i++) {
      const choice = currentQuestionChoices[i];
      if (!choice.textForeign.trim())
        return Alert.alert(
          'Lỗi',
          `Lựa chọn ${i + 1}: "Nội dung tiếng nước ngoài" không được để trống.`,
        );
      // Romaji không bắt buộc cho WORD_ORDER hoặc nếu nó là undefined
      if (
        questionType !== 'WORD_ORDER' &&
        (!choice.textRomaji || !choice.textRomaji.trim())
      ) {
        return Alert.alert(
          'Lỗi',
          `Lựa chọn ${i + 1}: "Romaji" không được để trống.`,
        );
      }
      if (questionType === 'WORD_ORDER' && !choice.textRomaji?.trim()) {
        // Vẫn bắt buộc romaji cho word_order nếu field đó được hiển thị
        return Alert.alert(
          'Lỗi',
          `Lựa chọn ${i + 1}: "Romaji" cho WORD_ORDER không được để trống.`,
        );
      }
      if (
        questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' &&
        !choice.imageUrl?.trim()
      ) {
        return Alert.alert(
          'Lỗi',
          `Lựa chọn ${
            i + 1
          }: Câu hỏi chọn ảnh yêu cầu tất cả lựa chọn phải có "URL Hình ảnh".`,
        );
      }
    }

    if (questionType !== 'WORD_ORDER') {
      const correctAnswersCount = currentQuestionChoices.filter(
        c => c.isCorrect === true,
      ).length;
      if (correctAnswersCount !== 1)
        return Alert.alert(
          'Lỗi',
          'Với loại câu hỏi này, cần chọn chính xác một đáp án đúng.',
        );
    } else {
      const orderedChoicesCount = currentQuestionChoices.filter(
        c => typeof c.isCorrect === 'number' && c.isCorrect > 0,
      ).length;
      if (orderedChoicesCount < 2) {
        return Alert.alert(
          'Lỗi',
          'Câu hỏi sắp xếp từ cần ít nhất 2 lựa chọn có thứ tự hợp lệ.',
        );
      }
    }

    onSubmit({
      questionType: questionType,
      promptTextTemplate: promptTextTemplate.trim(),
      targetWordNative:
        questionType === 'AUDIO_CHOICE' ? '' : targetWordNative.trim(),
      audio_url_questions: audioUrlQuestions.trim() || null,
      questionChoices: currentQuestionChoices,
    });
  };

  const handleSelectQuestionType = (typeValue: string) => {
    setQuestionType(typeValue);
    setIsQuestionTypePickerVisible(false);
    // Không reset choices ở đây nữa, useEffect sẽ làm
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={formModalStyles.backdrop} onPress={onClose}>
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
                    (formModalStyles.backButton.paddingHorizontal || 5) * 2,
                }}
              />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              contentContainerStyle={{paddingBottom: SIZES.padding * 5}} // Tăng padding bottom
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Các trường bắt buộc ở trên cùng */}
              <View style={formModalStyles.inputGroup}>
                <Text style={[formModalStyles.label, {fontWeight: 'bold'}]}>
                  Mẫu câu hỏi/Yêu cầu
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

              {questionType !== 'AUDIO_CHOICE' && ( // Ẩn nếu là AUDIO_CHOICE
                <View style={formModalStyles.inputGroup}>
                  <Text style={[formModalStyles.label, {fontWeight: 'bold'}]}>
                    Nội dung/Đáp án chính
                    <Text style={formModalStyles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      formModalStyles.input,
                      {height: 80, textAlignVertical: 'top'},
                    ]}
                    placeholder="Nhập nội dung chính hoặc đáp án"
                    value={targetWordNative}
                    onChangeText={setTargetWordNative}
                    multiline
                  />
                </View>
              )}

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
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrlQuestions}
                  onChangeText={setAudioUrlQuestions}
                />
                {audioUrlQuestions && audioUrlQuestions.trim() !== '' && (
                  <TouchableOpacity
                    style={formModalStyles.audioPreviewButton}
                    onPress={() =>
                      Alert.alert(
                        'Phát thử Audio Câu hỏi',
                        'Chức năng phát thử audio (URL: ' +
                          audioUrlQuestions +
                          ') sẽ được tích hợp sau.',
                      )
                    }>
                    <Image
                      source={AUDIO_PLAY_ICON}
                      style={formModalStyles.audioPreviewIcon}
                    />
                    <Text style={formModalStyles.audioPreviewText}>
                      Phát thử
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Kết thúc các trường bắt buộc */}

              <View style={formModalStyles.inputGroup}>
                <Text style={formModalStyles.label}>
                  Loại câu hỏi
                  <Text style={formModalStyles.requiredStar}>*</Text>
                </Text>
                {mode === 'edit' ? (
                  <TextInput
                    style={[
                      formModalStyles.input,
                      formModalStyles.readOnlyInput,
                    ]}
                    value={
                      questionTypeOptions.find(
                        opt => opt.value === questionType,
                      )?.label || questionType
                    }
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
                      {questionTypeOptions.find(
                        opt => opt.value === questionType,
                      )?.label || 'Chọn loại câu hỏi'}
                    </Text>
                    <Text style={formModalStyles.pickerDropdownIcon}>▼</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={formModalStyles.choicesHeader}>
                Các lựa chọn trả lời (ít nhất 4):
              </Text>
              {currentQuestionChoices.map((choice, index) => (
                <View
                  key={choice.id}
                  style={formModalStyles.choiceItemContainer}>
                  <View style={formModalStyles.choiceHeader}>
                    <Text style={formModalStyles.choiceIndexText}>
                      Lựa chọn {index + 1}:
                    </Text>
                    {currentQuestionChoices.length > 4 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveChoice(choice.id)}
                        style={formModalStyles.deleteChoiceButtonSmall}>
                        <Image
                          source={DELETE_CHOICE_ICON}
                          style={formModalStyles.deleteChoiceIconSmall}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TextInput
                    style={formModalStyles.input}
                    placeholder="Nội dung tiếng nước ngoài (*)"
                    value={choice.textForeign}
                    onChangeText={text =>
                      handleChoiceChange(index, 'textForeign', text)
                    }
                  />
                  {/* Romaji không hiển thị cho WORD_ORDER */}
                  {questionType !== 'WORD_ORDER' && (
                    <TextInput
                      style={[formModalStyles.input, {marginTop: SIZES.base}]}
                      placeholder="Romaji (*)"
                      value={choice.textRomaji || ''}
                      onChangeText={text =>
                        handleChoiceChange(index, 'textRomaji', text)
                      }
                    />
                  )}
                  {/* Audio URL cho lựa chọn (không hiển thị cho WORD_ORDER và AUDIO_CHOICE) */}
                  {questionType !== 'WORD_ORDER' &&
                    questionType !== 'AUDIO_CHOICE' && (
                      <>
                        <TextInput
                          style={[
                            formModalStyles.input,
                            {marginTop: SIZES.base},
                          ]}
                          placeholder="URL Audio lựa chọn (nếu có)"
                          value={choice.audioUrlForeign || ''}
                          onChangeText={text =>
                            handleChoiceChange(index, 'audioUrlForeign', text)
                          }
                        />
                        {choice.audioUrlForeign &&
                          choice.audioUrlForeign.trim() !== '' && (
                            <TouchableOpacity
                              style={[
                                formModalStyles.audioPreviewButton,
                                {
                                  alignSelf: 'flex-start',
                                  marginTop: SIZES.base / 2,
                                },
                              ]}
                              onPress={() =>
                                Alert.alert(
                                  'Phát thử Audio Lựa chọn',
                                  'Chức năng phát thử audio (URL: ' +
                                    choice.audioUrlForeign +
                                    ') sẽ được tích hợp sau.',
                                )
                              }>
                              <Image
                                source={AUDIO_PLAY_ICON}
                                style={formModalStyles.audioPreviewIcon}
                              />
                              <Text style={formModalStyles.audioPreviewText}>
                                Phát thử
                              </Text>
                            </TouchableOpacity>
                          )}
                      </>
                    )}

                  {questionType === 'MULTIPLE_CHOICE_VOCAB_IMAGE' && (
                    <View style={formModalStyles.imageInputContainer}>
                      <TextInput
                        style={[
                          formModalStyles.input,
                          {flex: 1, marginRight: SIZES.base},
                        ]}
                        placeholder="URL Hình ảnh (*)"
                        value={choice.imageUrl || ''}
                        onChangeText={text =>
                          handleChoiceChange(index, 'imageUrl', text)
                        }
                      />
                      {choice.imageUrl ? (
                        <Image
                          source={{uri: choice.imageUrl}}
                          style={formModalStyles.choiceImagePreview}
                        />
                      ) : (
                        <View style={formModalStyles.choiceImagePlaceholder} />
                      )}
                    </View>
                  )}

                  {questionType === 'WORD_ORDER' ? (
                    <View style={formModalStyles.wordOrderCorrectContainer}>
                      <Text style={formModalStyles.labelInline}>
                        Thứ tự đúng:
                      </Text>
                      <TextInput
                        style={[
                          formModalStyles.input,
                          formModalStyles.inputSmall,
                        ]}
                        placeholder="Số"
                        keyboardType="number-pad"
                        value={
                          choice.isCorrect === null ||
                          choice.isCorrect === undefined
                            ? ''
                            : String(choice.isCorrect)
                        }
                        onChangeText={text =>
                          handleChoiceChange(
                            index,
                            'isCorrect',
                            text === '' ? null : parseInt(text, 10) || null,
                          )
                        }
                      />
                      {/* Nút xóa choice được xử lý ở choiceHeader */}
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        formModalStyles.correctChoiceButton,
                        choice.isCorrect === true &&
                          formModalStyles.correctChoiceButtonSelected,
                      ]}
                      onPress={() => handleSetCorrectChoice(index)}>
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
              <TouchableOpacity
                onPress={handleAddChoice}
                style={formModalStyles.addChoiceButton}>
                {/* <Image source={ADD_CHOICE_ICON} style={formModalStyles.addChoiceIcon} /> */}
                <Text style={formModalStyles.addChoiceButtonText}>
                  Thêm lựa chọn
                </Text>
              </TouchableOpacity>

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
      {/* Modal for Question Type Picker */}
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
            {questionTypeOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={formModalStyles.pickerModalOption}
                onPress={() => {
                  setQuestionType(opt.value);
                  setIsQuestionTypePickerVisible(false);
                }}>
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
  backIcon: {width: 22, height: 22, tintColor: '#555'}, // Bỏ tintColor
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  }, // Căn giữa chuẩn
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    maxHeight: SIZES.height * 0.85,
  }, // Tăng maxHeight
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
  pickerHint: {fontSize: 12, color: COLORS.gray, marginTop: 4},
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
  // Styles cho Question Type Picker (dùng TouchableOpacity)
  pickerContainer: {
    /* Bỏ style cũ, dùng pickerDisplayButton */
  },
  pickerDisplayButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    backgroundColor: '#f9f9f9',
  },
  pickerDisplayText: {fontSize: 16, color: '#333'},
  pickerDropdownIcon: {fontSize: 16, color: COLORS.gray},
  // Styles cho Modal chọn Question Type
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
  }, // Thay đổi justifyContent
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
  addChoiceIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
    marginRight: SIZES.base / 2,
  },
  addChoiceButtonText: {color: COLORS.white, fontWeight: 'bold', fontSize: 15},
  deleteChoiceButtonSmall: {padding: SIZES.base / 2},
  deleteChoiceIconSmall: {width: 20, height: 20 /* Bỏ tintColor: COLORS.red */}, // Bỏ tintColor
  readOnlyInput: {
    backgroundColor: COLORS.lightGray2,
    color: COLORS.darkGray,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  audioPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.medium,
    marginTop: SIZES.base / 2,
    alignSelf: 'flex-start',
  },
  audioPreviewIcon: {
    width: 18,
    height: 18,
    /* Bỏ tintColor: COLORS.primary */ marginRight: SIZES.base / 2,
  }, // Bỏ tintColor
  audioPreviewText: {color: COLORS.primary, fontSize: SIZES.medium},
});
// --- END: AddEditContentModal ---

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

  const [questions, setQuestions] = useState<ApiQuestion[]>(
    hardcodedQuestionsData,
  );
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    setQuestions(hardcodedQuestionsData);
    setIsLoading(false);
  }, [currentLessonCode]);

  const getDisplayQuestionType = (type: string): string => {
    switch (type) {
      case 'WORD_ORDER':
        return 'Sắp xếp từ';
      case 'AUDIO_CHOICE':
        return 'Câu hỏi audio';
      case 'MULTIPLE_CHOICE_TEXT_ONLY':
        return 'Chọn theo câu hỏi (text)';
      case 'MULTIPLE_CHOICE_VOCAB_IMAGE':
        return 'Chọn ảnh';
      default:
        return type;
    }
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
      if (modalMode === 'add') {
        const newItem: ApiQuestion = {
          ...formData,
          id: Math.floor(Math.random() * 100000) + 1000,
          targetLanguageCode: 'ja',
          optionsLanguageCode: 'vi',
        };
        setQuestions(prev => [...prev, newItem]);
        showMessage({
          message: `Đã thêm câu hỏi "${newItem.promptTextTemplate}"!`,
          type: 'success',
        });
      } else if (modalMode === 'edit' && currentEditingItem) {
        setQuestions(prev =>
          prev.map(item =>
            item.id === currentEditingItem.id ? {...item, ...formData} : item,
          ),
        );
        showMessage({
          message: `Đã cập nhật câu hỏi "${formData.promptTextTemplate}"!`,
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
          <Text style={styles.itemDetailExtraText} numberOfLines={2}>
            Nội dung chính: {item.targetWordNative}
          </Text>
        </View>

        {item.audio_url_questions && (
          <TouchableOpacity
            style={styles.audioPlayButton}
            onPress={() =>
              Alert.alert(
                'Thông báo',
                'Chức năng audio tạm thời bị bỏ qua. URL: ' +
                  item.audio_url_questions,
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
      handleEditItem,
      handleDeletePress,
      getDisplayQuestionType,
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
            width: styles.backIconSubHeader.width,
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

// --- STYLES ---
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
    borderBottomColor: COLORS.lightGray || '#ECECEC',
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {width: 20, height: 20 /* Bỏ tintColor */},
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
  itemTextContainer: {flex: 1, justifyContent: 'center', marginRight: 8},
  itemNameText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 3,
  },
  itemDetailText: {fontSize: 13, color: '#555', marginBottom: 2},
  itemDetailExtraText: {fontSize: 13, color: '#777', fontStyle: 'italic'},
  actionButtonsContainer: {flexDirection: 'row', alignItems: 'center'},
  actionButton: {padding: 6, marginLeft: 8},
  actionIcon: {width: 20, height: 20, resizeMode: 'contain' /* Bỏ tintColor */},
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
  readOnlyInput: {
    backgroundColor: COLORS.lightGray2,
    color: COLORS.darkGray,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
  },
  audioPlayButton: {
    padding: SIZES.base / 2,
    marginLeft: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIconInList: {width: 24, height: 24 /* Bỏ tintColor */},
  audioStatusIndicator: {
    position: 'absolute',
    bottom: SIZES.padding,
    alignSelf: 'center',
  },
  audioStatusErrorText: {
    position: 'absolute',
    bottom: SIZES.padding,
    alignSelf: 'center',
    color: COLORS.white,
    backgroundColor: COLORS.red,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
    fontSize: SIZES.font * 0.9,
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
  menuIcon: {width: 20, height: 20, marginRight: 12 /* Bỏ tintColor */},
  menuText: {fontSize: 16, color: '#333'},
});
// --- END: Styles ---

export default ContensAdminScreen;
