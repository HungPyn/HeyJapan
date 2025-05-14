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
import {Colors} from 'react-native/Libraries/NewAppScreen'; // Giữ lại

// --- BEGIN DATA INTERFACES AND MOCK DATA (FROM YOUR ORIGINAL CODE) ---
interface Option {
  id: string;
  text: string;
}
interface LessonContentItem {
  content_code: number;
  content_type: 'audio' | 'voice' | 'select' | 'sapXep' | string;
  title: string | null;
  content_detail: string;
  audio_url: string | null;
  image_url: string | null;
  display_order: number;
  lesson_code: number;
  skill_code: {skill_code: number; skill_name: string};
  options?: Option[];
  correct_answer?: string | string[];
  user_answer?: string | string[];
}

const allLessonContents: LessonContentItem[] = [
  // {
  //   content_code: 3,
  //   content_type: 'voice',
  //   title: 'Luyện phát âm: あ, い, う',
  //   content_detail: 'Ghi âm và luyện phát âm...',
  //   audio_url: null,
  //   image_url: 'https://i.imgur.com/R8WeIEv.jpeg',
  //   display_order: 1,
  //   lesson_code: 12,
  //   skill_code: {skill_code: 2, skill_name: 'Nói'},
  // },
  {
    content_code: 5,
    content_type: 'select',
    title: "こんにちは'",
    content_detail: 'こんにちは (Konnichiwa)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 2,
    lesson_code: 12,
    skill_code: {skill_code: 3, skill_name: 'Đọc'},
    options: [
      {id: 'a', text: 'Chào buổi sáng'},
      {id: 'b', text: 'Tạm biệt'},
      {id: 'c', text: 'Xin chào (ban ngày/chiều)'},
      {id: 'd', text: 'Cảm ơn'},
    ],
    correct_answer: 'c',
  },
  {
    content_code: 1,
    content_type: 'sapXep',
    title: 'Sắp xếp từ thành nghĩa của câu dưới đây: ',
    content_detail: 'こんにちは、お父さん',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 5, // Sửa display_order để đảm bảo thứ tự đúng
    lesson_code: 12,
    skill_code: {skill_code: 4, skill_name: 'Viết'},
    options: [
      {id: 'v1', text: 'xin chào'},
      {id: 'v2', text: 'chào buổi sáng'},
      {id: 'v3', text: 'bố'},
      {id: 'v4', text: 'mẹ'},
    ],
    correct_answer: ['v1', 'v3'],
  },
  {
    content_code: 6,
    content_type: 'select',
    title: 'おはようございます',
    content_detail: 'おはようございます (Ohayou gozaimasu)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 1,
    lesson_code: 12,
    skill_code: {skill_code: 2, skill_name: 'Nghe'},
    options: [
      {id: 'a', text: 'Chúc ngủ ngon'},
      {id: 'b', text: 'Xin chào (buổi sáng)'},
      {id: 'c', text: 'Cảm ơn'},
      {id: 'd', text: 'Xin lỗi'},
    ],
    correct_answer: 'b',
  },
  {
    content_code: 2,
    content_type: 'sapXep',
    title: 'Sắp xếp từ thành nghĩa của câu dưới đây: ',
    content_detail: 'お元気ですか？',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 3,
    lesson_code: 12,
    skill_code: {skill_code: 1, skill_name: 'Đọc'},
    options: [
      {id: 'v1', text: 'Tôi khỏe'},
      {id: 'v2', text: 'Cảm ơn'},
      {id: 'v3', text: 'Bạn khỏe không?'},
      {id: 'v4', text: 'Xin chào'},
    ],
    correct_answer: ['v3', 'v1'],
  },
  {
    content_code: 7,
    content_type: 'select',
    title: 'こんばんは',
    content_detail: 'こんばんは (Konbanwa)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 4,
    lesson_code: 12,
    skill_code: {skill_code: 3, skill_name: 'Đọc'},
    options: [
      {id: 'a', text: 'Chào buổi sáng'},
      {id: 'b', text: 'Chào buổi tối'},
      {id: 'c', text: 'Chúc ngủ ngon'},
      {id: 'd', text: 'Cảm ơn'},
    ],
    correct_answer: 'b',
  },
  {
    content_code: 3,
    content_type: 'sapXep',
    title: 'Sắp xếp từ thành nghĩa của câu dưới đây: ',
    content_detail: 'おやすみなさい',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 6,
    lesson_code: 12,
    skill_code: {skill_code: 4, skill_name: 'Viết'},
    options: [
      {id: 'v1', text: 'Chúc ngủ ngon'},
      {id: 'v2', text: 'Xin chào'},
      {id: 'v3', text: 'Cảm ơn'},
      {id: 'v4', text: 'Tạm biệt'},
    ],
    correct_answer: ['v1'],
  },
];
// --- END DATA (FROM YOUR ORIGINAL CODE) ---

type ContentsScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsScreen'
>;
type ContentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// ProgressBar component (FROM YOUR ORIGINAL CODE)
const ProgressBar = ({current, total}: {current: number; total: number}) => {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
    </View>
  );
};

// LessonSummaryScreen component (FROM YOUR ORIGINAL CODE)
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
  const summaryStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SIZES.padding * 2,
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
    iconText: {
      fontSize: SIZES.h2,
      marginRight: SIZES.base,
      color: COLORS.primary,
    },
    text: {
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
        style={summaryStyles.completeButton}
        onPress={onComplete}>
        <Text style={summaryStyles.completeButtonText}>Hoàn thành</Text>
      </TouchableOpacity>
    </View>
  );
};
// --- END SUMMARY SCREEN COMPONENT ---

const ContentsScreen: React.FC = () => {
  const route = useRoute<ContentsScreenRouteProp>();
  const navigation = useNavigation<ContentsScreenNavigationProp>();

  const lessonCodeFromParam = route.params?.lessonCode;
  // const lessonNameFromParam = route.params?.lessonName || 'Bài học'; // Biến này không được sử dụng trong logic gốc
  const currentLessonCode = parseInt(lessonCodeFromParam || '0', 10);

  const itemsForThisLesson = useMemo(() => {
    return allLessonContents
      .filter(content => content.lesson_code === currentLessonCode)
      .sort((a, b) => a.display_order - b.display_order);
  }, [currentLessonCode]);

  // State variables (FROM YOUR ORIGINAL CODE)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelectedOptionId, setUserSelectedOptionId] = useState<
    string | null
  >(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean | null>(
    null,
  ); // Giữ nguyên
  const [arrangedWords, setArrangedWords] = useState<Option[]>([]);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const currentItem = itemsForThisLesson[currentIndex];
  const totalItems = itemsForThisLesson.length;

  // useEffects (FROM YOUR ORIGINAL CODE)
  useEffect(() => {
    if (itemsForThisLesson.length > 0 && !startTime) {
      setStartTime(new Date());
      setCorrectAnswersCount(0);
      setShowSummaryScreen(false);
    }
  }, [itemsForThisLesson, startTime, currentLessonCode]);

  useEffect(() => {
    setUserSelectedOptionId(null);
    setShowAnswerFeedback(null);
    // if (currentItem && currentItem.content_type === 'sapXep') { // Logic này đã có trong code gốc
    //   setArrangedWords([]);
    // }
    // Code gốc của bạn có vẻ reset arrangedWords cho mọi loại câu hỏi khi currentIndex thay đổi
    // hoặc chỉ cho 'sapXep' tùy thuộc vào currentItem. Để an toàn, tôi sẽ reset chung.
    setArrangedWords([]);
  }, [currentIndex]); // Chỉ phụ thuộc currentIndex theo code gốc của bạn (hoặc currentItem nếu logic gốc khác)

  // Helper functions (FROM YOUR ORIGINAL CODE)
  const playSound = (audioUrl: string | null) => {
    if (audioUrl)
      Alert.alert('Phát âm thanh (Placeholder)', `Đang phát: ${audioUrl}`);
  };

  const handleOptionSelect = (optionId: string) => {
    if (showAnswerFeedback === null) setUserSelectedOptionId(optionId);
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

  // handleCheckAnswer (FROM YOUR ORIGINAL CODE)
  const handleCheckAnswer = () => {
    if (!currentItem) return;
    let isCorrect = false;
    if (currentItem.content_type === 'select') {
      if (!userSelectedOptionId) {
        Alert.alert('Thông báo', 'Bạn vui lòng chọn một đáp án.');
        return;
      }
      isCorrect = userSelectedOptionId === currentItem.correct_answer;
    } else if (currentItem.content_type === 'sapXep') {
      if (
        arrangedWords.length === 0 &&
        (currentItem.options?.length || 0) > 0
      ) {
        Alert.alert('Thông báo', 'Bạn chưa sắp xếp từ nào.');
        return;
      }
      const userAnswerIds = arrangedWords.map(word => word.id);
      const correctAnswerIds = currentItem.correct_answer;
      if (
        Array.isArray(correctAnswerIds) &&
        userAnswerIds.length === correctAnswerIds.length && // Kiểm tra độ dài
        userAnswerIds.every((val, index) => val === correctAnswerIds[index]) // Kiểm tra thứ tự
      ) {
        isCorrect = true;
      } else {
        isCorrect = false;
      }
    }
    // Cập nhật showAnswerFeedback dựa trên isCorrect
    setShowAnswerFeedback(isCorrect); // Logic gốc của bạn set ở đây
    // Tăng điểm nếu đúng (logic gốc của bạn)
    if (isCorrect) {
      // Code gốc của bạn tăng điểm sau khi set showAnswerFeedback
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  // handleContinue (FROM YOUR ORIGINAL CODE)
  const handleContinue = () => {
    if (showSummaryScreen) {
      navigation.goBack();
      return;
    }

    if (
      (currentItem?.content_type === 'select' ||
        currentItem?.content_type === 'sapXep') &&
      showAnswerFeedback === null &&
      currentItem.options && // Đảm bảo có options mới check
      ((currentItem.content_type === 'select' && userSelectedOptionId) ||
        (currentItem.content_type === 'sapXep' && arrangedWords.length > 0))
    ) {
      Alert.alert('Thông báo', "Bạn cần nhấn 'Kiểm tra' trước khi tiếp tục!");
      return;
    }

    const isLastItem = currentIndex >= totalItems - 1;

    if (isLastItem) {
      if (
        (currentItem?.content_type === 'select' &&
          showAnswerFeedback !== null) ||
        (currentItem?.content_type === 'sapXep' &&
          showAnswerFeedback !== null) ||
        currentItem?.content_type === 'voice' ||
        currentItem?.content_type === 'audio'
      ) {
        setEndTime(new Date());
        setShowSummaryScreen(true);
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

  // Hàm helper mới để lấy text đáp án đúng (cần thiết cho UI mới)
  const getCorrectAnswerText = useCallback(() => {
    if (
      !currentItem ||
      showAnswerFeedback === true ||
      showAnswerFeedback === null
    )
      return null;

    if (
      currentItem.content_type === 'select' &&
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
      return (
        currentItem.correct_answer
          .map(id => currentItem.options?.find(opt => opt.id === id)?.text)
          .filter(Boolean)
          .join(' ') || null
      );
    }
    return null;
  }, [currentItem, showAnswerFeedback]);

  // renderContentItem (EXACTLY FROM YOUR ORIGINAL CODE)
  const renderContentItem = () => {
    if (!currentItem)
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>Hết nội dung.</Text>
        </View>
      );

    switch (currentItem.content_type) {
      case 'voice':
        return (
          <View style={styles.contentCard}>
            <Text style={styles.contentTitle}>Nói lại từ(câu) dưới đây:</Text>
            <TouchableOpacity
              onPress={() => playSound(currentItem.audio_url)}
              style={styles.contentCard2}>
              <Image
                source={require('../../assets/images/iconAmThanh.png')}
                style={styles.AudioIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contentCard2}
              onPress={() => Alert.alert('Ghi âm', 'Bắt đầu...')}>
              <Image
                source={require('../../assets/images/micro.png')}
                style={styles.recordIcon}
                resizeMode="contain"></Image>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleContinue} // Nút bỏ qua gốc cho voice
              style={styles.instructionButton}>
              <Text style={styles.instructionText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        );
      case 'select':
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
                  {currentItem.content_detail}
                </Text>
              </View>
            </View>
            <View style={styles.optionsContainer}>
              {currentItem.options?.map(option => {
                const isSelected = userSelectedOptionId === option.id;
                const isCorrectOption = Array.isArray(
                  currentItem.correct_answer,
                )
                  ? false
                  : currentItem.correct_answer === option.id;

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
                      // Hiển thị đáp án đúng khi user chọn sai (theo code gốc)
                      showAnswerFeedback === false &&
                        isCorrectOption &&
                        styles.correctOption,
                    ]}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={showAnswerFeedback !== null}>
                    <Text
                      style={[
                        styles.optionText,
                        showAnswerFeedback === true &&
                          isCorrectOption &&
                          styles.correctOptionText,
                        showAnswerFeedback === false &&
                          isSelected &&
                          styles.incorrectOptionText,
                        // Hiển thị đáp án đúng khi user chọn sai (theo code gốc)
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
                      styles.wordBankItem,
                      styles.arrangedWordItem,
                      showAnswerFeedback !== null &&
                        (Array.isArray(currentItem.correct_answer) &&
                        currentItem.correct_answer[index] === word.id
                          ? styles.correctWordBackground
                          : styles.incorrectWordBackground),
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
      case 'audio': // Logic render cho audio type (nếu có trong gốc)
        // Giả sử code gốc của bạn có phần này
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
                <Text style={styles.audioIconBig}>▶️</Text>
                <Text>Phát âm thanh</Text>
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
  // --- END renderContentItem (FROM YOUR ORIGINAL CODE) ---

  if (!lessonCodeFromParam || totalItems === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Không có nội dung cho bài học này.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
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
            onComplete={handleContinue}
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }

  const correctAnswerText = getCorrectAnswerText(); // Cần cho UI mới

  // Điều kiện để hiển thị các phần của footer (logic gốc)
  const shouldShowCheckButton =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'sapXep') &&
    showAnswerFeedback === null &&
    ((currentItem.content_type === 'select' && userSelectedOptionId) ||
      (currentItem.content_type === 'sapXep' &&
        arrangedWords.length > 0 &&
        (currentItem.options?.length || 0) > 0));

  // Điều kiện để hiển thị UI feedback MỚI
  const shouldShowNewFeedbackUi =
    (currentItem?.content_type === 'select' ||
      currentItem?.content_type === 'sapXep') &&
    showAnswerFeedback !== null;

  // Điều kiện để hiển thị nút Tiếp tục/Bỏ qua GỐC
  const shouldShowOriginalContinueOrSkip =
    !shouldShowCheckButton &&
    !shouldShowNewFeedbackUi &&
    (currentItem?.content_type === 'voice' ||
      currentItem?.content_type === 'audio' ||
      // Hoặc select/sapXep nhưng chưa chọn gì (showAnswerFeedback === null và không có selection)
      ((currentItem?.content_type === 'select' ||
        currentItem?.content_type === 'sapXep') &&
        showAnswerFeedback === null));
  const isOriginalContinueButtonDisabled =
    (currentItem?.content_type === 'select' &&
      !userSelectedOptionId &&
      showAnswerFeedback === null) ||
    (currentItem?.content_type === 'sapXep' &&
      arrangedWords.length === 0 &&
      showAnswerFeedback === null &&
      (currentItem.options?.length || 0) > 0);

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

          {/* --- FOOTER MODIFICATION STARTS HERE --- */}
          <View
            style={[
              styles.footer, // Style footer GỐC
              // Áp dụng màu nền MỚI nếu là select/sapXep và đã có feedback
              shouldShowNewFeedbackUi &&
                showAnswerFeedback === true &&
                styles.footer_CorrectBackground_NEW,
              shouldShowNewFeedbackUi &&
                showAnswerFeedback === false &&
                styles.footer_IncorrectBackground_NEW,
            ]}>
            {/* 1. Nút "Kiểm tra" (Logic và style GỐC) */}
            {shouldShowCheckButton && (
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckAnswer}>
                <Text style={styles.footerButtonText}>Kiểm tra</Text>
              </TouchableOpacity>
            )}

            {/* 2. Giao diện Feedback MỚI (chỉ cho select/sapXep sau khi check) */}
            {shouldShowNewFeedbackUi && (
              <View style={styles.feedback_Container_NEW}>
                <View style={styles.feedback_TextAudioWrapper_NEW}>
                  <View style={styles.feedback_TextContainer_NEW}>
                    <Text
                      style={styles.feedback_DetailText_NEW}
                      numberOfLines={1}>
                      {currentItem.content_detail}
                    </Text>
                    {correctAnswerText && ( // Hiển thị đáp án đúng nếu sai
                      <Text
                        style={styles.feedback_CorrectAnswerText_NEW}
                        numberOfLines={1}>
                        {correctAnswerText}
                      </Text>
                    )}
                  </View>
                  {currentItem.audio_url && ( // Nút loa
                    <TouchableOpacity
                      onPress={() => playSound(currentItem.audio_url)}
                      style={styles.feedback_AudioButton_NEW}>
                      <Image
                        source={require('../../assets/images/amThanhTiepTuc.png')} // Path ảnh gốc
                        style={styles.feedback_AudioIcon_NEW}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity // Nút "Tiếp tục" MỚI màu trắng
                  style={styles.feedback_ContinueButton_NEW}
                  onPress={handleContinue}>
                  <Text
                    style={[
                      styles.feedback_ContinueButtonText_NEW,
                      {color: showAnswerFeedback ? COLORS.primary : COLORS.red}, // Chữ màu xanh/đỏ
                    ]}>
                    Tiếp tục
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. Nút "Tiếp tục" / "Bỏ qua" GỐC */}
            {/* (Cho voice, audio, hoặc select/sapXep khi chưa chọn/chưa check và không hiển thị 2 phần trên) */}
            {shouldShowOriginalContinueOrSkip && (
              <TouchableOpacity
                style={[
                  // Style GỐC cho nút:
                  currentItem?.content_type === 'voice' ||
                  currentItem?.content_type === 'audio'
                    ? styles.skipButton // Style gốc của bạn
                    : styles.continueButton, // Style gốc của bạn
                  // Style GỐC cho trạng thái disabled:
                  isOriginalContinueButtonDisabled &&
                    styles.disabledButtonFooter,
                ]}
                onPress={handleContinue}
                disabled={isOriginalContinueButtonDisabled}>
                <Text style={styles.footerButtonText}>
                  {' '}
                  {/* Style text GỐC */}
                  {currentItem?.content_type === 'voice' ||
                  currentItem?.content_type === 'audio'
                    ? 'Bỏ qua'
                    : 'Tiếp tục'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {/* --- FOOTER MODIFICATION ENDS HERE --- */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// --- BEGIN STYLES (FROM YOUR ORIGINAL CODE, with NEW styles appended) ---
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  // ... (TOÀN BỘ STYLES GỐC CỦA BẠN - VUI LÒNG COPY PASTE TOÀN BỘ styles gốc của bạn vào đây) ...
  // Dưới đây là ví dụ một vài style gốc và các style mới được thêm vào
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding * 0.75,
    marginTop: StatusBar.currentHeight || 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  correctAnswerButton: {backgroundColor: 'green'},
  wrongAnswerButton: {backgroundColor: 'red'},
  skipButton: {
    backgroundColor: '#ccc',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
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
  },
  contentScrollArea: {flex: 1},
  contentScrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 130 : 110,
  },
  contentCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  contentCard2: {
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    paddingTop: 90,
  },
  contentCardQuestion: {
    backgroundColor: COLORS.nenItem,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: 20,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 0,
  },
  contentTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.xxLarge,
    color: COLORS.text,
    marginBottom: SIZES.margin * 1.5,
    textAlign: 'center',
    fontWeight: '900',
  },
  AudioIcon: {width: 150, height: 150},
  recordIcon: {width: 60, height: 60},
  instructionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.xLarge,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  questionSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  questionAudioButtonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 0,
    borderRadius: SIZES.radius,
    marginLeft: 10,
    marginBottom: 30,
  },
  audioIconSmall: {marginRight: 10, width: 35, height: 35}, // STYLE GỐC CHO contentImage (nếu có)
  contentImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    alignSelf: 'center',
  },
  contentDetailSelect: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 1.05,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.6,
    marginBottom: SIZES.padding,
    textAlign: 'center',
    fontWeight: '900',
    paddingBottom: 20,
    flex: 1,
  }, // Added flex:1
  optionsContainer: {marginTop: SIZES.padding},
  optionButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.7,
    borderRadius: 10,
    margin: SIZES.base * 0.4,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: COLORS.gray,
    marginBottom: SIZES.margin * 0.8,
    height: 50,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary || 'rgba(0,122,255,0.1)',
  },
  correctOption: {
    backgroundColor: COLORS.lightGreen || 'rgba(40,167,69,0.15)',
    borderColor: COLORS.green || '#28A745',
  },
  correctOptionText: {color: COLORS.darkGreen || '#155724', fontWeight: 'bold'},
  incorrectOption: {
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
  },
  incorrectOptionText: {color: COLORS.darkRed || '#721C24', fontWeight: 'bold'},
  optionText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'left',
    paddingTop: 5,
  },
  contentTitleSelect: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.xLarge,
    color: COLORS.black,
    marginBottom: 0,
    textAlign: 'left',
    fontWeight: '900',
    marginLeft: 15,
  },
  originalSentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding,
  },
  questionAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SIZES.base,
    marginBottom: SIZES.margin,
  },
  contentDetailXapXep: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.font * 1.15,
    color: COLORS.text,
    flex: 1,
    lineHeight: SIZES.font * 1.6,
    marginBottom: 18,
    fontWeight: '700',
  },
  wordArrangeDropArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 60,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.padding * 0.75,
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
    lineHeight: SIZES.padding * 0.6 * 2 + SIZES.font * 1.05,
  },
  arrangedWordItem: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingHorizontal: SIZES.padding * 0.8,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius,
    margin: SIZES.base * 0.3,
  },
  wordBankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 0.5,
    minHeight: 60,
  },
  wordBankItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.7,
    borderRadius: 10,
    margin: SIZES.base * 0.4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 9},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  wordBankText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
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
  // Style gốc cho sapXep nếu có
  correctWordBackgroundSapXep: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
    borderWidth: 1.5,
  },
  correctWordTextSapXep: {color: COLORS.darkGreen, fontWeight: 'bold'},
  incorrectWordBackgroundSapXep: {
    backgroundColor: COLORS.lightRed,
    borderColor: COLORS.red,
    borderWidth: 1.5,
    opacity: 0.8,
  },
  incorrectWordTextSapXep: {color: COLORS.darkRed},
  contentTitleAudio: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3 * 1.1,
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: '600',
  },
  contentDetailAudio: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 1.05,
    color: COLORS.textSecondary || COLORS.darkGray,
    lineHeight: SIZES.font * 1.6,
    marginBottom: SIZES.padding * 1.5,
  },
  audioPlayerPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    marginTop: SIZES.margin,
  },
  audioIconBig: {
    fontSize: SIZES.h1,
    color: COLORS.primary,
    marginRight: SIZES.padding,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  backButtonTextError: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
  },

  // === FOOTER STYLES GỐC CỦA BẠN ===
  footer: {
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    paddingBottom:
      Platform.OS === 'ios' ? SIZES.padding * 1.5 + 10 : SIZES.padding * 1.2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // minHeight: 70, // Chiều cao tối thiểu để chứa các nút (tùy chỉnh nếu cần)
    justifyContent: 'center', // Căn giữa nếu chỉ có 1 nút
  },
  checkButton: {
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    // marginRight: SIZES.base, // Giữ lại nếu ban đầu có nút khác cùng hàng
  },
  continueButton: {
    backgroundColor: COLORS.green || '#4CAF50',
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
  // === END FOOTER STYLES GỐC ===

  // --- CÁC STYLE MỚI CHỈ DÀNH CHO PHẦN FEEDBACK FOOTER ĐƯỢC THÊM VÀO ---
  footer_CorrectBackground_NEW: {
    backgroundColor: COLORS.green,
    // Không override các thuộc tính khác của styles.footer gốc
  },
  footer_IncorrectBackground_NEW: {
    backgroundColor: COLORS.red,
  },
  feedback_Container_NEW: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around', // Quan trọng để các item con được bố trí
    width: '100%',
    flex: 1, // Để chiếm toàn bộ không gian của View footer cha
    paddingVertical: SIZES.padding * 0.25, // Padding nhỏ bên trong feedback
    paddingHorizontal: SIZES.padding * 0.5,
    height: 160, // Chiều cao cố định cho feedback
    borderTopLeftRadius: 20, // Bo góc trên bên trái
    borderTopRightRadius: 20, // Bo góc trên bên phải
  },
  feedback_TextAudioWrapper_NEW: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.base * 0.5, // Khoảng cách nhỏ hơn
  },
  feedback_TextContainer_NEW: {
    flex: 1,
    marginRight: SIZES.base,
  },
  feedback_ResultText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.font * 1.1, // Chữ nhỏ hơn
    color: COLORS.white,
    fontWeight: 'bold',
  },
  feedback_DetailText_NEW: {
    textAlign: 'center',
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.xLarge, // Chữ nhỏ hơn
    color: COLORS.white,
    opacity: 0.9,
  },
  feedback_CorrectAnswerText_NEW: {
    marginTop: SIZES.base * 1.5,
    textAlign: 'center',
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium, // Chữ nhỏ hơn
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: '500',
    paddingLeft: SIZES.base * 0.5,
  },
  feedback_AudioButton_NEW: {
    padding: SIZES.base * 0.25,
  },
  feedback_AudioIcon_NEW: {
    width: 28, // Icon nhỏ hơn
    height: 28,
    tintColor: COLORS.white,
  },
  feedback_ContinueButton_NEW: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding * 0.6, // Nút nhỏ hơn
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius * 1.8, // Bo tròn ít hơn
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%', // Không chiếm 100%
    alignSelf: 'center',
    marginTop: SIZES.base * 0.5,
    minHeight: 38, // Nút nhỏ hơn
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  feedback_ContinueButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    textAlign: 'center',
    // Màu chữ sẽ được đặt động trong JSX
    fontSize: SIZES.font, // Chữ nhỏ hơn
    fontWeight: 'bold',
    width: '100%',
  },
});
// --- END STYLES ---

export default ContentsScreen;
