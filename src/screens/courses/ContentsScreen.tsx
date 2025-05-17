// src/screens/lessons/ContentsScreen.tsx
import React, {useState, useMemo, useEffect, useCallback} from 'react';
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
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList, RootStackParamList} from '../../navigation'; // Đảm bảo đường dẫn này đúng
import {COLORS, FONTS, SIZES} from '../../constants/theme'; // Đảm bảo đường dẫn này đúng
import Video from 'react-native-video';
// import {Colors} from 'react-native/Libraries/NewAppScreen'; // Bỏ nếu không dùng từ bản cũ

// --- BEGIN NEW DATA INTERFACES AND PROVIDED DATA ---
interface NewApiQuestionChoice {
  id: number;
  textForeign: string | null;
  textRomaji?: string | null;
  imageUrl: string | null;
  audioUrlForeign: string | null;
  isCorrect: boolean | number | null; // boolean for most, number for WORD_ORDER sequence
}

interface NewApiContentItem {
  id: number;
  questionType: string;
  promptTextTemplate: string | null;
  targetWordNative: string | null; // This is the word/sentence in the native language (e.g., Vietnamese)
  targetLanguageCode: string; // e.g., "ja"
  optionsLanguageCode: string; // e.g., "vi" or "ja"
  audioUrl: string | null; // Renamed from questionAudioUrl for clarity
  imageUrl: string | null; // Renamed from questionImageUrl for clarity
  questionChoices: NewApiQuestionChoice[];
}

