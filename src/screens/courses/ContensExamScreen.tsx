// src/screens/lessons/ExamContentsScreen.tsx
import React, {useState, useMemo, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Image,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList, RootStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Video, VideoRef, OnLoadData} from 'react-native-video';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';

// --- IMPORT CÁC COMPONENT CON ---
import PronunciationLessonContent from './TypeRenderQuestion/PronunciationLessonContent';
import WritingLessonContent from './TypeRenderQuestion/WritingLessonContent';
import SelectLessonContent from './TypeRenderQuestion/SelectLessonContent';
import AudioChoiceLessonContent from './TypeRenderQuestion/AudioChoiceLessonContent';
import SelectImageLessonContent from './TypeRenderQuestion/SelectImageLessonContent';
import WordOrderLessonContent, {
  WordOrderLessonContentRef,
} from './TypeRenderQuestion/WordOrderLessonContent';

// --- Types cho API lấy câu hỏi ---
interface ApiQuestionChoice {
  id: number;
  textForeign: string | null;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null;
  textBlock?: string;
  isCorrect: boolean | number | null;
}

interface ApiQuestion {
  id: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audioUrlExam: string | null; // Đã đổi tên từ audioUrlQuestions
  questionChoices: ApiQuestionChoice[];
}
// --- End Types cho API lấy câu hỏi ---

// --- Type cho Payload gửi kết quả bài kiểm tra ---
interface SubmitExamResultPayload {
  examTime: number;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  topicId: number;
  userId: string;
}
// --- End Type cho Payload gửi kết quả bài kiểm tra ---

// --- Dữ liệu nội bộ và mapping (GIỮ NGUYÊN NHƯ ContentsScreen ĐÃ CẬP NHẬT) ---
export interface Option {
  id: string;
  text: string;
  textRomaji?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

export interface MappedContentItem {
  content_code: number;
  content_type:
    | 'select'
    | 'sapXep'
    | 'select_image'
    | 'audio_choice'
    | 'pronunciation'
    | 'writing';
  title: string | null;
  content_detail: string;
  audio_url: string | null;
  image_url: string | null;
  options?: Option[];
  correct_answer?: string | string[];
  correct_answer_foreign?: string | null;
  correct_answer_romaji?: string | null;
  targetLanguageCode?: string;
  user_answer?: string | string[];
}
// --- End Dữ liệu nội bộ và mapping ---

type ExamContentsScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentExam' // Tên route cho màn hình exam
>;
type ExamContentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const API_USER_BASE_URL = 'http://10.0.2.2:8080/api/user';

const ProgressBar = ({current, total}: {current: number; total: number}) => {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
    </View>
  );
};

interface ExamSummaryProps {
  correctAnswersCount: number;
  totalQuestions: number;
  timeTaken: string;
  onSubmitResult: () => void;
  isSubmitting: boolean;
}

