// src/screens/lessons/ContentsScreen.tsx
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

import PronunciationLessonContent from './TypeRenderQuestion/PronunciationLessonContent';
import WritingLessonContent from './TypeRenderQuestion/WritingLessonContent';
import SelectLessonContent from './TypeRenderQuestion/SelectLessonContent';
import AudioChoiceLessonContent from './TypeRenderQuestion/AudioChoiceLessonContent';
import SelectImageLessonContent from './TypeRenderQuestion/SelectImageLessonContent';
import WordOrderLessonContent, {
  WordOrderLessonContentRef,
} from './TypeRenderQuestion/WordOrderLessonContent';

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
  audioUrlQuestions: string | null;
  questionChoices: ApiQuestionChoice[];
}
interface LessonResultPayload {
  studyTime: number;
  completionPercent: number;
  studyAttempt: number;
  totalQuestions: number;
  correctAnswers: number;
  lessonId: number;
  userId: string;
}

type ContentsScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsScreen'
>;
type ContentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const API_USER_BASE_URL = 'http://10.0.2.2:8080/api/user';

const ProgressBar = ({current, total}: {current: number; total: number}) => {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
    </View>
  );
};

interface LessonSummaryProps {
  correctAnswersCount: number;
  totalQuestions: number;
  timeTaken: string;
  onSubmitResult: () => void;
  isSubmitting: boolean;
}
const LessonSummaryScreen: React.FC<LessonSummaryProps> = ({
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
      <Text style={summaryStyles.title}>Kết quả hoàn thành</Text>
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

const ContentsScreen: React.FC = () => {
  const route = useRoute<ContentsScreenRouteProp>();
  const navigation = useNavigation<ContentsScreenNavigationProp>();

  const lessonId = route.params?.lessonCode;
  const lessonNameFromRoute = route.params?.lessonName;

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
              correctAnswerForeign = apiQuestion.targetWordNative;
              correctAnswerRomaji = correctImageChoice.textRomaji ?? null;
              if (
                correctImageChoice.textForeign &&
                correctImageChoice.textForeign.trim() !== ''
              ) {
                correctAnswerForeign = correctImageChoice.textForeign;
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
                    id: `${apiQuestion.id}_choice${firstChoiceWordOrder.id}_word${index}`,
                    text: String(word),
                    textRomaji: null,
                    audioUrl: null,
                  }));
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = [];
                } else {
                  mappedOptions = [];
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = [];
                  console.warn(
                    `WORD_ORDER (id: ${apiQuestion.id}): textBlock không phải là mảng JSON.`,
                  );
                }
              } catch (e) {
                mappedOptions = [];
                correctAnswerForeign =
                  firstChoiceWordOrder?.textForeign ?? null;
                correctAnswerRomaji = firstChoiceWordOrder?.textRomaji ?? null;
                correctAnswerIds = [];
                console.error(
                  `WORD_ORDER (id: ${apiQuestion.id}): Lỗi parse textBlock JSON:`,
                  e,
                );
              }
            } else {
              mappedOptions = [];
              correctAnswerForeign = null;
              correctAnswerRomaji = null;
              correctAnswerIds = [];
              console.warn(
                `WORD_ORDER (id: ${apiQuestion.id}): Thiếu questionChoices[0] hoặc textBlock không hợp lệ.`,
              );
            }
            break;
          case 'PRONUNCIATION':
            internalContentType = 'pronunciation';
            correctAnswerForeign =
              choicesFromApi[0]?.textForeign || apiQuestion.promptTextTemplate;
            correctAnswerRomaji = choicesFromApi[0]?.textRomaji || null;
            mappedOptions = [];
            correctAnswerIds = undefined;
            break;
          case 'WRITING':
            internalContentType = 'writing';
            correctAnswerForeign =
              choicesFromApi[0]?.textForeign || apiQuestion.promptTextTemplate;
            mappedOptions = [];
            correctAnswerIds = undefined;
            break;
          default:
            console.warn(
              `Unknown API questionType: ${apiQuestion.questionType}. Falling back to 'select'.`,
            );
            internalContentType = 'select';
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
          audio_url: apiQuestion.audioUrlQuestions,
          image_url: null,
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
  const itemsForThisLesson = useMemo(() => {
    if (apiQuestions.length > 0) {
      return mapApiQuestionsToMappedContent(apiQuestions);
    }
    return [];
  }, [apiQuestions, mapApiQuestionsToMappedContent]);
  const currentItem = itemsForThisLesson[currentIndex];

  useEffect(() => {
    const loadQuestions = async () => {
      if (!lessonId) {
        setApiError('Lỗi: Không có ID bài học được cung cấp.');
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
          `${API_USER_BASE_URL}/question/lesson-question?lessonID=${lessonId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setApiQuestions(response.data);
          }
        } else {
          setApiError('Dữ liệu câu hỏi không hợp lệ từ server.');
        }
      } catch (err: any) {
        console.error(
          'Lỗi khi tải câu hỏi:',
          err.response?.data || err.message || err,
        );
        setApiError(
          `Không thể tải dữ liệu câu hỏi. ${
            err.response?.data?.message || 'Vui lòng thử lại.'
          }`,
        );
      } finally {
        setIsLoadingApiQuestions(false);
      }
    };
    if (lessonId) {
      loadQuestions();
    } else {
      setApiError('Lỗi: Không tìm thấy mã bài học.');
      setIsLoadingApiQuestions(false);
    }
  }, [lessonId]);
  const handleSubmitResult = async () => {
    if (!startTime || !lessonId) {
      showMessage({
        message: 'Thiếu thông tin bài học để gửi kết quả.',
        type: 'warning',
      });
      return;
    }
    setIsSubmittingResult(true);
    const finalEndTime = endTime || new Date();
    const studyTimeSeconds = Math.round(
      (finalEndTime.getTime() - startTime.getTime()) / 1000,
    );
    const totalQuestionsCount = itemsForThisLesson.length;
    const completion =
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
    const payload: LessonResultPayload = {
      studyTime: studyTimeSeconds > 0 ? studyTimeSeconds : 0,
      completionPercent: parseFloat(completion.toFixed(2)),
      studyAttempt: 1,
      totalQuestions: totalQuestionsCount,
      correctAnswers: correctAnswersCount,
      lessonId: Number(lessonId),
      userId: currentUserId,
    };
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
      await axios.post(`${API_USER_BASE_URL}/result/lesson-result`, payload, {
        headers: {Authorization: `Bearer ${token}`},
      });
      showMessage({
        message: 'Đã lưu kết quả bài học!',
        type: 'success',
        duration: 1500,
      });
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Lỗi gửi kết quả:', err.response?.data || err.message);
      const apiErrorMessage =
        err.response?.data?.message || err.message || 'Không thể gửi kết quả.';
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
      itemsForThisLesson.length > 0 &&
      !startTime &&
      !isLoadingApiQuestions &&
      !apiError
    ) {
      setStartTime(new Date());
      setCorrectAnswersCount(0);
      setShowSummaryScreen(false);
      setCurrentIndex(0);
    }
  }, [itemsForThisLesson, startTime, isLoadingApiQuestions, apiError]);
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
      setAudioUrlToPlayState(null);
      audioUrlToPlayRef.current = audioUrlToPlayParam;
      setTimeout(() => {
        setAudioUrlToPlayState(audioUrlToPlayParam);
      }, 50);
    },
    [isAudioPlaying],
  );
  const handleOptionSelect = (optionId: string) => {
    if (showAnswerFeedback === null) {
      setUserSelectedOptionId(optionId);
      const currentQ = itemsForThisLesson[currentIndex];
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
        'handleCheckAnswer called for pronunciation type - this path should ideally not be reached if Check button is hidden for pronunciation.',
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
    // Cập nhật điểm: không tính cho 'writing' trong bài học, 'pronunciation' được tính điểm qua onAttempt
    if (isCorrectUserAnswer) {
      if (type !== 'writing') {
        // Chỉ loại trừ writing ở đây, pronunciation đã được xử lý riêng
        setCorrectAnswersCount(prev => prev + 1);
      }
    }
  };

  const handleContinue = () => {
    if (!currentItem) return;
    const type = currentItem.content_type;

    // Bỏ guard cũ cho pronunciation ở đây vì "Bỏ qua" sẽ gọi trực tiếp handleContinue
    // và luồng nói đúng/sai sẽ xử lý việc có cho qua hay không.

    const needsCheckBeforeContinue =
      (type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image' ||
        type === 'sapXep' ||
        type === 'writing') &&
      showAnswerFeedback === null;

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
    }

    const isLastItem = currentIndex >= itemsForThisLesson.length - 1;
    if (isLastItem) {
      const isSimpleSelectTypeWithNoOptions =
        (!currentItem.options || currentItem.options.length === 0) &&
        (type === 'select' ||
          type === 'audio_choice' ||
          type === 'select_image');

      // Nếu là pronunciation, chỉ qua summary khi showAnswerFeedback là true (nói đúng)
      // Hoặc nếu là các loại khác đã có feedback, hoặc loại select lỗi không có options
      if (
        (type === 'pronunciation' && showAnswerFeedback === true) ||
        (type !== 'pronunciation' && showAnswerFeedback !== null) ||
        isSimpleSelectTypeWithNoOptions
      ) {
        setEndTime(new Date());
        setShowSummaryScreen(true);
      } else if (type !== 'pronunciation') {
        Alert.alert(
          'Thông báo',
          "Đây là câu hỏi cuối cùng. Vui lòng nhấn 'Kiểm tra' trước khi hoàn thành bài học.",
        );
      }
      // Nếu là pronunciation và showAnswerFeedback là null (nói sai, chỉ hiện alert), thì không làm gì ở đây,
      // người dùng phải Skip hoặc thử lại.
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTimeTaken = useCallback((): string => {
    if (!startTime) return '0 phút 0 giây';
    const finalEndTime = endTime || new Date();
    const diffMs = finalEndTime.getTime() - startTime.getTime();
    if (diffMs < 0) return '0 phút 0 giây';
    let diffSecsTotal = Math.round(diffMs / 1000);
    diffSecsTotal = diffSecsTotal > 0 ? diffSecsTotal : 0;
    const diffMins = Math.floor(diffSecsTotal / 60);
    const diffSecs = diffSecsTotal % 60;
    return `${diffMins} phút ${diffSecs} giây`;
  }, [startTime, endTime]);
  const handleBackPress = () => {
    Alert.alert(
      'Thoát khỏi bài học?',
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
          <PronunciationLessonContent
            item={currentItem}
            onPlaySound={playSound}
            onSkip={handleContinue} // Bỏ qua sẽ gọi handleContinue
            onAttempt={isCorrect => {
              if (isCorrect) {
                setShowAnswerFeedback(true); // Hiện footer đúng
                setCorrectAnswersCount(prev => prev + 1); // TÍNH ĐIỂM KHI ĐÚNG
              } else {
                setShowAnswerFeedback(null); // Không hiện footer nào của cha, ở lại câu hỏi
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
        <Text style={styles.loadingErrorText}>Đang tải câu hỏi...</Text>
      </SafeAreaView>
    );
  }
  if (apiError) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Lỗi'}
          </Text>
          <View style={{width: 30}} />
        </View>
        <View style={styles.contentLoadingError}>
          <Text style={styles.loadingErrorText}>{apiError}</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (itemsForThisLesson.length === 0 && !isLoadingApiQuestions && !apiError) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Bài học trống'}
          </Text>
          <View style={{width: 30}} />
        </View>
        <View style={styles.contentLoadingError}>
          <Text style={styles.loadingErrorText}>
            Không có câu hỏi nào cho bài học này.
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
          <LessonSummaryScreen
            correctAnswersCount={correctAnswersCount}
            totalQuestions={itemsForThisLesson.length}
            timeTaken={formatTimeTaken()}
            onSubmitResult={handleSubmitResult}
            isSubmitting={isSubmittingResult}
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }
  if (!currentItem && !showSummaryScreen) {
    return (
      <SafeAreaView style={styles.safeAreaLoadingError}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleError} numberOfLines={1}>
            {lessonNameFromRoute || 'Lỗi bài học'}
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

  // Nút "Kiểm tra" sẽ không hiển thị cho pronunciation
  const shouldShowCheckButton =
    currentItem &&
    !isPronunciationTypeCurrently &&
    showAnswerFeedback === null &&
    hasAttemptForCurrentQuestion &&
    (((currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
      currentItem.options &&
      currentItem.options.length > 0) ||
      currentItem.content_type === 'writing');

  // Thanh feedback (xanh/đỏ) sẽ hiển thị cho pronunciation NẾU nói đúng (showAnswerFeedback === true do onAttempt(true) gọi)
  const shouldShowNewFeedbackUi = currentItem && showAnswerFeedback !== null;

  // Nút "Tiếp tục" lớn ở giữa (Original/Skip button)
  const isProblematicNonPronunTypeWithNoOptions =
    !isPronunciationTypeCurrently && // Không phải pronunciation
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
    (!currentItem.options || currentItem.options.length === 0);

  const shouldShowOriginalContinueButton =
    !shouldShowCheckButton &&
    !shouldShowNewFeedbackUi && // Sẽ false nếu pronunciation nói đúng (vì showAnswerFeedback=true)
    isProblematicNonPronunTypeWithNoOptions;

  const isContinueButtonDisabledIfPrimary =
    shouldShowOriginalContinueButton &&
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice') &&
    !userSelectedOptionId &&
    showAnswerFeedback === null &&
    currentItem.options &&
    currentItem.options.length > 0;

  const isPrimaryContinueButtonDisabled =
    showAnswerFeedback === null &&
    !isPronunciationTypeCurrently &&
    (((currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice') &&
      !userSelectedOptionId &&
      currentItem.options &&
      currentItem.options.length > 0) ||
      (currentItem?.content_type === 'writing' &&
        currentUserWritingText.trim() === '') ||
      (currentItem?.content_type === 'sapXep' &&
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
                total={itemsForThisLesson.length}
              />
            </View>
            <View style={{width: 30}} />
          </View>
          <ScrollView
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
            // GIỮ NGUYÊN KEY GỐC CỦA BẠN
            key={`content_scroll_${currentIndex}_${showAnswerFeedback}_${userSelectedOptionId}_${currentUserWritingText}`}>
            {renderContentItem()}
          </ScrollView>
          {audioURLToPlay && (
            <Video
              ref={audioRef}
              volume={1.0}
              muted={false}
              source={{uri: audioURLToPlay}}
              paused={!isAudioPlaying}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch={'ignore'}
              onLoadStart={() => {
                setIsAudioLoading(true);
                setAudioError('');
              }}
              onLoad={(data: OnLoadData) => {
                setIsAudioLoading(false);
                setIsAudioPlaying(true);
                audioRef.current?.seek(0);
              }}
              onEnd={() => {
                setIsAudioPlaying(false);
              }}
              onError={error => {
                console.error('Video: Lỗi khi phát audio:', error);
                setAudioError('Lỗi phát audio.');
                setIsAudioLoading(false);
                setIsAudioPlaying(false);
              }}
              style={{height: 0, width: 0}}
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
            {shouldShowCheckButton && (
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckAnswer}>
                <Text style={styles.footerButtonText}>Kiểm tra</Text>
              </TouchableOpacity>
            )}

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
                          : showAnswerFeedback === false
                          ? 'Đáp án đúng: '
                          : showAnswerFeedback === true
                          ? 'Chính xác! '
                          : '' // Thêm 'Chính xác!' cho các loại khác nếu đúng
                      }
                      {(currentItem.content_type !== 'pronunciation' ||
                        showAnswerFeedback === false) &&
                        (currentItem.correct_answer_foreign ||
                          currentItem.content_detail)}
                    </Text>
                    {currentItem.correct_answer_romaji &&
                      currentItem.content_type && (
                        <Text
                          style={styles.feedback_CorrectAnswerRomaji_NEW}
                          numberOfLines={1}>
                          ({currentItem.correct_answer_romaji})
                        </Text>
                      )}
                  </View>
                  {((currentItem.correct_answer_foreign &&
                    currentItem.options?.find(
                      opt => opt.id === currentItem.correct_answer,
                    )?.audioUrl) ||
                    currentItem.audio_url) &&
                    currentItem.content_type && (
                      <TouchableOpacity
                        onPress={() => {
                          let audioToPlayOnClick = currentItem.audio_url;
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
                            currentItem.content_type === 'sapXep' ||
                            currentItem.content_type === 'writing'
                          ) {
                          }
                          playSound(audioToPlayOnClick);
                        }}
                        style={styles.feedback_AudioButton_NEW}>
                        <Image
                          source={require('../../assets/images/amThanhTiepTuc.png')}
                          style={[
                            styles.feedback_AudioIcon_NEW,
                            {tintColor: COLORS.white},
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
                      {color: showAnswerFeedback ? COLORS.primary : COLORS.red},
                    ]}>
                    Tiếp tục
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Nút "Tiếp tục" lớn (original/skip) */}
            {shouldShowOriginalContinueButton && (
              <TouchableOpacity
                style={[
                  isProblematicNonPronunTypeWithNoOptions
                    ? styles.skipButton
                    : styles.continueButton,
                  isContinueButtonDisabledIfPrimary &&
                    styles.disabledButtonFooter,
                ]}
                onPress={handleContinue}
                disabled={isContinueButtonDisabledIfPrimary}>
                <Text style={styles.footerButtonText}>Tiếp tục</Text>
              </TouchableOpacity>
            )}

            {/* Nút Tiếp tục fallback */}
            {!shouldShowCheckButton &&
              !shouldShowNewFeedbackUi &&
              !shouldShowOriginalContinueButton &&
              !(
                isPronunciationTypeCurrently && showAnswerFeedback === null
              ) && ( // Điều kiện mới: Không hiện nếu là pronunciation và nói sai (đang chờ retry/skip)
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isPrimaryContinueButtonDisabled &&
                      styles.disabledButtonFooter,
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

// Styles (GIỮ NGUYÊN)
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
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.75,
    marginTop: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  feedback_ContinueButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
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
    fontSize: SIZES.xLarge * 2.5,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressWrapper: {flex: 1, marginHorizontal: SIZES.base},
  progressBarContainer: {
    height: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBarFill: {
    height: '80%',
    backgroundColor: COLORS.primary || '#4CAF50',
    borderRadius: SIZES.radius,
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  contentScrollArea: {flex: 1, marginTop: SIZES.padding * 0.5},
  contentScrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
  },
  contentCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255,255,255,0.75)',
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
      Platform.OS === 'ios' ? SIZES.padding * 1.5 : SIZES.padding * 1.2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  checkButton: {
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  }, // Khôi phục margin
  continueButton: {
    backgroundColor: COLORS.primary || '#4CAF50',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 0 : 0,
  }, // Giữ nguyên margin này
  skipButton: {
    backgroundColor: COLORS.gray,
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginBottom: Platform.OS === 'android' ? 0 : 0,
  }, // Giữ nguyên margin này
  disabledButtonFooter: {
    backgroundColor: COLORS.lightGray,
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  }, // Khôi phục margin
  footerButtonText: {
    fontFamily: FONTS.bold?.fontFamily,
    color: COLORS.white,
    fontSize: SIZES.font * 1.1,
    fontWeight: 'bold',
  },
  footer_CorrectBackground_NEW: {
    backgroundColor: COLORS.green || '#D4EDDA',
    borderTopColor: COLORS.green,
  },
  footer_IncorrectBackground_NEW: {
    backgroundColor: COLORS.deeperRed || '#F8D7DA',
    borderTopColor: COLORS.deeperRed,
  },
  feedback_Container_NEW: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flex: 1,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.padding * 0.5,
    minHeight: Platform.OS === 'ios' ? 90 : 80,
  }, // Giữ nguyên minHeight gốc
  feedback_TextAudioWrapper_NEW: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.base * 0.5,
  },
  feedback_TextContainer_NEW: {
    flex: 1,
    marginRight: SIZES.base,
    marginLeft: 40,
    alignItems: 'center',
  }, // Thêm lại alignItems: 'center'
  feedback_CorrectAnswerText_NEW: {
    fontSize: SIZES.xxLarge,
    opacity: 0.9,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.white,
  },
  feedback_CorrectAnswerRomaji_NEW: {
    fontFamily: FONTS.regular?.fontFamily,
    fontSize: SIZES.medium,
    opacity: 0.8,
    textAlign: 'center',
    color: COLORS.white,
    marginTop: 2,
  },
  feedback_AudioButton_NEW: {padding: SIZES.base * 0.5, borderRadius: 20},
  feedback_AudioIcon_NEW: {width: 28, height: 28},
  feedback_ContinueButton_NEW: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding * 0.8,
    paddingHorizontal: SIZES.padding * 2.5,
    borderRadius: SIZES.radius * 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginTop: SIZES.base,
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  }, // Khôi phục margin
  audioActivityIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
  },
  audioErrorText: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    color: COLORS.red,
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 3,
  },
});

const summaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: screenWidth * 0.3,
    height: screenWidth * 0.3,
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.xxLarge,
    color: COLORS.text,
    marginBottom: SIZES.padding * 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: SIZES.radius / 2,
    elevation: 2,
  },
  iconText: {width: SIZES.h2, height: SIZES.h2, marginRight: SIZES.base},
  text: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font,
    color: COLORS.textSecondary || COLORS.darkGray,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 3,
    borderRadius: SIZES.radius * 2.5,
    marginTop: SIZES.padding * 2,
    alignItems: 'center',
    width: '90%',
  },
  completeButtonText: {
    fontFamily: FONTS.bold?.fontFamily,
    color: COLORS.white,
    fontSize: SIZES.large,
  },

  disabledButton: {backgroundColor: COLORS.gray},
});

export default ContentsScreen;