// Dữ liệu bạn cung cấp
const lessonApiData: NewApiContentItem[] = [
  {
    id: 1,
    questionType: 'MULTIPLE_CHOICE_VOCAB_IMAGE',
    promptTextTemplate: 'Chọn hình ảnh đúng với từ sau',
    targetWordNative: 'Quả táo',
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi', // Should be 'ja' if options are Japanese words for images
    audioUrl:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob', // Audio for "Quả táo"
    imageUrl: null, // No main image for the question itself in this type
    questionChoices: [
      {
        id: 1,
        textForeign: 'りんご',
        textRomaji: 'ringo',
        imageUrl: 'https://i.imgur.com/oVacZ4F.png', // Image of an apple
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=こんにちは&tl=ja&client=tw-ob',
        isCorrect: true,
      },
      {
        id: 2,
        textForeign: 'みかん',
        textRomaji: 'mikan',
        imageUrl: 'https://i.imgur.com/na3U2uk.png', // Image of an orange
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=こんにちは&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 3,
        textForeign: 'ぶどう',
        textRomaji: 'budou',
        imageUrl: 'https://i.imgur.com/R8WeIEv.jpeg', // Image of grapes
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 4,
        textForeign: 'なし',
        textRomaji: 'nashi',
        imageUrl: 'https://i.imgur.com/BI2iGmn.jpeg', // Image of a pear
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
    ],
  },
  {
    id: 2,
    questionType: 'MULTIPLE_CHOICE_TEXT_ONLY',
    promptTextTemplate: 'Chọn nghĩa đúng của từ sau',
    targetWordNative: 'Giáo viên', // Word to be translated/defined
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi', // Options are in Japanese (textForeign)
    audioUrl:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob', // Audio for "Giáo viên" or the question itself
    imageUrl: null,
    questionChoices: [
      {
        id: 1,
        textForeign: 'せんせい',
        textRomaji: 'sensei',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: true,
      },
      {
        id: 2,
        textForeign: 'がくせい',
        textRomaji: 'gakusei',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 3,
        textForeign: 'いしゃ',
        textRomaji: 'isha',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 4,
        textForeign: 'かいしゃいん',
        textRomaji: 'kaishain',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
    ],
  },
  {
    id: 3,
    questionType: 'AUDIO_CHOICE',
    promptTextTemplate: 'Nghe và chọn từ đúng',
    targetWordNative: 'Chó', // This might be a hint or not displayed directly, main interaction is audio
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi', // Options are in Japanese
    audioUrl:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob', // Main audio to listen to
    imageUrl: null,
    questionChoices: [
      {
        id: 1,
        textForeign: 'いぬ',
        textRomaji: 'inu',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob', // Option specific audio (could be same as main)
        isCorrect: true,
      },
      {
        id: 2,
        textForeign: 'ねこ',
        textRomaji: 'neko',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 3,
        textForeign: 'とり',
        textRomaji: 'tori',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
      {
        id: 4,
        textForeign: 'さかな',
        textRomaji: 'sakana',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: false,
      },
    ],
  },
  {
    id: 4,
    questionType: 'WORD_ORDER',
    promptTextTemplate: 'Sắp xếp các từ thành câu đúng',
    targetWordNative: 'Tôi là sinh viên', // Sentence in native language
    targetLanguageCode: 'ja',
    optionsLanguageCode: 'vi', // Options are words in Japanese
    audioUrl:
      'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob', // Audio for "Tôi là sinh viên" or the target sentence in Japanese
    imageUrl: null,
    questionChoices: [
      {
        id: 1,
        textForeign: 'わたし',
        textRomaji: 'watashi',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: 1, // Sequence number
      },
      {
        id: 2,
        textForeign: 'は',
        textRomaji: 'wa',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: 2, // Sequence number
      },
      {
        id: 3,
        textForeign: 'がくせい',
        textRomaji: 'gakusei',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: 3, // Sequence number
      },
      {
        id: 4,
        textForeign: 'です',
        textRomaji: 'desu',
        imageUrl: null,
        audioUrlForeign:
          'https://translate.google.com/translate_tts?ie=UTF-8&q=じゃあ、また&tl=ja&client=tw-ob',
        isCorrect: 4, // Sequence number
      },
    ],
  },
  // Example for VOICE_INPUT if you had one (similar to old 'voice')
  // {
  //   id: 5,
  //   questionType: 'VOICE_INPUT',
  //   promptTextTemplate: 'Nói lại từ sau:',
  //   targetWordNative: 'ありがとう (Cảm ơn)',
  //   targetLanguageCode: 'ja',
  //   optionsLanguageCode: 'vi', // Not applicable for options
  //   audioUrl: 'https://example.com/audio/arigato.mp3', // Audio of 'ありがとう'
  //   imageUrl: null,
  //   questionChoices: [], // No choices for voice input
  // },
];
// --- END NEW DATA ---

// Internal data structure, similar to old LessonContentItem
interface Option {
  id: string;
  text: string;
  imageUrl?: string | null; // For image choices
  audioUrl?: string | null; // For audio on choices
}

interface MappedContentItem {
  content_code: number; // from id
  content_type:
    | 'audio'
    | 'voice'
    | 'select'
    | 'sapXep'
    | 'select_image'
    | 'audio_choice';
  title: string | null; // from promptTextTemplate
  content_detail: string; // from targetWordNative or other relevant field
  audio_url: string | null; // from NewApiContentItem.audioUrl (main question audio)
  image_url: string | null; // from NewApiContentItem.imageUrl (main question image)
  options?: Option[];
  correct_answer?: string | string[]; // ID(s) of correct Option
  user_answer?: string | string[];
  // Fields from old structure that might not be directly mapped or are handled differently:
  // display_order: will be array index
  // lesson_code: from route param
  // skill_code: not in new data
}

type ContentsScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsScreen'
>;
type ContentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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
  onComplete: () => void;
}
const LessonSummaryScreen: React.FC<LessonSummaryProps> = ({
  correctAnswersCount,
  totalQuestions,
  timeTaken,
  onComplete,
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
          style={summaryStyles.iconText} // Make sure this image exists or use a valid one
        />
        <Text style={summaryStyles.text}>
          Tỷ lệ đúng: {correctAnswersCount}/{totalQuestions}
        </Text>
      </View>
      <View style={summaryStyles.card}>
        <Image
          source={require('../../assets/images/TiLeHoanThanh.png')} // Make sure this image exists
          style={summaryStyles.iconText}
        />
        <Text style={summaryStyles.text}>Hoàn thành: {accuracy}%</Text>
      </View>
      <View style={summaryStyles.card}>
        <Image
          source={require('../../assets/images/tocDo.png')} // Make sure this image exists
          style={summaryStyles.iconText}
        />
        <Text style={summaryStyles.text}>Tốc độ: {timeTaken}</Text>
      </View>
      <TouchableOpacity
        style={summaryStyles.completeButton}
        onPress={onComplete}>
        <Text style={summaryStyles.completeButtonText}>Hoàn thành</Text>
      </TouchableOpacity>
    </View>
  );
};

const ContentsScreen: React.FC = () => {
  const route = useRoute<ContentsScreenRouteProp>();
  const navigation = useNavigation<ContentsScreenNavigationProp>();

  const lessonCodeFromParam = route.params?.lessonCode;
  // const currentLessonCode = parseInt(lessonCodeFromParam || '0', 10); // Not used directly to filter hardcoded data anymore

  const mapNewDataToInternalFormat = useCallback(
    (newData: NewApiContentItem[]): MappedContentItem[] => {
      return newData.map(item => {
        let internalContentType: MappedContentItem['content_type'];
        let mappedOptions: Option[] | undefined = undefined;
        let correctAnswer: string | string[] | undefined = undefined;

        const choices = item.questionChoices || [];

        switch (item.questionType) {
          case 'MULTIPLE_CHOICE_TEXT_ONLY':
            internalContentType = 'select';
            mappedOptions = choices.map(qc => ({
              id: String(qc.id),
              text: `${qc.textForeign || ''}${
                qc.textRomaji ? ` (${qc.textRomaji})` : ''
              }`,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctTextChoice = choices.find(qc => qc.isCorrect === true);
            if (correctTextChoice) correctAnswer = String(correctTextChoice.id);
            break;
          case 'AUDIO_CHOICE':
            internalContentType = 'audio_choice'; // Using a more specific type, will render similar to 'select'
            mappedOptions = choices.map(qc => ({
              id: String(qc.id),
              text: `${qc.textForeign || ''}${
                qc.textRomaji ? ` (${qc.textRomaji})` : ''
              }`,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctAudioChoice = choices.find(
              qc => qc.isCorrect === true,
            );
            if (correctAudioChoice)
              correctAnswer = String(correctAudioChoice.id);
            break;
          case 'MULTIPLE_CHOICE_VOCAB_IMAGE':
            internalContentType = 'select_image';
            mappedOptions = choices.map(qc => ({
              id: String(qc.id),
              text: `${qc.textForeign || ''}${
                qc.textRomaji ? `\n(${qc.textRomaji})` : ''
              }`, // Text below image
              imageUrl: qc.imageUrl,
              audioUrl: qc.audioUrlForeign,
            }));
            const correctImageChoice = choices.find(
              qc => qc.isCorrect === true,
            );
            if (correctImageChoice)
              correctAnswer = String(correctImageChoice.id);
            break;
          case 'WORD_ORDER':
            internalContentType = 'sapXep';
            mappedOptions = choices.map(qc => ({
              id: String(qc.id),
              text: qc.textForeign || '',
            }));
            // Sort choices by 'isCorrect' (sequence number) and map to their IDs
            // Filter out any choices where isCorrect is not a number or is null
            const validOrderedChoices = choices
              .filter(
                qc => typeof qc.isCorrect === 'number' && qc.isCorrect !== null,
              )
              .sort(
                (a, b) => (a.isCorrect as number) - (b.isCorrect as number),
              );
            if (validOrderedChoices.length > 0) {
              correctAnswer = validOrderedChoices.map(qc => String(qc.id));
            } else {
              // Fallback if isCorrect is not providing sequence numbers
              // This case needs clarification based on actual API behavior for WORD_ORDER
              console.warn(
                `No valid sequence in isCorrect for WORD_ORDER item id: ${item.id}. Using original order as correct answer for testing.`,
              );
              correctAnswer = choices.map(qc => String(qc.id)); // Placeholder
            }
            break;
          case 'VOICE_INPUT': // Assuming 'VOICE_INPUT' is the new type for 'voice'
            internalContentType = 'voice';
            // No options or correct answer for voice input in the old format
            break;
          default:
            console.warn(`Unknown questionType: ${item.questionType}`);
            internalContentType = 'select'; // Fallback, though should be handled
            break;
        }

        return {
          content_code: item.id,
          content_type: internalContentType,
          title: item.promptTextTemplate,
          // content_detail is often the native language prompt or question main text
          content_detail:
            item.targetWordNative || item.promptTextTemplate || '',
          audio_url: item.audioUrl, // Main audio for the question
          image_url: item.imageUrl, // Main image for the question (used in old 'audio' type, or MULTIPLE_CHOICE_VOCAB_IMAGE if it had a central image)
          options: mappedOptions,
          correct_answer: correctAnswer,
        };
      });
    },
    [],
  );

  const itemsForThisLesson = useMemo(() => {
    // Instead of filtering by lessonCode (as data is directly provided),
    // we just map the provided data.
    // In a real scenario, you'd fetch data for lessonCodeFromParam here.
    return mapNewDataToInternalFormat(lessonApiData);
  }, [mapNewDataToInternalFormat]);

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

  const currentItem = itemsForThisLesson[currentIndex];
  const totalItems = itemsForThisLesson.length;

  useEffect(() => {
    if (itemsForThisLesson.length > 0 && !startTime) {
      setStartTime(new Date());
      setCorrectAnswersCount(0);
      setShowSummaryScreen(false);
      setCurrentIndex(0); // Reset to first question when data loads/changes
    }
  }, [itemsForThisLesson, startTime]); // Removed lessonCodeFromParam as data is hardcoded
  const [audioUrlToPlay, setAudioUrlToPlay] = useState<string | null>(null);
  useEffect(() => {
    setUserSelectedOptionId(null);
    setShowAnswerFeedback(null);
    setArrangedWords([]);
  }, [currentIndex, itemsForThisLesson]); // Reset when data or index changes

  const playSound = (audioUrl: string | null) => {
    console.log('Phát nhạc nè:', audioUrl);
    if (audioUrl) {
      setAudioUrlToPlay(audioUrl);
    } else {
      console.log('No audio URL provided for playSound');
    }
  };
  const handleOptionSelect = (optionId: string) => {
    if (showAnswerFeedback === null) {
      setUserSelectedOptionId(optionId);
    }
  };

  const handleWordBankPress = (wordOption: Option) => {
    if (showAnswerFeedback !== null) return;
    if (!arrangedWords.find(w => w.id === wordOption.id)) {
      setArrangedWords(prev => [...prev, wordOption]);
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
      if (
        arrangedWords.length === 0 &&
        (currentItem.options?.length || 0) > 0
      ) {
        Alert.alert('Thông báo', 'Bạn chưa sắp xếp từ nào.');
        return;
      }
      const userAnswerIds = arrangedWords.map(word => word.id);
      const correctAnswerIds = currentItem.correct_answer; // This is expected to be string[]

      if (
        Array.isArray(correctAnswerIds) &&
        userAnswerIds.length === correctAnswerIds.length &&
        userAnswerIds.every((val, index) => val === correctAnswerIds[index])
      ) {
        isCorrectUserAnswer = true;
      } else {
        isCorrectUserAnswer = false;
      }
    } else if (type === 'voice' || type === 'audio') {
      // For 'voice' and 'audio' (listening only), we might not have a checkable answer in this flow
      // Or if 'audio' implies selection, it should be 'audio_choice'
      setShowAnswerFeedback(true); // Assume correct or skip check
      // No increment to correctAnswersCount unless a check is performed
      return; // Skip incrementing score for non-interactive or uncheckable types
    }

    setShowAnswerFeedback(isCorrectUserAnswer);
    if (isCorrectUserAnswer) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (showSummaryScreen) {
      navigation.goBack();
      return;
    }

    const type = currentItem?.content_type;
    // Check if an answerable question type was shown but not checked
    if (
      (type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image' ||
        type === 'sapXep') &&
      showAnswerFeedback === null && // Feedback not yet shown
      currentItem.options && // Question has options
      (((type === 'select' ||
        type === 'audio_choice' ||
        type === 'select_image') &&
        userSelectedOptionId) || // An option was selected
        (type === 'sapXep' && arrangedWords.length > 0)) // Words were arranged
    ) {
      Alert.alert('Thông báo', "Bạn cần nhấn 'Kiểm tra' trước khi tiếp tục!");
      return;
    }

    const isLastItem = currentIndex >= totalItems - 1;

    if (isLastItem) {
      // Show summary if feedback has been processed OR if it's a non-interactive type like 'voice' or 'audio'
      if (showAnswerFeedback !== null || type === 'voice' || type === 'audio') {
        setEndTime(new Date());
        setShowSummaryScreen(true);
      } else if (
        (type === 'select' ||
          type === 'audio_choice' ||
          type === 'select_image' ||
          type === 'sapXep') &&
        !currentItem.options?.length
      ) {
        // If it's a question type that normally has options, but this specific item doesn't (e.g. info card), proceed to summary
        setEndTime(new Date());
        setShowSummaryScreen(true);
      }
      // If it's the last item, and it's an interactive question that hasn't been checked yet,
      // the 'Kiểm tra' alert above should have caught it.
      // If it was checked, showAnswerFeedback would not be null.
    } else {
      setCurrentIndex(prev => prev + 1);
      // Reset for next question already handled in useEffect [currentIndex]
    }
  };

  const formatTimeTaken = useCallback(() => {
    if (!startTime) return '0 phút 0 giây';
    const finalEndTime = endTime || new Date(); // Use current time if endTime is not set
    const diffMs = finalEndTime.getTime() - startTime.getTime();
    if (diffMs < 0) return '0 phút 0 giây'; // Should not happen
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.round((diffMs % 60000) / 1000);
    return `${diffMins} phút ${diffSecs} giây`;
  }, [startTime, endTime]);

  const handleBackPress = () => {
    Alert.alert(
      'Thoát khỏi bài học?',
      'Tiến trình của bạn có thể sẽ bị mất. Bạn có chắc muốn thoát không?',
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

  const getCorrectAnswerTextForFeedback = useCallback(() => {
    if (
      !currentItem ||
      showAnswerFeedback === null // Don't show if not yet checked
    )
      return null;

    if (
      (currentItem.content_type === 'select' ||
        currentItem.content_type === 'audio_choice' ||
        currentItem.content_type === 'select_image') &&
      typeof currentItem.correct_answer === 'string'
    ) {
      return (
        currentItem.options?.find(opt => opt.id === currentItem.correct_answer)
          ?.text || null
      );
    } else if (
      currentItem.content_type === 'sapXep' &&
      Array.isArray(currentItem.correct_answer)
    ) {
      // For WORD_ORDER, the correct answer is a sequence of words.
      // The 'text' here would be the concatenated string of correct words.
      return (
        currentItem.correct_answer
          .map(id => currentItem.options?.find(opt => opt.id === id)?.text)
          .filter(Boolean) // Remove undefined if any id not found (should not happen)
          .join(' ') || null
      );
    }
    return null;
  }, [currentItem, showAnswerFeedback]);

  const renderContentItem = () => {
    if (!currentItem)
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>
            Hết nội dung hoặc đang tải...
          </Text>
        </View>
      );

    switch (currentItem.content_type) {
      case 'voice': // VOICE_INPUT from new data
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
            <TouchableOpacity
              onPress={() => playSound(currentItem.audio_url)}
              style={styles.contentCard2} // Reusing old style for large audio button container
            >
              <Image
                source={require('../../assets/images/iconAmThanh.png')}
                style={styles.AudioIcon} // Large audio icon
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recordButtonContainer} // Reusing old style for mic button container
              onPress={() =>
                Alert.alert('Ghi âm', 'Chức năng ghi âm (chưa triển khai).')
              }>
              <Image
                source={require('../../assets/images/micro.png')}
                style={styles.recordIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {/* "Bỏ qua" button for voice is handled by the main footer logic */}
          </View>
        );
      //MULTIPLE_CHOICE_VOCAB_IMAGE
      case 'select_image':
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              <View style={styles.questionSelectContainer}>
                {currentItem.audio_url && ( // Audio for the main question/prompt e.g. "Quả táo"
                  <TouchableOpacity
                    onPress={() => playSound(currentItem.audio_url)}
                    style={styles.questionAudioButtonSelect}>
                    <Image
                      source={require('../../assets/images/audioInconten.png')} // Use your audio icon
                      style={styles.audioIconSmall}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.contentDetailSelect}>
                  {currentItem.title || 'Chọn hình ảnh đúng'}
                  {currentItem.content_detail
                    ? `: "${currentItem.content_detail}"`
                    : ''}
                </Text>
              </View>
            </View>
            {/* MULTIPLE_CHOICE_VOCAB_IMAGE */}
            <View style={styles.imageOptionsContainer}>
              {currentItem.options?.map(option => {
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
                        styles.selectedImageOption, // Style when selected by user, before check
                      showAnswerFeedback === true &&
                        isCorrectOption &&
                        styles.correctImageOption, // Style for correct option when answer is correct
                      showAnswerFeedback === false &&
                        isSelected &&
                        styles.incorrectImageOption, // Style for selected incorrect option
                      showAnswerFeedback === false &&
                        isCorrectOption &&
                        styles.correctImageOption, // Highlight correct one if user was wrong
                    ]}
                    onPress={() => {
                      handleOptionSelect(option.id);
                      if (option.audioUrl !== undefined) {
                        playSound(option.audioUrl); // audioUrl sẽ luôn là string hoặc null ở đây
                      }
                    }}
                    disabled={showAnswerFeedback !== null}>
                    {option.imageUrl && (
                      <Image
                        source={{uri: option.imageUrl}}
                        style={styles.optionImage}
                        resizeMode="cover" // or "contain"
                      />
                    )}
                    <View style={styles.optionImageTextContainer_NEW}>
                      <Text style={styles.optionImageTextForeign_NEW}>
                        {option.text.split('\n')[0]}
                      </Text>
                      {option.text.split('\n')[1] && (
                        <Text style={styles.optionImageTextRomaji_NEW}>
                          {option.text.split('\n')[1]}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'select': // MULTIPLE_CHOICE_TEXT_ONLY
      case 'audio_choice': // AUDIO_CHOICE - similar UI to select, main difference is primary audio prompt
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              <View style={styles.questionSelectContainer}>
                {currentItem.audio_url && ( // Main audio for the question
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
                  {/* For audio_choice, title is "Nghe và chọn...", content_detail is the native word like "Chó" */}
                  {/* For select, title is "Chọn nghĩa đúng...", content_detail is "Giáo viên" */}
                  {currentItem.title ||
                    (currentItem.content_type === 'audio_choice'
                      ? 'Nghe và chọn đáp án'
                      : 'Chọn đáp án đúng')}
                  {currentItem.content_type === 'select' &&
                  currentItem.content_detail
                    ? `: "${currentItem.content_detail}"`
                    : ''}
                </Text>
              </View>
            </View>
            <View style={styles.optionsContainer}>
              {currentItem.options?.map(option => {
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
                        styles.correctOption, // Highlight correct one if user was wrong
                    ]}
                    onPress={() => {
                      handleOptionSelect(option.id);
                      if (option.audioUrl) {
                        playSound(option.audioUrl); // Phát âm thanh ngay khi chọn tùy chọn
                      }
                    }}
                    disabled={showAnswerFeedback !== null}>
                    {/* Optional: Audio for each text choice if available */}
                    <Text
                      style={[
                        styles.optionText,
                        showAnswerFeedback === true &&
                          isCorrectOption &&
                          styles.correctOptionText,
                        showAnswerFeedback === false &&
                          isSelected &&
                          styles.incorrectOptionText,
                        showAnswerFeedback === false &&
                          isCorrectOption &&
                          styles.correctOptionText,
                      ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 'sapXep': // WORD_ORDER
        return (
          <View style={styles.contentCard}>
            <View style={styles.contentCardQuestion}>
              {currentItem.title && (
                <Text style={styles.contentTitleSelect}>
                  {currentItem.title}
                </Text>
              )}
              <View style={styles.originalSentenceContainer}>
                {/* Audio for the sentence in target language (e.g., Japanese sentence) */}
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
                {/* Display the sentence in native language (e.g., Vietnamese) */}
                <Text style={styles.contentDetailXapXep}>
                  {currentItem.content_detail}
                </Text>
              </View>
            </View>

            <View style={styles.wordArrangeDropArea}>
              {arrangedWords.length > 0 ? (
                arrangedWords.map((word, index) => (
                  <TouchableOpacity
                    key={`${word.id}_arranged_${index}`}
                    style={[
                      styles.wordBankItem, // Re-use word bank style for consistency
                      styles.arrangedWordItem, // Specific style for arranged words
                      showAnswerFeedback !== null && // Apply color after check
                        (Array.isArray(currentItem.correct_answer) &&
                        currentItem.correct_answer[index] === word.id
                          ? styles.correctWordBackground // If this word is in correct position
                          : styles.incorrectWordBackground), // If not (or if overall answer is wrong)
                    ]}
                    onPress={() => handleArrangedWordPress(word)}
                    disabled={showAnswerFeedback !== null}>
                    <Text
                      style={[styles.wordBankText, styles.arrangedWordText]}>
                      {word.text}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.arrangedTextPlaceholder}>
                  ______________________________________
                </Text>
              )}
            </View>

            <View style={styles.wordBankContainer}>
              {currentItem.options?.map(wordOption => {
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
                      showAnswerFeedback !== null // Disable after check
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

      case 'audio': // Old 'audio' type, usually for just listening.
        // If this implies selection, it should be 'audio_choice'.
        // This case assumes it's purely for listening, similar to a part of 'voice'.
        return (
          <View style={styles.contentCard}>
            {currentItem.title && (
              <Text style={styles.contentTitleAudio}>{currentItem.title}</Text>
            )}
            {currentItem.image_url && ( // If there's an image associated with the audio
              <Image
                source={{uri: currentItem.image_url}}
                style={styles.contentImage} // Style for a central image
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
            {/* "Bỏ qua" button handled by footer logic */}
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

  if (
    !currentItem &&
    !showSummaryScreen &&
    itemsForThisLesson.length === 0 &&
    !startTime
  ) {
    // Initial state, before data is processed or if no data
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        {/* Header can be shown even on error/empty screen for navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            <ProgressBar current={0} total={0} />
          </View>
        </View>
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>
            Đang tải nội dung bài học...
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
            totalQuestions={totalItems}
            timeTaken={formatTimeTaken()}
            onComplete={() => navigation.goBack()} // Changed from handleContinue to goBack directly
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }
  // Fallback for when currentItem is not yet available but summary is not shown
  // This can happen during the brief moment itemsForThisLesson is populated but currentIndex is 0 and currentItem isn't set
  if (!currentItem && !showSummaryScreen) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.progressWrapper}>
            <ProgressBar current={currentIndex + 1} total={totalItems} />
          </View>
        </View>
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>
            Không có nội dung cho bài học này hoặc đã hoàn thành.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonError}>
            <Text style={styles.backButtonTextError}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const feedbackCorrectAnswerText = getCorrectAnswerTextForFeedback();

  const shouldShowCheckButton =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice' ||
      currentItem?.content_type === 'sapXep') &&
    showAnswerFeedback === null &&
    currentItem.options &&
    currentItem.options.length > 0 && // Only if there are options to choose from
    (((currentItem.content_type === 'select' ||
      currentItem.content_type === 'select_image' ||
      currentItem.content_type === 'audio_choice') &&
      userSelectedOptionId) ||
      (currentItem.content_type === 'sapXep' && arrangedWords.length > 0));

  const shouldShowNewFeedbackUi =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice' ||
      currentItem?.content_type === 'sapXep') &&
    showAnswerFeedback !== null;

  const isNonInteractiveType =
    currentItem?.content_type === 'voice' ||
    currentItem?.content_type === 'audio';
  const nonInteractiveAndNoOptions =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice' ||
      currentItem?.content_type === 'sapXep') &&
    (!currentItem.options || currentItem.options.length === 0);

  const shouldShowOriginalContinueOrSkip =
    !shouldShowCheckButton &&
    !shouldShowNewFeedbackUi &&
    (isNonInteractiveType || nonInteractiveAndNoOptions);

  const isContinueButtonDisabled =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'select_image' ||
      currentItem?.content_type === 'audio_choice') &&
    !userSelectedOptionId &&
    showAnswerFeedback === null &&
    currentItem.options &&
    currentItem.options.length > 0; // Disable only if options exist and none selected

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
              <ProgressBar current={currentIndex + 1} total={totalItems} />
            </View>
          </View>

          <ScrollView
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
            key={`content_scroll_${currentIndex}_${showAnswerFeedback}`}>
            {renderContentItem()}
          </ScrollView>

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

            {shouldShowNewFeedbackUi && (
              <View style={styles.feedback_Container_NEW}>
                <View style={styles.feedback_TextAudioWrapper_NEW}>
                  <View style={styles.feedback_TextContainer_NEW}>
                    {feedbackCorrectAnswerText && (
                      <Text
                        style={styles.feedback_CorrectAnswerText_NEW}
                        numberOfLines={2} // Allow more lines for correct answer text
                      >
                        {feedbackCorrectAnswerText}
                      </Text>
                    )}
                  </View>
                  {/* Audio for correct answer from choice, or main audio of question if choice has no audio */}
                  {(currentItem.options?.find(
                    opt => opt.id === currentItem.correct_answer,
                  )?.audioUrl ||
                    currentItem.audio_url) && (
                    <TouchableOpacity
                      onPress={() =>
                        playSound(
                          currentItem.options?.find(
                            opt => opt.id === currentItem.correct_answer,
                          )?.audioUrl || currentItem.audio_url,
                        )
                      }
                      style={styles.feedback_AudioButton_NEW}>
                      <Image
                        source={require('../../assets/images/amThanhTiepTuc.png')}
                        style={styles.feedback_AudioIcon_NEW}
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
            {/* Logic for Skip/Continue button (non-checking types or before selection) */}
            {shouldShowOriginalContinueOrSkip && (
              <TouchableOpacity
                style={[
                  isNonInteractiveType
                    ? styles.skipButton
                    : styles.continueButton, // Style as skip for voice/audio
                  isContinueButtonDisabled && styles.disabledButtonFooter,
                ]}
                onPress={handleContinue}
                disabled={isContinueButtonDisabled && !isNonInteractiveType} // Only disable if it's a selection type and no selection made
              >
                <Text style={styles.footerButtonText}>
                  {isNonInteractiveType ? 'Bỏ qua' : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>
            )}
            {/* Fallback Continue button if no other button is shown (e.g. select type with no options, or before selection on an answerable Q) */}
            {!shouldShowCheckButton &&
              !shouldShowNewFeedbackUi &&
              !shouldShowOriginalContinueOrSkip && (
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isContinueButtonDisabled && styles.disabledButtonFooter,
                  ]}
                  onPress={handleContinue}
                  disabled={isContinueButtonDisabled}>
                  <Text style={styles.footerButtonText}>Tiếp tục</Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.75,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20, // Adjusted for Android StatusBar
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  backButton: {paddingHorizontal: SIZES.padding * 0.5},
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5, // Keep as per old style
    color: COLORS.darkGray,
    fontWeight: '600', // Keep as per old style
    marginBottom: 10, // Keep as per old style
  },
  progressWrapper: {flex: 1, marginHorizontal: SIZES.base},
  progressBarContainer: {
    height: 20, // Keep as per old style
    backgroundColor: COLORS.white, // Keep as per old style
    borderRadius: SIZES.radius, // Keep as per old style
    justifyContent: 'center', // Keep as per old style
    shadowColor: COLORS.black, // Keep as per old style
    shadowOffset: {width: 0, height: 2}, // Keep as per old style
    shadowOpacity: 0.1, // Keep as per old style
    shadowRadius: 10, // Keep as per old style
    elevation: 10, // Keep as per old style
  },
  progressBarFill: {
    height: '80%', // Keep as per old style
    backgroundColor: COLORS.primary || '#4CAF50', // Keep as per old style
    borderRadius: SIZES.radius, // Keep as per old style
    position: 'absolute', // Keep as per old style
  },
  contentScrollArea: {flex: 1},
  contentScrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160, // Increased padding for taller footer
  },
  contentCard: {
    // General card for each question type
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255,255,255,0.75)', // Slightly transparent white
    // elevation: 1, // Subtle shadow
  },
  contentCardQuestion: {
    // Container for the question text/prompt (retained from old style)
    backgroundColor: COLORS.nenItem || COLORS.white, // Use nenItem or fallback
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SIZES.padding, // Adjusted from 20
    padding: SIZES.padding, // Adjusted from 10
    // paddingTop: 20, // Removed, use padding
    // paddingBottom: 0, // Removed, use padding
  },
  contentTitle: {
    // Title for 'voice' type (retained)
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2, // Adjusted from xxLarge
    color: COLORS.text,
    marginBottom: SIZES.margin, // Adjusted from margin * 1.5
    textAlign: 'center',
    fontWeight: 'bold', // explicit bold
  },
  voiceContentDetailText: {
    // New style for content_detail in voice type
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  AudioIcon: {
    // Large audio icon for 'voice' type (retained)
    width: 120, // Adjusted from 150
    height: 120, // Adjusted from 150
    tintColor: COLORS.primary, // Added tint
  },
  recordIcon: {
    // Mic icon for 'voice' type (retained)
    width: 50, // Adjusted from 60
    height: 50, // Adjusted from 60
    tintColor: COLORS.red, // Added tint
  },
  contentCard2: {
    // Container for large audio button in 'voice' (retained) - might need rename for clarity
    alignItems: 'center',
    alignSelf: 'center',
    padding: SIZES.base,
    // marginTop: SIZES.padding, // Removed, handled by parent or specific layout
    // borderRadius: SIZES.radius, // Removed, icon itself has no border
    // paddingTop: 90, // Removed, direct layout
  },
  recordButtonContainer: {
    // New container for mic button for better spacing
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SIZES.base,
    padding: SIZES.base,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 50, // Circular background
  },
  // Styles for 'select_image' (MULTIPLE_CHOICE_VOCAB_IMAGE)
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
    width: '70%', // Image takes up most of the button
    height: '70%', // Adjust height as needed, or use aspectRatio on Image
    // borderRadius: SIZES.radius / 2, // Optional: rounded corners for image itself
    marginBottom: 20,
    borderRadius: SIZES.radius / 2,
  },
  optionImageTextContainer_NEW: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    alignItems: 'center',
    paddingVertical: SIZES.base / 2,
    backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent background for text
    borderRadius: SIZES.radius / 2,
  },
  optionImageTextForeign_NEW: {
    // Text below image
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.font * 1,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: 'bold', // explicit bold
  },
  optionImageTextRomaji_NEW: {
    // Romaji text below image
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.8,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  imageOptionAudioButton_NEW: {
    display: 'none',
  },
  imageOptionAudioIcon_NEW: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
  },
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

  // Styles for 'select' and 'audio_choice' (retained and adapted)
  questionSelectContainer: {
    // Container for audio icon + question text (retained)
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 0, // Removed, handled by parent
  },
  questionAudioButtonSelect: {
    // Touchable for audio icon (retained)
    // flexDirection: 'row', // Already row by parent
    // alignItems: 'center', // Already centered by parent
    // alignSelf: 'flex-start', // Let parent control alignment
    marginRight: SIZES.base, // Spacing from text (adjusted from 0)
    // borderRadius: SIZES.radius, // Icon itself has no border
    // marginLeft: 10, // Removed, use marginRight
    // marginBottom: 30, // Removed, layout handled by parent
  },
  audioIconSmall: {
    // Small audio icon (retained)
    width: 30, // Adjusted from 35
    height: 30, // Adjusted from 35
    // marginRight: 10, // Removed, use parent's marginRight
  },
  contentDetailSelect: {
    // Main question text for select/audio_choice (retained)
    fontFamily: FONTS.bold?.fontFamily || 'System', // Made bold for emphasis
    fontSize: SIZES.h3, // Adjusted from font * 1.05
    color: COLORS.text,
    // lineHeight: SIZES.font * 1.6, // Use SIZES.h3 line height or remove
    // marginBottom: SIZES.padding, // Removed, use parent's padding
    textAlign: 'left', // Keep left aligned with icon
    // fontWeight: '900', // Removed, use fontFamily bold
    // paddingBottom: 20, // Removed, use parent's padding
    flex: 1, // Allow text to take available space
  },
  optionsContainer: {marginTop: SIZES.padding}, // (retained)
  optionButton: {
    // General style for a text option button (retained)
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.9, // Adjusted from 0.7
    borderRadius: SIZES.radius, // Adjusted from 10
    marginVertical: SIZES.base * 0.6, // Adjusted from margin + marginBottom
    // elevation: 2, // Adjusted from 5
    borderWidth: 1, // Adjusted from 0.5
    borderColor: COLORS.lightGray, // Default border
    minHeight: 50, // Ensure decent touchable area
    flexDirection: 'row', // For optional audio icon inside
    alignItems: 'center',
    justifyContent: 'center', // Center text if no icon
  },
  optionTextAudioButton_NEW: {
    // For audio icon inside text option
    marginRight: SIZES.base,
  },
  optionTextAudioIcon_NEW: {
    width: 20,
    height: 20,
  },
  optionText: {
    // Text inside option button (retained)
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'center', // Center text in button
    flexShrink: 1, // Allow text to shrink if too long with icon
    // paddingTop: 5, // Removed, use paddingVertical on button
  },
  selectedOption: {
    // Style for selected option (retained)
    borderColor: COLORS.primary,
    borderWidth: 2, // Emphasize selection
    backgroundColor: COLORS.lightPrimary || 'rgba(0,122,255,0.1)',
  },
  correctOption: {
    // Style for correct option (retained)
    backgroundColor: COLORS.lightGreen || 'rgba(40,167,69,0.15)',
    borderColor: COLORS.green || '#28A745',
    borderWidth: 2,
  },
  correctOptionText: {color: COLORS.darkGreen || '#155724', fontWeight: 'bold'}, // (retained)
  incorrectOption: {
    // Style for incorrect option (retained)
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
    borderWidth: 2,
  },
  incorrectOptionText: {color: COLORS.darkRed || '#721C24', fontWeight: 'bold'}, // (retained)

  // Styles for 'sapXep' (WORD_ORDER) (retained and adapted)
  contentTitleSelect: {
    // Title for sapXep (retained, but used for question prompt)
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3, // Adjusted from xLarge
    color: COLORS.text, // Adjusted from black
    marginBottom: SIZES.base, // Adjusted from 0
    textAlign: 'left',
    fontWeight: 'bold', // explicit bold
    // marginLeft: 15, // Removed, use parent padding
  },
  originalSentenceContainer: {
    // Container for native sentence + audio (retained)
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base, // Adjusted from padding
    // paddingVertical: SIZES.padding * 0.5, // Use parent padding
    // paddingHorizontal: SIZES.padding, // Use parent padding
  },
  questionAudioButton: {
    // Audio button for sapXep sentence (retained)
    // flexDirection: 'row', // Already row from parent
    // alignItems: 'center', // Already centered from parent
    // alignSelf: 'flex-start', // Let parent control
    // paddingVertical: SIZES.base, // Use direct margin/padding
    marginRight: SIZES.base,
    // marginBottom: SIZES.margin, // Handled by parent
  },
  contentDetailXapXep: {
    // Native language sentence text (retained)
    fontFamily:
      FONTS.medium?.fontFamily || FONTS.medium?.fontFamily || 'System', // Italic if available
    fontSize: SIZES.font * 1.1, // Adjusted
    color: COLORS.textSecondary, // Differentiate from question prompt
    flex: 1,
    lineHeight: SIZES.font * 1.5, // Adjusted
    // marginBottom: 18, // Use parent margin
    // fontWeight: '700', // Use fontFamily
  },
  wordArrangeDropArea: {
    // Drop area for arranged words (retained)
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 70, // Adjusted from 60
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, // Adjusted from radiusLG
    padding: SIZES.base, // Adjusted from padding * 0.75
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'flex-start', // Keep words at top
  },
  arrangedTextPlaceholder: {
    // Placeholder text in drop area (retained)
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    flex: 1,
    textAlign: 'center',
    lineHeight: 50, // Approximate height of a word item for better placeholder feel
  },
  arrangedWordItem: {
    // Style for a word placed in the drop area (retained)
    backgroundColor: COLORS.primary || '#28a745', // Retained
    // paddingHorizontal, paddingVertical, borderRadius, margin are inherited from wordBankItem if not overridden
    // No specific overrides here, relies on wordBankItem styles
  },
  wordBankContainer: {
    // Container for draggable words (retained)
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the words in the bank
    marginTop: SIZES.padding * 0.5,
    // paddingHorizontal: SIZES.padding * 0.5, // Use parent padding or adjust as needed
    minHeight: 60,
  },
  wordBankItem: {
    // Style for a single word in the bank (retained)
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding * 0.8, // Adjusted
    paddingVertical: SIZES.padding * 0.6, // Adjusted
    borderRadius: SIZES.radius, // Adjusted from 10
    margin: SIZES.base * 0.4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2}, // Adjusted
    shadowOpacity: 0.1, // Adjusted
    shadowRadius: 3, // Adjusted
    elevation: 3, // Adjusted
  },
  wordBankText: {
    // Text inside a word bank item (retained)
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  arrangedWordText: {color: COLORS.white, fontWeight: '500'}, // (retained)
  wordBankItemSelectedAndUsed: {
    // Word from bank that's been used (retained)
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
    opacity: 0.3,
  },
  disabledWordBankItem: {opacity: 0.3}, // (retained)
  correctWordBackground: {
    // Background for correctly placed word (retained)
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
  },
  incorrectWordBackground: {
    // Background for incorrectly placed word (retained)
    backgroundColor: COLORS.red,
    borderColor: COLORS.darkRed,
  },

  // Styles for 'audio' type (old, for listening only)
  contentTitleAudio: {
    // (retained)
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3, // Adjusted
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: '600',
  },
  contentImage: {
    // Central image for audio type (retained)
    width: '80%', // Adjusted
    height: undefined,
    aspectRatio: 1, // Make it square or adjust as needed
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    alignSelf: 'center',
  },
  contentDetailAudio: {
    // Detail text for audio type (retained)
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font, // Adjusted
    color: COLORS.textSecondary || COLORS.darkGray,
    lineHeight: SIZES.font * 1.5, // Adjusted
    marginBottom: SIZES.padding, // Adjusted
    textAlign: 'center', // Center if it's a general description
  },
  audioPlayerPlaceholder: {
    // Container for play button (retained)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the button
    backgroundColor: COLORS.lightGray2,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    marginTop: SIZES.margin,
  },
  // audioIconBig: { // Large play icon - replaced by image (retained if using text icon)
  //   fontSize: SIZES.h1 * 1.5,
  //   color: COLORS.primary,
  //   marginRight: SIZES.base,
  // },

  // Fallback and Error styles (retained)
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
  errorContainer: {
    // For initial loading or error state
    flex: 1,
    // justifyContent: 'center', // Let header be at top
    // alignItems: 'center', // Let header be at top
    // padding: SIZES.padding, // Handled by header and content container
    backgroundColor: COLORS.background || COLORS.white,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.error || COLORS.red,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  backButtonError: {
    // Button on error screen to go back
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

  // Footer styles (retained and adapted)
  footer: {
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    paddingBottom:
      Platform.OS === 'ios'
        ? SIZES.padding * 1.5 + 20
        : SIZES.padding * 1.2 + 10, // Added a bit more for notch/home bar
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
    backgroundColor: COLORS.white, // Default footer background
    flexDirection: 'row',
    alignItems: 'center',
    // position: 'absolute', // Removed to allow ScrollView to push it down
    // bottom: 0, // Removed
    // left: 0, // Removed
    // right: 0, // Removed
    justifyContent: 'center',
    minHeight: 70, // Ensure footer has some height
  },
  checkButton: {
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  continueButton: {
    backgroundColor: COLORS.primary || '#4CAF50', // Changed from green to primary for consistency
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  skipButton: {
    // Retained from old for 'voice' type
    backgroundColor: COLORS.gray, // Changed from #ccc
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  disabledButtonFooter: {backgroundColor: COLORS.lightGray},
  footerButtonText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.font * 1.1,
    fontWeight: 'bold',
  },
  // New Footer Feedback styles (retained)
  footer_CorrectBackground_NEW: {
    backgroundColor: COLORS.green || '#D4EDDA', // Lighter green for background
    borderTopColor: COLORS.green,
  },
  footer_IncorrectBackground_NEW: {
    backgroundColor: COLORS.deeperRed || '#F8D7DA', // Lighter red for background
    borderTopColor: COLORS.deeperRed,
  },
  feedback_Container_NEW: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between', // Use space-between
    width: '100%',
    flex: 1,
    paddingVertical: SIZES.base, // Reduced padding
    paddingHorizontal: SIZES.padding * 0.5,
    minHeight: 100, // Adjusted from 160, can be dynamic
    // borderTopLeftRadius: 20, // Removed, apply to parent footer if needed
    // borderTopRightRadius: 20, // Removed
  },
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
  },
  feedback_ResultText_NEW: {
    // "Tuyệt vời!" or "Cố gắng..."
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.xxLarge, // Made larger
    // color: COLORS.white, // Color will depend on correct/incorrect background
    fontWeight: 'bold',
    textAlign: 'center', // Align with audio button
    marginLeft: 40, // Added margin for spacing
  },
  feedback_CorrectAnswerText_NEW: {
    // "Đáp án: ..."
    marginTop: SIZES.base * 0.5, // Reduced margin
    marginBottom: 20,
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.xLarge, // Adjusted size
    // color: COLORS.white, // Color will depend on background
    opacity: 0.9,

    fontWeight: '700',
    textAlign: 'center',
    paddingLeft: 40, // Added padding for spacing
    color: COLORS.white,
  },
  feedback_AudioButton_NEW: {
    padding: SIZES.base * 0.5, // Slightly larger touch area
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: subtle background for tap feedback
    borderRadius: 20,
  },
  feedback_AudioIcon_NEW: {
    width: 28,
    height: 28,
    // tintColor: COLORS.white, // Tint will depend on background
  },
  feedback_ContinueButton_NEW: {
    backgroundColor: COLORS.white, // White button
    paddingVertical: SIZES.padding * 0.8, // Adjusted
    paddingHorizontal: SIZES.padding * 2.5, // Adjusted
    borderRadius: SIZES.radius * 2, // Adjusted
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%', // Adjusted
    alignSelf: 'center',
    marginTop: SIZES.base, // Add some margin from text
    minHeight: 40, // Adjusted
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    // Add border to white button for better visibility on light feedback BG
    // borderColor will be dynamic
  },
  feedback_ContinueButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    textAlign: 'center',
    fontSize: SIZES.medium, // Adjusted
    fontWeight: 'bold',
    // Color set dynamically
  },
});

// Summary Screen Styles (Copied from old, ensure SIZES, FONTS, COLORS are consistent)
const summaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.white, // Fallback if ImageBackground fails
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
  iconText: {
    // This name is a bit generic, ensure it's the image style for summary icons
    width: SIZES.h2, // Assuming it's an icon size
    height: SIZES.h2, // Assuming it's an icon size
    marginRight: SIZES.base,
    tintColor: COLORS.primary, // If it's a tintable icon
    // fontSize: SIZES.h2, // Remove if it's for Image, not Text
    // color: COLORS.primary, // Remove if it's for Image
  },
  text: {
    // Text within summary cards
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.textSecondary || COLORS.darkGray,
  },
  completeButton: {
    backgroundColor: COLORS.green,
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
});

export default ContentsScreen;