const ExamSummaryScreen: React.FC<ExamSummaryProps> = ({
  correctAnswersCount,
  totalQuestions,
  timeTaken,
  onSubmitResult,
  isSubmitting,
}) => {
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswersCount / totalQuestions) * 100)
      : 0;
  return (
    <View style={summaryStyles.container}>
      <Image
        source={require('../../assets/images/Logo.png')}
        style={summaryStyles.logo}
        resizeMode="contain"
      />
      <Text style={summaryStyles.title}>Kết quả bài kiểm tra</Text>
      <View style={summaryStyles.card}>
        <Image
          source={require('../../assets/images/tiLeDung.png')}
          style={summaryStyles.iconText}
        />
        <Text style={summaryStyles.text}>
          {' '}
          Tỷ lệ đúng: {correctAnswersCount}/{totalQuestions}
        </Text>
      </View>
      <View style={summaryStyles.card}>
        <Image
          source={require('../../assets/images/TiLeHoanThanh.png')}
          style={summaryStyles.iconText}
        />
        <Text style={summaryStyles.text}>Hoàn thành: {accuracy}%</Text>
      </View>
      <View style={summaryStyles.card}>
        <Image
          source={require('../../assets/images/tocDo.png')}
          style={summaryStyles.iconText}
        />
        <Text style={summaryStyles.text}>Tốc độ: {timeTaken}</Text>
      </View>
      <TouchableOpacity
        style={[
          summaryStyles.completeButton,
          isSubmitting && summaryStyles.disabledButton,
        ]}
        onPress={onSubmitResult}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={summaryStyles.completeButtonText}>Hoàn thành</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const ExamContentsScreen: React.FC = () => {
  const route = useRoute<ExamContentsScreenRouteProp>();
  const navigation = useNavigation<ExamContentsScreenNavigationProp>();

  const {topicId, lessonName: lessonNameFromRoute = 'Bài kiểm tra'} =
    route.params; // Sử dụng lessonName từ route params nếu có, nếu không thì mặc định là 'Bài kiểm tra'

  const [apiQuestions, setApiQuestions] = useState<ApiQuestion[]>([]);
  const [isLoadingApiQuestions, setIsLoadingApiQuestions] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelectedOptionId, setUserSelectedOptionId] = useState<
    string | null
  >(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean | null>(
    null,
  );
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [currentUserWritingText, setCurrentUserWritingText] =
    useState<string>('');
  const [sapXepArrangedCount, setSapXepArrangedCount] = useState<number>(0);

  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);

  const wordOrderRef = useRef<WordOrderLessonContentRef>(null);

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (e) {
      console.error('Lỗi lấy token:', e);
      return null;
    }
  };
  const getUserId = async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem('UserId');
      return userId;
    } catch (e) {
      console.error('Lỗi lấy UserId:', e);
      return null;
    }
  };

  const mapApiQuestionsToMappedContent = useCallback(
    (questionsFromApi: ApiQuestion[]): MappedContentItem[] => {
      return questionsFromApi.map(apiQuestion => {
        let internalContentType: MappedContentItem['content_type'];
        let mappedOptions: Option[] | undefined = undefined;
        let correctAnswerIds: string | string[] | undefined = undefined;
        let correctAnswerForeign: string | null = null;
        let correctAnswerRomaji: string | null = null;
        const choicesFromApi = apiQuestion.questionChoices || [];
        switch (apiQuestion.questionType) {
          case 'MULTIPLE_CHOICE_TEXT_ONLY':
            internalContentType = 'select';
            mappedOptions = choicesFromApi.map(qc => ({
              id: String(qc.id),
              text: qc.textForeign || '',
              textRomaji: qc.textRomaji ?? null,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctChoiceText = choicesFromApi.find(
              qc => qc.isCorrect === true,
            );
            if (correctChoiceText) {
              correctAnswerIds = String(correctChoiceText.id);
              correctAnswerForeign = correctChoiceText.textForeign;
              correctAnswerRomaji = correctChoiceText.textRomaji ?? null;
            }
            break;
          case 'AUDIO_CHOICE':
            internalContentType = 'audio_choice';
            mappedOptions = choicesFromApi.map(qc => ({
              id: String(qc.id),
              text: qc.textForeign || '',
              textRomaji: qc.textRomaji ?? null,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctChoiceAudio = choicesFromApi.find(
              qc => qc.isCorrect === true,
            );
            if (correctChoiceAudio) {
              correctAnswerIds = String(correctChoiceAudio.id);
              correctAnswerForeign = correctChoiceAudio.textForeign;
              correctAnswerRomaji = correctChoiceAudio.textRomaji ?? null;
            }
            break;
          case 'MULTIPLE_CHOICE_VOCAB_IMAGE':
            internalContentType = 'select_image';
            mappedOptions = choicesFromApi.map(qc => ({
              id: String(qc.id),
              text: `${qc.textForeign || ''}${
                qc.textRomaji ? `\n(${qc.textRomaji})` : ''
              }`,
              textRomaji: qc.textRomaji ?? null,
              imageUrl: qc.imageUrl,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctImageChoice = choicesFromApi.find(
              qc => qc.isCorrect === true,
            );
            if (correctImageChoice) {
              correctAnswerIds = String(correctImageChoice.id);
              correctAnswerForeign = apiQuestion.targetWordNative; // Default
              correctAnswerRomaji = correctImageChoice.textRomaji ?? null;
              if (
                correctImageChoice.textForeign &&
                correctImageChoice.textForeign.trim() !== ''
              ) {
                correctAnswerForeign = correctImageChoice.textForeign; // Override if textForeign exists
              }
            }
            break;
          case 'WORD_ORDER':
            internalContentType = 'sapXep';
            const firstChoiceWordOrder = apiQuestion.questionChoices[0];
            if (
              firstChoiceWordOrder &&
              typeof firstChoiceWordOrder.textBlock === 'string'
            ) {
              try {
                const wordsInTextBlock = JSON.parse(
                  firstChoiceWordOrder.textBlock,
                );
                if (Array.isArray(wordsInTextBlock)) {
                  mappedOptions = wordsInTextBlock.map((word, index) => ({
                    id: `${apiQuestion.id}_examchoice${firstChoiceWordOrder.id}_word${index}`,
                    text: String(word),
                    textRomaji: null,
                    audioUrl: null,
                  }));
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = []; // For 'sapXep', correct_answer is not used directly from options
                } else {
                  mappedOptions = [];
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = [];
                  console.warn(
                    `WORD_ORDER (exam id: ${apiQuestion.id}): textBlock không phải là mảng JSON.`,
                  );
                }
              } catch (e) {
                mappedOptions = [];
                correctAnswerForeign =
                  firstChoiceWordOrder?.textForeign ?? null;
                correctAnswerRomaji = firstChoiceWordOrder?.textRomaji ?? null;
                correctAnswerIds = [];
                console.error(
                  `WORD_ORDER (exam id: ${apiQuestion.id}): Lỗi parse textBlock JSON:`,
                  e,
                );
              }
            } else {
              mappedOptions = [];
              correctAnswerForeign = null;
              correctAnswerRomaji = null;
              correctAnswerIds = [];
              console.warn(
                `WORD_ORDER (exam id: ${apiQuestion.id}): Thiếu questionChoices[0] hoặc textBlock không hợp lệ.`,
              );
            }
            break;
          case 'PRONUNCIATION':
            internalContentType = 'pronunciation';
            correctAnswerForeign =
              choicesFromApi[0]?.textForeign || apiQuestion.promptTextTemplate;
            correctAnswerRomaji = choicesFromApi[0]?.textRomaji || null;
            mappedOptions = [];
            correctAnswerIds = undefined; // Pronunciation does not use option IDs for correctness check in the same way
            break;
          case 'WRITING':
            internalContentType = 'writing';
            correctAnswerForeign =
              choicesFromApi[0]?.textForeign || apiQuestion.promptTextTemplate;
            mappedOptions = [];
            correctAnswerIds = undefined; // Writing does not use option IDs
            break;
          default:
            console.warn(
              `Unknown API questionType in Exam: ${apiQuestion.questionType}. Falling back to 'select'.`,
            );
            internalContentType = 'select'; // Fallback
            mappedOptions = choicesFromApi.map(qc => ({
              id: String(qc.id),
              text: qc.textForeign || '',
              textRomaji: qc.textRomaji ?? null,
              audioUrl: qc.audioUrlForeign,
            }));
            const defaultCorrectChoice = choicesFromApi.find(
              qc => qc.isCorrect === true,
            );
            if (defaultCorrectChoice) {
              correctAnswerIds = String(defaultCorrectChoice.id);
              correctAnswerForeign = defaultCorrectChoice.textForeign;
              correctAnswerRomaji = defaultCorrectChoice.textRomaji ?? null;
            }
            break;
        }
        return {
          content_code: apiQuestion.id,
          content_type: internalContentType,
          title: apiQuestion.promptTextTemplate,
          content_detail: apiQuestion.targetWordNative || '',
          audio_url: apiQuestion.audioUrlExam, // Use audioUrlExam
          image_url: null, // Assuming image_url is not directly on apiQuestion for general types
          options: mappedOptions,
          correct_answer: correctAnswerIds,
          correct_answer_foreign: correctAnswerForeign,
          correct_answer_romaji: correctAnswerRomaji,
          targetLanguageCode: apiQuestion.targetLanguageCode,
        };
      });
    },
    [],
  );

  const itemsForThisExam = useMemo(() => {
    // Renamed from itemsForThisLesson
    if (apiQuestions.length > 0) {
      return mapApiQuestionsToMappedContent(apiQuestions);
    }
    return [];
  }, [apiQuestions, mapApiQuestionsToMappedContent]);

  const currentItem = itemsForThisExam[currentIndex];

  useEffect(() => {
    const loadExamQuestions = async () => {
      if (!topicId) {
        setApiError('Lỗi: Không có ID chủ đề (topicId) được cung cấp.');
        setIsLoadingApiQuestions(false);
        return;
      }
      setIsLoadingApiQuestions(true);
      setApiError(null);
      setApiQuestions([]);
      try {
        const token = await getToken();
        if (!token) {
          setApiError('Lỗi xác thực. Vui lòng đăng nhập lại.');
          setIsLoadingApiQuestions(false);
          return;
        }
        const response = await axios.get<ApiQuestion[]>(
          `${API_USER_BASE_URL}/question/exam-question?topicId=${topicId}`, // Endpoint for exam questions
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setApiQuestions(response.data);
          } else {
            // Set apiError if the array is empty, indicating no questions
            setApiError('Không có câu hỏi nào cho bài kiểm tra này.');
          }
        } else {
          setApiError('Dữ liệu câu hỏi không hợp lệ từ server.');
        }
      } catch (err: any) {
        console.error(
          'Lỗi khi tải câu hỏi kiểm tra:',
          err.response?.data || err.message || err,
        );
        setApiError(
          `Không thể tải dữ liệu câu hỏi kiểm tra. ${
            err.response?.data?.message || 'Vui lòng thử lại.'
          }`,
        );
      } finally {
        setIsLoadingApiQuestions(false);
      }
    };
    if (topicId) {
      loadExamQuestions();
    } else {
      setApiError('Lỗi: Không tìm thấy ID chủ đề (topicId).');
      setIsLoadingApiQuestions(false);
    }
  }, [topicId]);

  const handleSubmitResult = async () => {
    if (!startTime || !topicId) {
      showMessage({
        message: 'Thiếu thông tin để gửi kết quả bài kiểm tra.',
        type: 'warning',
      });
      return;
    }
    setIsSubmittingResult(true);
    const finalEndTime = endTime || new Date();
    const examTimeSeconds = Math.round(
      (finalEndTime.getTime() - startTime.getTime()) / 1000,
    );
    const totalQuestionsCount = itemsForThisExam.length;
    const scorePercentValue =
      totalQuestionsCount > 0
        ? (correctAnswersCount / totalQuestionsCount) * 100
        : 0;

    const currentUserId = await getUserId();
    if (!currentUserId) {
      showMessage({
        message: 'Không tìm thấy User ID. Không thể gửi kết quả.',
        type: 'danger',
        duration: 3000,
      });
      setIsSubmittingResult(false);
      return;
    }

    const currentTopicId = Number(topicId);
    if (isNaN(currentTopicId)) {
      console.error('ExamContentsScreen: topicId không hợp lệ.');
      showMessage({
        message: 'Lỗi: topicId không hợp lệ cho việc gửi kết quả.',
        type: 'danger',
      });
      setIsSubmittingResult(false);
      return;
    }

    const payload: SubmitExamResultPayload = {
      examTime: examTimeSeconds > 0 ? examTimeSeconds : 0,
      scorePercent: parseFloat(scorePercentValue.toFixed(2)),
      totalQuestions: totalQuestionsCount,
      correctAnswers: correctAnswersCount,
      topicId: currentTopicId, // Use numeric topicId
      userId: currentUserId,
    };

    const resultEndpoint = `${API_USER_BASE_URL}/result/exam-result`; // Endpoint for exam result

    try {
      const token = await getToken();
      if (!token) {
        showMessage({
          message: 'Lỗi xác thực. Vui lòng đăng nhập lại để gửi kết quả.',
          type: 'danger',
          duration: 3000,
        });
        setIsSubmittingResult(false);
        return;
      }
      await axios.post(resultEndpoint, payload, {
        headers: {Authorization: `Bearer ${token}`},
      });
      showMessage({
        message: 'Đã lưu kết quả bài kiểm tra!',
        type: 'success',
        duration: 1500,
      });
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 1000);
    } catch (err: any) {
      console.error(
        'Lỗi gửi kết quả bài kiểm tra:',
        err.response?.data || err.message,
      );
      const apiErrorMessage =
        err.response?.data?.message ||
        err.message ||
        'Không thể gửi kết quả bài kiểm tra.';
      showMessage({
        message: `Lỗi: ${apiErrorMessage}`,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsSubmittingResult(false);
    }
  };

  useEffect(() => {
    if (
      itemsForThisExam.length > 0 &&
      !startTime &&
      !isLoadingApiQuestions &&
      !apiError
    ) {
      setStartTime(new Date());
      setCorrectAnswersCount(0);
      setShowSummaryScreen(false);
      setCurrentIndex(0);
    }
  }, [itemsForThisExam, startTime, isLoadingApiQuestions, apiError]);

  useEffect(() => {
    setUserSelectedOptionId(null);
    setShowAnswerFeedback(null);
    setCurrentUserWritingText('');
    setSapXepArrangedCount(0);
  }, [currentIndex]);

  const playSound = useCallback(
    (audioUrlToPlayParam: string | null) => {
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
      setAudioUrlToPlayState(null); // Reset first to ensure re-trigger if same URL
      audioUrlToPlayRef.current = audioUrlToPlayParam;
      setTimeout(() => {
        setAudioUrlToPlayState(audioUrlToPlayParam);
      }, 50); // Small delay to allow Video component to re-initialize with new source if needed
    },
    [isAudioPlaying], // Dependency: re-create if isAudioPlaying changes
  );

  const handleOptionSelect = (optionId: string) => {
    if (showAnswerFeedback === null) {
      // Only allow selection if feedback is not shown
      setUserSelectedOptionId(optionId);
      const currentQ = itemsForThisExam[currentIndex];
      if (currentQ && currentQ.options) {
        const selectedOptionData = currentQ.options.find(
          opt => opt.id === optionId,
        );
        if (selectedOptionData?.audioUrl) {
          playSound(selectedOptionData.audioUrl);
        }
      }
    }
  };

  const handleCheckAnswer = () => {
    if (!currentItem) return;
    let isCorrectUserAnswer = false;
    const type = currentItem.content_type;

    if (type === 'pronunciation') {
      // Logic cho pronunciation được xử lý qua callback onAttempt, không qua nút "Kiểm tra" này.
      console.warn(
        'handleCheckAnswer called for pronunciation type in Exam - this path should ideally not be reached if Check button is hidden for pronunciation.',
      );
      return;
    }

    if (type === 'writing') {
      if (currentUserWritingText.trim() === '') {
        Alert.alert('Thông báo', 'Bạn vui lòng nhập câu trả lời.');
        return;
      }
      const userAnswerNormalized = currentUserWritingText.trim().toLowerCase();
      const correctAnswerNormalized = (currentItem.correct_answer_foreign || '')
        .trim()
        .toLowerCase();
      isCorrectUserAnswer = userAnswerNormalized === correctAnswerNormalized;
    } else if (
      type === 'select' ||
      type === 'audio_choice' ||
      type === 'select_image'
    ) {
      if (!userSelectedOptionId) {
        Alert.alert('Thông báo', 'Bạn vui lòng chọn một đáp án.');
        return;
      }
      isCorrectUserAnswer = userSelectedOptionId === currentItem.correct_answer;
    } else if (type === 'sapXep') {
      const userAnswerString =
        wordOrderRef.current?.getUserAnswerString() || '';
      if (sapXepArrangedCount === 0 && (currentItem.options?.length || 0) > 0) {
        Alert.alert('Thông báo', 'Bạn chưa sắp xếp từ nào.');
        return;
      }
      const correctAnswerString = currentItem.correct_answer_foreign;
      isCorrectUserAnswer =
        correctAnswerString !== null &&
        userAnswerString === correctAnswerString;
    }

    setShowAnswerFeedback(isCorrectUserAnswer);
    // Cập nhật điểm:
    // - 'pronunciation' được tính điểm qua onAttempt.
    // - 'writing' trong bài thi sẽ được tính điểm ở đây.
    // - Các loại khác cũng tính điểm ở đây.
    if (isCorrectUserAnswer) {
      // Đối với ExamContentsScreen, chúng ta sẽ cộng điểm cho 'writing' ở đây nếu đúng.
      // 'pronunciation' được xử lý riêng qua onAttempt.
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (!currentItem) return;
    const type = currentItem.content_type;

    const needsCheckBeforeContinue =
      (type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image' ||
        type === 'sapXep' ||
        type === 'writing') &&
      showAnswerFeedback === null; // Gilt für nicht-pronunciation Typen

    if (needsCheckBeforeContinue) {
      let hasAttempt = false;
      if (
        ((type === 'select' ||
          type === 'audio_choice' ||
          type === 'select_image') &&
          userSelectedOptionId &&
          currentItem.options &&
          currentItem.options.length > 0) ||
        (type === 'sapXep' &&
          sapXepArrangedCount > 0 &&
          currentItem.options &&
          currentItem.options.length > 0) ||
        (type === 'writing' && currentUserWritingText.trim() !== '')
      ) {
        hasAttempt = true;
      }
      if (hasAttempt) {
        Alert.alert(
          'Thông báo',
          "Bạn vui lòng nhấn 'Kiểm tra' trước khi tiếp tục!",
        );
        return;
      }
      // If no attempt for checkable types, allow to continue (acts like skip if no input)
    }

    const isLastItem = currentIndex >= itemsForThisExam.length - 1;
    if (isLastItem) {
      const isSimpleSelectTypeWithNoOptions =
        (!currentItem.options || currentItem.options.length === 0) &&
        (type === 'select' ||
          type === 'audio_choice' ||
          type === 'select_image');

      if (
        (type === 'pronunciation' && showAnswerFeedback === true) || // Pronunciation: only if correct
        (type !== 'pronunciation' && showAnswerFeedback !== null) || // Other types: if already checked
        isSimpleSelectTypeWithNoOptions || // Problematic select types with no options
        (type !== 'pronunciation' &&
          showAnswerFeedback === null &&
          !needsCheckBeforeContinue) // Allow continue if it was not a "needsCheck" type or if it was a checkable type but no input was made (acting as skip)
      ) {
        setEndTime(new Date());
        setShowSummaryScreen(true);
      } else if (type !== 'pronunciation' && needsCheckBeforeContinue) {
        // Only alert if it needed a check and didn't get one
        Alert.alert(
          'Thông báo',
          "Đây là câu hỏi cuối cùng. Vui lòng nhấn 'Kiểm tra' trước khi hoàn thành bài kiểm tra.",
        );
      }
      // For pronunciation, if showAnswerFeedback is null or false, user stays on the question.
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTimeTaken = useCallback((): string => {
    if (!startTime) return '0 phút 0 giây';
    const finalEndTime = endTime || new Date(); // Use current time if endTime is not set
    const diffMs = finalEndTime.getTime() - startTime.getTime();
    if (diffMs < 0) return '0 phút 0 giây'; // Should not happen
    let diffSecsTotal = Math.round(diffMs / 1000);
    diffSecsTotal = diffSecsTotal > 0 ? diffSecsTotal : 0;

    const diffMins = Math.floor(diffSecsTotal / 60);
    const diffSecs = diffSecsTotal % 60;
    return `${diffMins} phút ${diffSecs} giây`;
  }, [startTime, endTime]);

  const handleBackPress = () => {
    Alert.alert(
      'Thoát khỏi bài kiểm tra?', // Changed from "bài học"
      'Tiến trình của bạn sẽ không được lưu lại. Bạn có chắc muốn thoát không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Thoát',
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const renderContentItem = () => {
    if (!currentItem) {
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>
            Đang tải câu hỏi hoặc đã hết...
          </Text>
        </View>
      );
    }
    switch (currentItem.content_type) {
      case 'pronunciation':
        return (
          <PronunciationLessonContent // Reusing the same component
            item={currentItem}
            onPlaySound={playSound}
            onSkip={handleContinue} // Added for consistency with ContentsScreen logic
            onAttempt={isCorrect => {
              // Added for consistency
              if (isCorrect) {
                setShowAnswerFeedback(true);
                setCorrectAnswersCount(prev => prev + 1); // Count points if correct
              } else {
                setShowAnswerFeedback(null); // Stays on question, no feedback from parent
                // PronunciationLessonContent might show its own feedback for incorrect attempts
              }
            }}
          />
        );
      case 'writing':
        return (
          <WritingLessonContent
            item={currentItem}
            isInteractionDisabled={showAnswerFeedback !== null}
            onTextChange={setCurrentUserWritingText}
            initialText={currentUserWritingText}
          />
        );
      case 'select':
        return (
          <SelectLessonContent
            item={currentItem}
            userSelectedOptionId={userSelectedOptionId}
            showAnswerFeedback={showAnswerFeedback}
            isInteractionDisabled={showAnswerFeedback !== null}
            onPlaySound={playSound}
            onOptionSelect={handleOptionSelect}
          />
        );
      case 'audio_choice':
        return (
          <AudioChoiceLessonContent
            item={currentItem}
            userSelectedOptionId={userSelectedOptionId}
            showAnswerFeedback={showAnswerFeedback}
            isInteractionDisabled={showAnswerFeedback !== null}
            onPlaySound={playSound}
            onOptionSelect={handleOptionSelect}
          />
        );
      case 'select_image':
        return (
          <SelectImageLessonContent
            item={currentItem}
            userSelectedOptionId={userSelectedOptionId}
            showAnswerFeedback={showAnswerFeedback}
            isInteractionDisabled={showAnswerFeedback !== null}
            onPlaySound={playSound}
            onOptionSelect={handleOptionSelect}
          />
        );
      case 'sapXep':
        return (
          <WordOrderLessonContent
            ref={wordOrderRef}
            item={currentItem}
            showAnswerFeedback={showAnswerFeedback}
            isInteractionDisabled={showAnswerFeedback !== null}
            onPlaySound={playSound}
            onArrangementChange={setSapXepArrangedCount}
          />
        );
      default:
        const unknownContentType = currentItem.content_type as any;
        return (
          <View style={styles.contentCard}>
            <Text>
              Loại nội dung "{unknownContentType}" chưa có giao diện render.
            </Text>
          </View>
        );
    }
  };

  if (isLoadingApiQuestions) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingErrorText}>
          Đang tải câu hỏi kiểm tra...
        </Text>
      </SafeAreaView>
    );
  }
  if (apiError) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()} // Simple goBack for error state
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Lỗi'}
          </Text>
          <View style={{width: 30}} />
          {/* Spacer */}
        </View>
        <View style={styles.contentLoadingError}>
          <Text style={styles.loadingErrorText}>{apiError}</Text>
          {/* Optional: Add a retry button for API errors if desired */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.retryButton,
              {marginTop: 20, backgroundColor: COLORS.gray},
            ]} // Added retry button style
          >
            <Text style={styles.retryButtonText}>Trở về</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  if (itemsForThisExam.length === 0 && !isLoadingApiQuestions && !apiError) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Bài kiểm tra trống'}
          </Text>
          <View style={{width: 30}} />
          {/* Spacer */}
        </View>
        <View style={styles.contentLoadingError}>
          <Text style={styles.loadingErrorText}>
            Không có câu hỏi nào cho bài kiểm tra này.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (showSummaryScreen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <ImageBackground
          source={require('../../assets/images/nen3.jpg')}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{opacity: 0.08}}
          resizeMode="cover">
          <ExamSummaryScreen
            correctAnswersCount={correctAnswersCount}
            totalQuestions={itemsForThisExam.length}
            timeTaken={formatTimeTaken()}
            onSubmitResult={handleSubmitResult}
            isSubmitting={isSubmittingResult}
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }
  if (!currentItem && !showSummaryScreen) {
    // This case should ideally be covered by previous checks, but as a fallback
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Lỗi Bài kiểm tra'}
          </Text>
          <View style={{width: 30}} />
        </View>
        <View style={styles.contentLoadingError}>
          <Text style={styles.loadingErrorText}>
            Không thể hiển thị câu hỏi. Vui lòng thử lại sau.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Logic for footer buttons and feedback UI, adapted from ContentsScreen
  const isPronunciationTypeCurrently =
    currentItem?.content_type === 'pronunciation';

  const hasAttemptForCurrentQuestion =
    ((currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice') &&
      userSelectedOptionId) ||
    (currentItem?.content_type === 'sapXep' && sapXepArrangedCount > 0) ||
    (currentItem?.content_type === 'writing' &&
      currentUserWritingText.trim() !== '');

  const shouldShowCheckButton =
    currentItem &&
    !isPronunciationTypeCurrently && // Check button not for pronunciation
    showAnswerFeedback === null && // Only if answer hasn't been checked yet
    hasAttemptForCurrentQuestion && // Only if user has made an attempt
    (((currentItem.content_type === 'select' || // And if it's a type with options
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
      currentItem.options &&
      currentItem.options.length > 0) ||
      currentItem.content_type === 'writing'); // Or if it's writing

  const shouldShowNewFeedbackUi = currentItem && showAnswerFeedback !== null; // For all types if feedback (true/false) is set (pronunciation will set it via onAttempt)

  const isProblematicNonPronunTypeWithNoOptions =
    !isPronunciationTypeCurrently &&
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
    (!currentItem.options || currentItem.options.length === 0);

  // This button acts as "Skip" for pronunciation if no attempt, or "Continue" for problematic types
  const shouldShowOriginalContinueButton =
    !shouldShowCheckButton && // If check button isn't shown
    !shouldShowNewFeedbackUi && // And feedback UI isn't shown
    (isPronunciationTypeCurrently || isProblematicNonPronunTypeWithNoOptions); // And it's pronunciation OR a problematic type

  const isPrimaryContinueButtonDisabled = // Generic continue button disable logic
    showAnswerFeedback === null && // Only if not checked
    !isPronunciationTypeCurrently && // Not for pronunciation (handled by its own logic / skip)
    (((currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice') &&
      !userSelectedOptionId && // No option selected for selectable types
      currentItem.options &&
      currentItem.options.length > 0) ||
      (currentItem?.content_type === 'writing' && // No text for writing
        currentUserWritingText.trim() === '') ||
      (currentItem?.content_type === 'sapXep' && // No words arranged for sapXep
        sapXepArrangedCount === 0 &&
        currentItem.options &&
        currentItem.options.length > 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.08}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progressWrapper}>
              <ProgressBar
                current={currentIndex + 1}
                total={itemsForThisExam.length}
              />
            </View>
            <View style={{width: 30}} />
            {/* Spacer */}
          </View>
          <ScrollView
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
            key={`content_scroll_exam_${currentIndex}_${showAnswerFeedback}_${userSelectedOptionId}_${currentUserWritingText}`}>
            {renderContentItem()}
          </ScrollView>

          {audioURLToPlay && (
            <Video
              ref={audioRef}
              volume={1.0}
              muted={false}
              source={{uri: audioURLToPlay}}
              paused={!isAudioPlaying} // Controlled by isAudioPlaying state
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch={'ignore'} // 'ignore', 'obey', or 'mix'
              onLoadStart={() => {
                setIsAudioLoading(true);
                setAudioError('');
              }}
              onLoad={(data: OnLoadData) => {
                setIsAudioLoading(false);
                setIsAudioPlaying(true); // Auto-play when loaded
                audioRef.current?.seek(0); // Ensure playback starts from the beginning
              }}
              onEnd={() => {
                setIsAudioPlaying(false);
                // setAudioUrlToPlayState(null); // Optional: clear URL when done
              }}
              onError={error => {
                console.error('Video: Lỗi khi phát audio:', error);
                setAudioError('Lỗi phát audio.');
                setIsAudioLoading(false);
                setIsAudioPlaying(false);
              }}
              style={{height: 0, width: 0}} // Invisible player
            />
          )}
          {isAudioLoading && (
            <ActivityIndicator
              style={styles.audioActivityIndicator}
              color={COLORS.primary}
            />
          )}
          {audioError && (
            <Text style={styles.audioErrorText}>{audioError}</Text>
          )}

          {/* Footer UI */}
          <View
            style={[
              styles.footer,
              shouldShowNewFeedbackUi &&
                showAnswerFeedback === true &&
                styles.footer_CorrectBackground_NEW,
              shouldShowNewFeedbackUi &&
                showAnswerFeedback === false &&
                styles.footer_IncorrectBackground_NEW,
            ]}>
            {/* KIỂM TRA BUTTON */}
            {shouldShowCheckButton && (
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckAnswer}>
                <Text style={styles.footerButtonText}>Kiểm tra</Text>
              </TouchableOpacity>
            )}

            {/* FEEDBACK UI (Correct/Incorrect) */}
            {shouldShowNewFeedbackUi && currentItem && (
              <View style={styles.feedback_Container_NEW}>
                <View style={styles.feedback_TextAudioWrapper_NEW}>
                  <View style={styles.feedback_TextContainer_NEW}>
                    <Text
                      style={styles.feedback_CorrectAnswerText_NEW}
                      numberOfLines={2}>
                      {
                        showAnswerFeedback === true
                          ? 'Chính xác!'
                          : 'Đáp án đúng: ' // For incorrect or when showing correct answer
                      }
                      {/* Show correct answer text if not pronunciation OR if pronunciation was wrong */}
                      {
                        (currentItem.content_type !== 'pronunciation' ||
                          showAnswerFeedback === false) &&
                          (currentItem.correct_answer_foreign ||
                            currentItem.content_detail) // Fallback to content_detail if foreign is null
                      }
                    </Text>
                    {currentItem.correct_answer_romaji &&
                      currentItem.content_type && ( // Only show if romaji exists
                        <Text
                          style={styles.feedback_CorrectAnswerRomaji_NEW}
                          numberOfLines={1}>
                          ({currentItem.correct_answer_romaji})
                        </Text>
                      )}
                  </View>
                  {/* Audio for correct answer (if applicable) */}
                  {((currentItem.correct_answer_foreign && // Ensure there's a correct answer to play audio for
                    currentItem.options?.find(
                      opt => opt.id === currentItem.correct_answer,
                    )?.audioUrl) || // Audio from selected correct option
                    currentItem.audio_url) && // Or main audio_url of the question (e.g. for pronunciation, writing, sapXep)
                    currentItem.content_type && ( // Ensure content_type exists
                      <TouchableOpacity
                        onPress={() => {
                          let audioToPlayOnClick = currentItem.audio_url; // Default to question's main audio
                          // For select types, try to get audio from the correct option
                          if (
                            typeof currentItem.correct_answer === 'string' &&
                            (currentItem.content_type === 'select' ||
                              currentItem.content_type === 'audio_choice' ||
                              currentItem.content_type === 'select_image')
                          ) {
                            const correctOpt = currentItem.options?.find(
                              opt => opt.id === currentItem.correct_answer,
                            );
                            if (correctOpt?.audioUrl) {
                              audioToPlayOnClick = correctOpt.audioUrl;
                            }
                          } else if (
                            // For other types like sapXep, writing, pronunciation, audio_url on currentItem is primary
                            currentItem.content_type === 'sapXep' ||
                            currentItem.content_type === 'writing' ||
                            currentItem.content_type === 'pronunciation'
                          ) {
                            // audioToPlayOnClick is already set to currentItem.audio_url
                          }
                          playSound(audioToPlayOnClick);
                        }}
                        style={styles.feedback_AudioButton_NEW}>
                        <Image
                          source={require('../../assets/images/amThanhTiepTuc.png')}
                          style={[
                            styles.feedback_AudioIcon_NEW,
                            {tintColor: COLORS.white}, // White icon for both correct/incorrect feedback bg
                          ]}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                  style={styles.feedback_ContinueButton_NEW}
                  onPress={handleContinue}>
                  <Text
                    style={[
                      styles.feedback_ContinueButtonText_NEW,
                      {color: showAnswerFeedback ? COLORS.primary : COLORS.red}, // Dynamic color based on correctness
                    ]}>
                    Tiếp tục
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* "TIẾP TỤC" LỚN (ORIGINAL/SKIP) BUTTON */}
            {shouldShowOriginalContinueButton && (
              <TouchableOpacity
                style={[
                  isPronunciationTypeCurrently ||
                  isProblematicNonPronunTypeWithNoOptions
                    ? styles.skipButton // Use skip style for pronunciation (acting as skip) or problematic types
                    : styles.continueButton,
                  // No disable logic here as it's a skip/forced continue
                ]}
                onPress={handleContinue}
                // disabled={isContinueButtonDisabledIfPrimary} // Original was disabling based on selection, but this button is often a "skip"
              >
                <Text style={styles.footerButtonText}>
                  {isPronunciationTypeCurrently ? 'Bỏ qua' : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>
            )}

            {/* FALLBACK "TIẾP TỤC" BUTTON (Primary Continue) */}
            {!shouldShowCheckButton &&
              !shouldShowNewFeedbackUi &&
              !shouldShowOriginalContinueButton &&
              !(
                isPronunciationTypeCurrently && showAnswerFeedback === null
              ) && ( // Don't show if pronunciation and waiting for retry/skip by Pronunciation component
                <TouchableOpacity
                  style={[
                    styles.continueButton, // Default continue button
                    isPrimaryContinueButtonDisabled &&
                      styles.disabledButtonFooter, // Disable if needed
                  ]}
                  onPress={handleContinue}
                  disabled={isPrimaryContinueButtonDisabled}>
                  <Text style={styles.footerButtonText}>Tiếp tục</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (SAO CHÉP Y HỆT TỪ ContentsScreen.tsx, trừ những thay đổi nhỏ nếu cần cho Exam)
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  safeAreaLoadingError: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentLoadingError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  loadingErrorText: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    // Added for error screen
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    // Added for error screen
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.75,
    marginTop: 15, // Consistent with ContentsScreen
    backgroundColor: COLORS.white, // Consistent
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  headerTitleError: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  backButton: {paddingHorizontal: SIZES.padding * 0.5},
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5, // Adjusted for better visual
    color: COLORS.darkGray,
    fontWeight: '600', // Make it a bit bolder
    marginBottom: 10, // Align with progress bar visually
  },
  progressWrapper: {flex: 1, marginHorizontal: SIZES.base},
  progressBarContainer: {
    height: 20, // Standard height
    backgroundColor: COLORS.white, // Light background for the bar
    borderRadius: SIZES.radius,
    justifyContent: 'center', // Center fill vertically if needed
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10, // Softer shadow
    elevation: 10, // Android shadow
  },
  progressBarFill: {
    height: '80%', // Fill almost full height
    backgroundColor: COLORS.primary || '#4CAF50', // Use primary color or fallback
    borderRadius: SIZES.radius, // Rounded fill
    position: 'absolute', // Position within container
    alignSelf: 'flex-start', // Align to the start
  },
  contentScrollArea: {flex: 1, marginTop: SIZES.padding * 0.5},
  contentScrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160, // Ensure enough space for footer
  },
  contentCard: {
    // General card style for unknown content types
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255,255,255,0.75)', // Slightly transparent white
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyContentText: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    paddingBottom:
      Platform.OS === 'ios' ? SIZES.padding * 1.5 : SIZES.padding * 1.2, // Platform-specific padding
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
    backgroundColor: COLORS.white,
    flexDirection: 'row', // Usually row for buttons
    alignItems: 'center',
    justifyContent: 'center', // Center button(s)
    minHeight: 70, // Minimum height for the footer
  },
  checkButton: {
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1, // Take full width if it's the only button
    marginBottom: Platform.OS === 'android' ? 30 : 0, // Copied from ContentsScreen
  },
  continueButton: {
    backgroundColor: COLORS.primary || '#4CAF50',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 0 : 0, // Copied from ContentsScreen
  },
  skipButton: {
    // Style for "Skip" or "Problematic Continue"
    backgroundColor: COLORS.gray, // Neutral color
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 0 : 0, // Copied from ContentsScreen
  },
  disabledButtonFooter: {
    backgroundColor: COLORS.lightGray, // Style for disabled primary button
    marginBottom: Platform.OS === 'android' ? 30 : 0, // Copied from ContentsScreen
  },
  footerButtonText: {
    fontFamily: FONTS.bold?.fontFamily,
    color: COLORS.white,
    fontSize: SIZES.font * 1.1,
    fontWeight: 'bold',
  },
  footer_CorrectBackground_NEW: {
    backgroundColor: COLORS.green || '#D4EDDA', // Light green for correct
    borderTopColor: COLORS.green,
  },
  footer_IncorrectBackground_NEW: {
    backgroundColor: COLORS.deeperRed || '#F8D7DA', // Light red for incorrect
    borderTopColor: COLORS.deeperRed,
  },
  feedback_Container_NEW: {
    // Container for the new feedback UI
    flexDirection: 'column', // Stack text/audio and button vertically
    alignItems: 'center', // Center items horizontally
    justifyContent: 'space-between', // Space out elements
    width: '100%',
    flex: 1, // Take available space
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.padding * 0.5,
    minHeight: Platform.OS === 'ios' ? 90 : 80, // Copied from ContentsScreen
  },
  feedback_TextAudioWrapper_NEW: {
    // Wrapper for text and audio icon
    flexDirection: 'row',
    justifyContent: 'space-between', // Space text and audio
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.base * 0.5, // Space before continue button
  },
  feedback_TextContainer_NEW: {
    // Container for feedback text and romaji
    flex: 1, // Allow text to take most space
    marginRight: SIZES.base, // Space before audio icon
    marginLeft: 40, // Copied from ContentsScreen (make space for potential icon on left)
    alignItems: 'center', // Copied
  },
  feedback_CorrectAnswerText_NEW: {
    fontSize: SIZES.xxLarge, // Large text for feedback
    opacity: 0.9,
    fontWeight: '700', // Bold
    textAlign: 'center', // Center align
    color: COLORS.white, // White text on colored background
  },
  feedback_CorrectAnswerRomaji_NEW: {
    fontFamily: FONTS.regular?.fontFamily,
    fontSize: SIZES.medium,
    opacity: 0.8,
    textAlign: 'center',
    color: COLORS.white,
    marginTop: 2, // Small space below main feedback text
  },
  feedback_AudioButton_NEW: {
    // Touchable for audio icon
    padding: SIZES.base * 0.5,
    borderRadius: 20, // Circular touch area
  },
  feedback_AudioIcon_NEW: {
    width: 28,
    height: 28,
  },
  feedback_ContinueButton_NEW: {
    // Style for the "Tiếp tục" button within feedback UI
    backgroundColor: COLORS.white, // White button
    paddingVertical: SIZES.padding * 0.8,
    paddingHorizontal: SIZES.padding * 2.5,
    borderRadius: SIZES.radius * 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%', // Almost full width
    alignSelf: 'center',
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Android shadow
    marginTop: SIZES.base, // Space above this button
    marginBottom: Platform.OS === 'android' ? 30 : 0, // Copied
  },
  feedback_ContinueButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    // Color is set dynamically in the component
  },
  audioActivityIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80, // Position above footer
    alignSelf: 'center',
  },
  audioErrorText: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    color: COLORS.red,
    backgroundColor: COLORS.white, // Give it a background to be visible
    padding: 5,
    borderRadius: 3,
  },
});

const summaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0, // No padding for the main container to allow background full bleed
    margin: 0, // No margin
    backgroundColor: COLORS.white, // White background for summary content
  },
  logo: {
    width: screenWidth * 0.3, // Responsive logo size
    height: screenWidth * 0.3,
    marginBottom: SIZES.padding * 2, // Space below logo
  },
  title: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.xxLarge, // Large title
    color: COLORS.text, // Primary text color
    marginBottom: SIZES.padding * 2, // Space below title
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.white, // White cards
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5, // Generous padding
    marginBottom: SIZES.margin, // Space between cards
    width: '90%', // Responsive card width
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center items vertically
    shadowColor: COLORS.black, // Card shadow
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1, // Subtle shadow
    shadowRadius: SIZES.radius / 2,
    elevation: 2, // Android shadow
  },
  iconText: {
    width: SIZES.h2, // Icon size
    height: SIZES.h2,
    marginRight: SIZES.base, // Space between icon and text
  },
  text: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font, // Standard font size
    color: COLORS.textSecondary || COLORS.darkGray, // Secondary text color
  },
  completeButton: {
    backgroundColor: COLORS.primary, // Primary color for the button
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 3, // Wide button
    borderRadius: SIZES.radius * 2.5, // Very rounded
    marginTop: SIZES.padding * 2, // Space above button
    alignItems: 'center',
    width: '90%', // Responsive button width
  },
  completeButtonText: {
    fontFamily: FONTS.bold?.fontFamily,
    color: COLORS.white, // White text on primary button
    fontSize: SIZES.large,
  },
  disabledButton: {
    backgroundColor: COLORS.gray, // Gray for disabled button
  },
});

export default ExamContentsScreen;
