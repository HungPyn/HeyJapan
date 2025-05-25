// src/screens/courses/ExamContentsScreen.tsx
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

// --- Types cho API lấy câu hỏi ---
interface ApiQuestionChoice {
  id: number;
  textForeign: string | null;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null; // Audio cho từng lựa chọn (nếu có)
  textBlock?: string;
  isCorrect: boolean | number | null;
  // Các trường lessonQuestion, examQuestion có thể không cần thiết ở client nếu không dùng
  lessonQuestion?: number | null;
  examQuestion?: number | null;
}

interface ApiQuestion {
  id: number;
  questionType: string;
  promptTextTemplate: string;
  targetWordNative: string;
  targetLanguageCode: string;
  optionsLanguageCode: string;
  audioUrlExam: string | null; // Đổi tên từ audio_url_questions sang audioUrlExam
  questionChoices: ApiQuestionChoice[];
}
// --- End Types cho API lấy câu hỏi ---

// --- Type cho Payload gửi kết quả bài kiểm tra ---
interface SubmitExamResultPayload {
  examTime: number;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  topicId: number; // Sử dụng topicId
  userId: string;
}
// --- End Type cho Payload gửi kết quả bài kiểm tra ---

// --- Dữ liệu nội bộ và mapping ---
interface Option {
  id: string;
  text: string;
  textRomaji?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

interface MappedContentItem {
  content_code: number;
  content_type:
    | 'audio'
    | 'voice'
    | 'select'
    | 'sapXep'
    | 'select_image'
    | 'audio_choice';
  title: string | null;
  content_detail: string;
  audio_url: string | null; // Sẽ lấy từ audioUrlExam
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
  'ContentExam' // Đảm bảo tên route này khớp với định nghĩa trong navigation của bạn
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

interface SummaryScreenProps {
  correctAnswersCount: number;
  totalQuestions: number;
  timeTaken: string;
  onSubmitResult: () => void;
  isSubmitting: boolean;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({
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

  // Lấy topicId và lessonName từ route.params
  const {topicId, lessonName: lessonNameFromRoute = 'Bài kiểm tra'} =
    route.params;

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
  const [arrangedWords, setArrangedWords] = useState<Option[]>([]);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (e) {
      console.error('Failed to fetch token:', e);
      return null;
    }
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem('UserId');
      return userId;
    } catch (e) {
      console.error('Failed to fetch UserId:', e);
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
          case 'AUDIO_CHOICE':
            internalContentType =
              apiQuestion.questionType === 'AUDIO_CHOICE'
                ? 'audio_choice'
                : 'select';
            mappedOptions = choicesFromApi.map(qc => ({
              id: String(qc.id),
              text: qc.textForeign || '',
              textRomaji: qc.textRomaji ?? null,
              audioUrl: qc.audioUrlForeign, // Audio cho từng lựa chọn
            }));
            const correctChoice = choicesFromApi.find(
              qc => qc.isCorrect === true,
            );
            if (correctChoice) {
              correctAnswerIds = String(correctChoice.id);
              correctAnswerForeign = correctChoice.textForeign;
              correctAnswerRomaji = correctChoice.textRomaji ?? null;
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
              audioUrl: qc.audioUrlForeign, // Audio cho từng lựa chọn (nếu có)
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
                    id: `${apiQuestion.id}_examchoice${firstChoiceWordOrder.id}_word${index}`,
                    text: String(word),
                    textRomaji: null,
                    audioUrl: null,
                  }));
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = []; // Not primary for WORD_ORDER comparison
                } else {
                  console.warn(
                    `EXAM WORD_ORDER (id: ${apiQuestion.id}): textBlock không phải là mảng JSON.`,
                  );
                  mappedOptions = [];
                  correctAnswerForeign = firstChoiceWordOrder.textForeign;
                  correctAnswerRomaji = firstChoiceWordOrder.textRomaji ?? null;
                  correctAnswerIds = [];
                }
              } catch (e) {
                console.error(
                  `EXAM WORD_ORDER (id: ${apiQuestion.id}): Lỗi parse textBlock JSON:`,
                  e,
                );
                mappedOptions = [];
                correctAnswerForeign =
                  firstChoiceWordOrder?.textForeign ?? null;
                correctAnswerRomaji = firstChoiceWordOrder?.textRomaji ?? null;
                correctAnswerIds = [];
              }
            } else {
              console.warn(
                `EXAM WORD_ORDER (id: ${apiQuestion.id}): Thiếu questionChoices[0] hoặc textBlock không hợp lệ.`,
              );
              mappedOptions = [];
              correctAnswerForeign = null;
              correctAnswerRomaji = null;
              correctAnswerIds = [];
            }
            break;
          default:
            console.warn(
              `Unknown questionType in Exam: ${apiQuestion.questionType}`,
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
          audio_url: apiQuestion.audioUrlExam, // Sử dụng audioUrlExam từ API
          image_url: null, // Hiện tại không dùng trực tiếp từ API cho MappedContentItem
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
    // Đổi tên biến cho rõ ràng
    if (apiQuestions.length > 0) {
      return mapApiQuestionsToMappedContent(apiQuestions);
    }
    return [];
  }, [apiQuestions, mapApiQuestionsToMappedContent]);

  const currentItem = itemsForThisExam[currentIndex];

  const shuffledSapXepOptions = useMemo(() => {
    if (
      currentItem &&
      currentItem.content_type === 'sapXep' &&
      currentItem.options
    ) {
      return [...currentItem.options].sort(() => Math.random() - 0.5);
    }
    return null;
  }, [currentItem]);

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
          `${API_USER_BASE_URL}/question/exam-question?topicId=${topicId}`, // Endpoint cho exam
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length > 0) {
            setApiQuestions(response.data);
          } else {
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
    const scorePercent =
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
      scorePercent: parseFloat(scorePercent.toFixed(2)),
      totalQuestions: totalQuestionsCount,
      correctAnswers: correctAnswersCount,
      topicId: currentTopicId,
      userId: currentUserId,
    };

    const resultEndpoint = `${API_USER_BASE_URL}/result/exam-result`; // Endpoint cho exam result

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
    setArrangedWords([]);
  }, [currentIndex]);

  const playSound = (audioUrlToPlayParam: string | null) => {
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
  };

  const handleOptionSelect = (optionId: string) => {
    if (showAnswerFeedback === null) {
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

  const handleWordBankPress = (wordOption: Option) => {
    if (showAnswerFeedback !== null) return;
    if (!arrangedWords.find(w => w.id === wordOption.id)) {
      setArrangedWords(prev => [...prev, wordOption]);
      if (wordOption.audioUrl) {
        playSound(wordOption.audioUrl);
      }
    }
  };

  const handleArrangedWordPress = (wordOptionToRemove: Option) => {
    if (showAnswerFeedback !== null) return;
    setArrangedWords(prev =>
      prev.filter(word => word.id !== wordOptionToRemove.id),
    );
  };

  const handleCheckAnswer = () => {
    if (!currentItem) return;
    let isCorrectUserAnswer = false;
    const type = currentItem.content_type;

    if (
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
      // WORD_ORDER logic
      if (
        arrangedWords.length === 0 &&
        (currentItem.options?.length || 0) > 0
      ) {
        Alert.alert('Thông báo', 'Bạn chưa sắp xếp từ nào.');
        return;
      }
      const userAnswerString = arrangedWords.map(word => word.text).join('');
      const correctAnswerString = currentItem.correct_answer_foreign;
      if (
        correctAnswerString !== null &&
        userAnswerString === correctAnswerString
      ) {
        isCorrectUserAnswer = true;
      } else {
        isCorrectUserAnswer = false;
      }
    } else if (type === 'voice' || type === 'audio') {
      isCorrectUserAnswer = true;
      setShowAnswerFeedback(isCorrectUserAnswer);
      return;
    }
    setShowAnswerFeedback(isCorrectUserAnswer);
    if (isCorrectUserAnswer) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (!currentItem) return;
    const type = currentItem.content_type;
    const needsCheckAndNotChecked =
      (type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image' ||
        type === 'sapXep') &&
      showAnswerFeedback === null &&
      currentItem.options &&
      currentItem.options.length > 0 &&
      (((type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image') &&
        !userSelectedOptionId) ||
        (type === 'sapXep' && arrangedWords.length === 0));
    if (needsCheckAndNotChecked) {
      Alert.alert(
        'Thông báo',
        "Bạn vui lòng chọn đáp án và nhấn 'Kiểm tra' trước khi tiếp tục!",
      );
      return;
    }
    const isLastItem = currentIndex >= itemsForThisExam.length - 1;
    if (isLastItem) {
      if (
        showAnswerFeedback !== null ||
        type === 'voice' ||
        type === 'audio' ||
        !currentItem.options ||
        currentItem.options.length === 0
      ) {
        setEndTime(new Date());
        setShowSummaryScreen(true);
      } else {
        Alert.alert(
          'Thông báo',
          "Đây là câu hỏi cuối cùng. Vui lòng nhấn 'Kiểm tra' trước khi hoàn thành bài kiểm tra.",
        );
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTimeTaken = useCallback(() => {
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
      'Thoát khỏi bài kiểm tra?',
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

    const optionsToRender =
      currentItem.content_type === 'sapXep' && shuffledSapXepOptions
        ? shuffledSapXepOptions
        : currentItem.options || [];

    switch (currentItem.content_type) {
      case 'voice':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>
              {currentItem.title || 'Nói lại từ(câu) dưới đây:'}
            </Text>
            {currentItem.content_detail && (
              <Text style={styles.voiceContentDetailText}>
                {currentItem.content_detail}
              </Text>
            )}
            {currentItem.audio_url && ( // Kiểm tra audio_url trước khi hiển thị nút
              <TouchableOpacity
                onPress={() => playSound(currentItem.audio_url)}
                style={styles.contentCard2}>
                <Image
                  source={require('../../assets/images/iconAmThanh.png')}
                  style={styles.AudioIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.recordButtonContainer}
              onPress={() =>
                Alert.alert('Ghi âm', 'Chức năng ghi âm (chưa triển khai).')
              }>
              <Image
                source={require('../../assets/images/micro.png')}
                style={styles.recordIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        );
      case 'select_image':
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              <View style={styles.questionSelectContainer}>
                {currentItem.audio_url && (
                  <TouchableOpacity
                    onPress={() => playSound(currentItem.audio_url)}
                    style={styles.questionAudioButtonSelect}>
                    <Image
                      source={require('../../assets/images/audioInconten.png')}
                      style={styles.audioIconSmall}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.contentDetailSelect}>
                  {currentItem.title || 'Chọn hình ảnh đúng'}
                  {currentItem.content_detail &&
                  currentItem.content_detail !== currentItem.title
                    ? `: "${currentItem.content_detail}"`
                    : ''}
                </Text>
              </View>
            </View>
            <View style={styles.imageOptionsContainer}>
              {optionsToRender.map(option => {
                // Sử dụng optionsToRender
                const isSelected = userSelectedOptionId === option.id;
                const isCorrectOption =
                  currentItem.correct_answer === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.imageOptionButton,
                      isSelected &&
                        showAnswerFeedback === null &&
                        styles.selectedImageOption,
                      showAnswerFeedback === true &&
                        isCorrectOption &&
                        styles.correctImageOption,
                      showAnswerFeedback === false &&
                        isSelected &&
                        styles.incorrectImageOption,
                      showAnswerFeedback === false &&
                        isCorrectOption &&
                        styles.correctImageOption,
                    ]}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={showAnswerFeedback !== null}>
                    {option.imageUrl && (
                      <Image
                        source={{uri: option.imageUrl}}
                        style={styles.optionImage}
                        resizeMode="cover"
                      />
                    )}
                    {(option.text && option.text.trim() !== '') ||
                    (option.textRomaji && option.textRomaji.trim() !== '') ? (
                      <View style={styles.optionImageTextContainer_NEW}>
                        {option.text && option.text.trim() !== '' && (
                          <Text style={styles.optionImageTextForeign_NEW}>
                            {option.text}
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 'select':
      case 'audio_choice':
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              <View style={styles.questionSelectContainer}>
                {currentItem.audio_url && (
                  <TouchableOpacity
                    onPress={() => playSound(currentItem.audio_url)}
                    style={styles.questionAudioButtonSelect}>
                    <Image
                      source={require('../../assets/images/audioInconten.png')}
                      style={styles.audioIconSmall}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.contentDetailSelect}>
                  {currentItem.title ||
                    (currentItem.content_type === 'audio_choice'
                      ? 'Nghe và chọn đáp án'
                      : 'Chọn đáp án đúng')}
                  {currentItem.content_type === 'select' &&
                  currentItem.content_detail &&
                  currentItem.content_detail !== currentItem.title
                    ? `: "${currentItem.content_detail}"`
                    : ''}
                </Text>
              </View>
            </View>
            <View style={styles.optionsContainer}>
              {optionsToRender.map(option => {
                // Sử dụng optionsToRender
                const isSelected = userSelectedOptionId === option.id;
                const isCorrectOption =
                  currentItem.correct_answer === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      isSelected &&
                        showAnswerFeedback === null &&
                        styles.selectedOption,
                      showAnswerFeedback === true &&
                        isCorrectOption &&
                        styles.correctOption,
                      showAnswerFeedback === false &&
                        isSelected &&
                        styles.incorrectOption,
                      showAnswerFeedback === false &&
                        isCorrectOption &&
                        styles.correctOption,
                    ]}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={showAnswerFeedback !== null}>
                    <View
                      style={{flexDirection: 'column', alignItems: 'center'}}>
                      <Text
                        style={[
                          styles.optionText,
                          showAnswerFeedback === true &&
                            isCorrectOption &&
                            styles.correctOptionText,
                          showAnswerFeedback === false &&
                            isSelected &&
                            !isCorrectOption &&
                            styles.incorrectOptionText,
                          showAnswerFeedback === false &&
                            isCorrectOption &&
                            styles.correctOptionText,
                        ]}>
                        {option.text}
                      </Text>
                      {option.textRomaji && (
                        <Text
                          style={[
                            styles.optionTextRomaji,
                            showAnswerFeedback !== null && isCorrectOption
                              ? styles.correctOptionText
                              : {},
                            showAnswerFeedback !== null &&
                            isSelected &&
                            !isCorrectOption
                              ? styles.incorrectOptionText
                              : {},
                          ]}>
                          ({option.textRomaji})
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 'sapXep':
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              {currentItem.title && (
                <Text style={styles.contentTitleSelect}>
                  {currentItem.title}
                </Text>
              )}
              <View style={styles.originalSentenceContainer}>
                {currentItem.audio_url && (
                  <TouchableOpacity
                    onPress={() => playSound(currentItem.audio_url)}
                    style={styles.questionAudioButton}>
                    <Image
                      source={require('../../assets/images/audioInconten.png')}
                      style={styles.audioIconSmall}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                {showAnswerFeedback !== null &&
                currentItem.correct_answer_foreign ? (
                  <Text style={styles.contentDetailXapXep_Answered}>
                    {currentItem.correct_answer_foreign}
                    {currentItem.correct_answer_romaji
                      ? ` (${currentItem.correct_answer_romaji})`
                      : ''}
                  </Text>
                ) : (
                  <Text style={styles.contentDetailXapXep}>
                    {currentItem.content_detail ||
                      'Sắp xếp các khối từ bên dưới'}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.wordArrangeDropArea}>
              {arrangedWords.length > 0 ? (
                arrangedWords.map((word, index) => {
                  let wordStyle = {};
                  if (showAnswerFeedback === true) {
                    wordStyle = styles.correctWordBackground;
                  } else if (showAnswerFeedback === false) {
                    wordStyle = styles.incorrectWordBackground;
                  }
                  return (
                    <TouchableOpacity
                      key={`${word.id}_arranged_${index}`}
                      style={[
                        styles.wordBankItem,
                        styles.arrangedWordItem,
                        wordStyle,
                      ]}
                      onPress={() => handleArrangedWordPress(word)}
                      disabled={showAnswerFeedback !== null}>
                      <Text
                        style={[styles.wordBankText, styles.arrangedWordText]}>
                        {word.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.arrangedTextPlaceholder}>
                  ______________________________
                </Text>
              )}
            </View>
            <View style={styles.wordBankContainer}>
              {optionsToRender.map(wordOption => {
                // Sử dụng optionsToRender (đã xáo trộn)
                const isWordAlreadyArranged = arrangedWords.find(
                  w => w.id === wordOption.id,
                );
                return (
                  <TouchableOpacity
                    key={wordOption.id}
                    style={[
                      styles.wordBankItem,
                      isWordAlreadyArranged
                        ? styles.wordBankItemSelectedAndUsed
                        : {},
                      showAnswerFeedback !== null
                        ? styles.disabledWordBankItem
                        : {},
                    ]}
                    onPress={() => handleWordBankPress(wordOption)}
                    disabled={
                      !!isWordAlreadyArranged || showAnswerFeedback !== null
                    }>
                    <Text style={styles.wordBankText}>{wordOption.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 'audio':
        return (
          <View style={styles.contentCard}>
            {currentItem.title && (
              <Text style={styles.contentTitleAudio}>{currentItem.title}</Text>
            )}
            {currentItem.image_url && (
              <Image
                source={{uri: currentItem.image_url}}
                style={styles.contentImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.contentDetailAudio}>
              {currentItem.content_detail}
            </Text>
            {currentItem.audio_url && (
              <TouchableOpacity
                onPress={() => playSound(currentItem.audio_url)}
                style={styles.audioPlayerPlaceholder}>
                <Image
                  source={require('../../assets/images/iconAmThanh.png')}
                  style={styles.AudioIcon}
                />
                <Text> Phát âm thanh</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return (
          <View style={styles.contentCard}>
            <Text>
              Loại nội dung "{currentItem.content_type}" chưa được hỗ trợ.
            </Text>
          </View>
        );
    }
  };

  // --- Phần return của component chính ---
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.retryButton,
              {marginTop: 10, backgroundColor: COLORS.gray},
            ]}>
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
          <SummaryScreen
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
  const shouldShowCheckButton =
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
    showAnswerFeedback === null &&
    currentItem.options &&
    currentItem.options.length > 0 &&
    (((currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice') &&
      userSelectedOptionId) ||
      (currentItem.content_type === 'sapXep' && arrangedWords.length > 0));
  const shouldShowNewFeedbackUi =
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
    showAnswerFeedback !== null;
  const isNonInteractiveType =
    currentItem &&
    (currentItem.content_type === 'voice' ||
      currentItem.content_type === 'audio');
  const typeHasNoOptionsToInteract =
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice' ||
      currentItem.content_type === 'sapXep') &&
    (!currentItem.options || currentItem.options.length === 0);
  const shouldShowOriginalContinueOrSkip =
    !shouldShowCheckButton &&
    !shouldShowNewFeedbackUi &&
    (isNonInteractiveType || typeHasNoOptionsToInteract);
  const isContinueButtonDisabled =
    currentItem &&
    (currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice') &&
    !userSelectedOptionId &&
    showAnswerFeedback === null &&
    currentItem.options &&
    currentItem.options.length > 0;
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
          </View>
          <ScrollView
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
            key={`content_scroll_${currentIndex}_${showAnswerFeedback}`}>
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
              }}
              onEnd={() => {
                setIsAudioPlaying(false);
              }}
              onError={videoError => {
                console.error('Video: Lỗi khi phát audio:', videoError);
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
                      {showAnswerFeedback === false ? 'Đáp án đúng: ' : ''}
                      {currentItem.correct_answer_foreign ||
                        currentItem.content_detail}
                      {currentItem.targetLanguageCode &&
                        ` (${currentItem.targetLanguageCode.toUpperCase()})`}
                    </Text>
                    {currentItem.correct_answer_romaji && (
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
                    currentItem.audio_url) && (
                    <TouchableOpacity
                      onPress={() => {
                        let audioToPlayOnClick = currentItem.audio_url;
                        if (typeof currentItem.correct_answer === 'string') {
                          const correctOpt = currentItem.options?.find(
                            opt => opt.id === currentItem.correct_answer,
                          );
                          if (correctOpt?.audioUrl) {
                            audioToPlayOnClick = correctOpt.audioUrl;
                          }
                        } else if (
                          Array.isArray(currentItem.correct_answer) &&
                          currentItem.content_type === 'sapXep'
                        ) {
                          audioToPlayOnClick = currentItem.audio_url;
                        }
                        playSound(audioToPlayOnClick);
                      }}
                      style={styles.feedback_AudioButton_NEW}>
                      <Image
                        source={require('../../assets/images/amThanhTiepTuc.png')}
                        style={[
                          styles.feedback_AudioIcon_NEW,
                          {
                            tintColor: showAnswerFeedback
                              ? COLORS.primary
                              : COLORS.white,
                          },
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
            {shouldShowOriginalContinueOrSkip && (
              <TouchableOpacity
                style={[
                  isNonInteractiveType || typeHasNoOptionsToInteract
                    ? styles.skipButton
                    : styles.continueButton,
                  isContinueButtonDisabled &&
                    !isNonInteractiveType &&
                    styles.disabledButtonFooter,
                ]}
                onPress={handleContinue}
                disabled={
                  !!(isContinueButtonDisabled && !isNonInteractiveType)
                }>
                <Text style={styles.footerButtonText}>
                  {isNonInteractiveType || typeHasNoOptionsToInteract
                    ? 'Tiếp tục'
                    : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>
            )}
            {!shouldShowCheckButton &&
              !shouldShowNewFeedbackUi &&
              !shouldShowOriginalContinueOrSkip && (
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isContinueButtonDisabled && styles.disabledButtonFooter,
                  ]}
                  onPress={handleContinue}
                  disabled={!!isContinueButtonDisabled}>
                  <Text style={styles.footerButtonText}>Tiếp tục</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (giữ nguyên như đã cung cấp trong prompt trước)
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
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
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
    marginTop: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  headerLessonName: {
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 2,
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
  contentCardQuestion: {
    backgroundColor: COLORS.nenItem || COLORS.white,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
  },
  contentTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  voiceContentDetailText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  AudioIcon: {width: 120, height: 120, tintColor: COLORS.primary},
  recordIcon: {width: 50, height: 50, tintColor: COLORS.red},
  contentCard2: {
    alignItems: 'center',
    alignSelf: 'center',
    padding: SIZES.base,
  },
  recordButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SIZES.base,
    padding: SIZES.base,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 50,
  },
  imageOptionsContainer: {
    marginTop: 40,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  },
  imageOptionButton: {
    width: 140,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base * 2,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  optionImage: {
    width: '75%',
    height: '75%',
    marginBottom: 20,
    borderRadius: SIZES.radius / 1,
  },
  optionImageTextContainer_NEW: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    alignItems: 'center',
    paddingVertical: SIZES.base / 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: SIZES.radius / 2,
  },
  optionImageTextForeign_NEW: {
    fontSize: SIZES.font * 1,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '400',
  },
  optionImageTextRomaji_NEW: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.8,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  imageOptionAudioButton_NEW: {display: 'none'},
  imageOptionAudioIcon_NEW: {width: 18, height: 18, tintColor: COLORS.white},
  selectedImageOption: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    backgroundColor: COLORS.lightPrimary,
  },
  correctImageOption: {
    borderColor: COLORS.green,
    borderWidth: 3,
    backgroundColor: COLORS.lightGreen,
  },
  incorrectImageOption: {
    borderColor: COLORS.red,
    borderWidth: 3,
    backgroundColor: COLORS.lightRed,
  },
  questionSelectContainer: {flexDirection: 'row', alignItems: 'center'},
  questionAudioButtonSelect: {marginRight: SIZES.base},
  audioIconSmall: {width: 30, height: 30},
  contentDetailSelect: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: 'left',
    flex: 1,
  },
  optionsContainer: {marginTop: SIZES.padding},
  optionButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.9,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.base * 0.6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextAudioButton_NEW: {marginRight: SIZES.base},
  optionTextAudioIcon_NEW: {width: 20, height: 20},
  optionText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'center',
    flexShrink: 1,
  },
  optionTextRomaji: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.8,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.lightPrimary || 'rgba(0,122,255,0.1)',
  },
  correctOption: {
    backgroundColor: COLORS.lightGreen || 'rgba(40,167,69,0.15)',
    borderColor: COLORS.green || '#28A745',
    borderWidth: 2,
  },
  correctOptionText: {color: COLORS.darkGreen || '#155724', fontWeight: 'bold'},
  incorrectOption: {
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
    borderWidth: 2,
  },
  incorrectOptionText: {color: COLORS.darkRed || '#721C24', fontWeight: 'bold'},
  contentTitleSelect: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  originalSentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  questionAudioButton: {marginRight: SIZES.base},
  contentDetailXapXep: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font * 1.1,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: SIZES.font * 1.5,
  },
  contentDetailXapXep_Answered: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font * 1.1,
    color: COLORS.black,
    flex: 1,
    lineHeight: SIZES.font * 1.5,
    fontWeight: '500',
  },
  wordArrangeDropArea: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'flex-start',
  },
  arrangedTextPlaceholder: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    flex: 1,
    textAlign: 'center',
    lineHeight: 50,
  },
  arrangedWordItem: {backgroundColor: COLORS.primary || '#28a745'},
  wordBankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SIZES.padding * 0.5,
    minHeight: 60,
  },
  wordBankItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding * 0.8,
    paddingVertical: SIZES.padding * 0.6,
    borderRadius: SIZES.radius,
    margin: SIZES.base * 0.4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  wordBankText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  wordBankTextRomaji: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.8,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  arrangedWordText: {color: COLORS.white, fontWeight: '500'},
  wordBankItemSelectedAndUsed: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
    opacity: 0.3,
  },
  disabledWordBankItem: {opacity: 0.3},
  correctWordBackground: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
  },
  incorrectWordBackground: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.darkRed,
  },
  contentTitleAudio: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: '600',
  },
  contentImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    alignSelf: 'center',
  },
  contentDetailAudio: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.textSecondary || COLORS.darkGray,
    lineHeight: SIZES.font * 1.5,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  audioPlayerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    marginTop: SIZES.margin,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyContentText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  errorContainer: {flex: 1, backgroundColor: COLORS.background || COLORS.white},
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  backButtonTextError: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
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
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: COLORS.primary || '#4CAF50',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  skipButton: {
    backgroundColor: COLORS.gray,
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  disabledButtonFooter: {backgroundColor: COLORS.lightGray, marginBottom: 30},
  footerButtonText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
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
  },
  feedback_TextAudioWrapper_NEW: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.base * 0.5,
  },
  feedback_TextContainer_NEW: {
    marginBottom: 30,
    flex: 1,
    marginRight: SIZES.base,
    alignItems: 'center',
    marginLeft: 40,
  },
  feedback_CorrectAnswerText_NEW: {
    fontSize: SIZES.xxLarge,
    opacity: 0.9,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.white,
  },
  feedback_CorrectAnswerRomaji_NEW: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.medium,
    opacity: 0.8,
    textAlign: 'center',
    color: COLORS.white,
    marginTop: 2,
  },
  feedback_AudioButton_NEW: {padding: SIZES.base * 0.5, borderRadius: 20},
  feedback_AudioIcon_NEW: {width: 28, height: 28},
  feedback_ContinueButton_NEW: {
    marginBottom: 30,
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
  },
  feedback_ContinueButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
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
    fontFamily: FONTS.bold?.fontFamily || 'System',
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
    fontFamily: FONTS.medium?.fontFamily || 'System',
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
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.large,
  },
  disabledButton: {backgroundColor: COLORS.gray},
});

export default ExamContentsScreen;
