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
  // Animated, // Bỏ nếu không dùng
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList, RootStackParamList} from '../../navigation'; // Đảm bảo đường dẫn này đúng
import {COLORS, FONTS, SIZES} from '../../constants/theme'; // Đảm bảo đường dẫn này đúng
import {Colors} from 'react-native/Libraries/NewAppScreen'; // Giữ lại nếu bạn có dùng ở đâu đó, nếu không thì có thể bỏ

// --- BEGIN DATA INTERFACES AND MOCK DATA ---
// Giữ nguyên phần này của bạn
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
  {
    content_code: 3,
    content_type: 'voice',
    title: 'Luyện phát âm: あ, い, う',
    content_detail: 'Ghi âm và luyện phát âm...',
    audio_url: null,
    image_url: 'https://i.imgur.com/R8WeIEv.jpeg',
    display_order: 1,
    lesson_code: 12,
    skill_code: {skill_code: 2, skill_name: 'Nói'},
  },
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
    display_order: 5,
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
];
// --- END DATA ---

type ContentsScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsScreen'
>;
type ContentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// ProgressBar component giữ nguyên như của bạn
const ProgressBar = ({current, total}: {current: number; total: number}) => {
  const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, {width: `${progress}%`}]} />
    </View>
  );
};

// --- BEGIN SUMMARY SCREEN COMPONENT ---
interface LessonSummaryProps {
  correctAnswersCount: number;
  totalQuestions: number;
  timeTaken: string;
  onComplete: () => void;
  // lessonName: string; // Không cần lessonName ở đây nếu không hiển thị
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

  // Style cho màn hình tổng kết, cố gắng dùng SIZES, COLORS, FONTS của bạn
  // và giữ nó đơn giản, chỉ tập trung vào các thông tin như ảnh
  const summaryStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SIZES.padding * 2, // Sử dụng SIZES từ theme
      // backgroundColor: COLORS.white, // Hoặc một màu nền bạn muốn (từ COLORS)
    },
    logo: {
      width: screenWidth * 0.3, // Sử dụng screenWidth đã khai báo ở styles gốc
      height: screenWidth * 0.3,
      marginBottom: SIZES.padding * 2,
    },
    title: {
      fontFamily: FONTS.bold?.fontFamily || 'System', // Sử dụng FONTS từ theme
      fontSize: SIZES.h1, // Sử dụng SIZES từ theme
      color: COLORS.text, // Sử dụng COLORS từ theme
      marginBottom: SIZES.padding * 2,
      textAlign: 'center',
    },
    card: {
      backgroundColor: COLORS.white,
      borderRadius: SIZES.radius,
      padding: SIZES.padding * 1.5,
      marginBottom: SIZES.margin,
      width: '90%', // Hoặc 100% với padding trong container
      flexDirection: 'row',
      alignItems: 'center',
      // Shadow giống với các card câu hỏi của bạn nếu có
      shadowColor: COLORS.black,
      shadowOffset: {width: 0, height: 1}, // Điều chỉnh cho phù hợp
      shadowOpacity: 0.1,
      shadowRadius: SIZES.radius / 2,
      elevation: 2, // Điều chỉnh cho phù hợp
    },
    iconText: {
      // Cho icon dạng text như 📊 ✅ ⏱️
      fontSize: SIZES.h2, // Kích thước cho icon text
      marginRight: SIZES.base,
      color: COLORS.primary, // Màu cho icon
    },
    text: {
      fontFamily: FONTS.medium?.fontFamily || 'System',
      fontSize: SIZES.font, // SIZES.body3 hoặc SIZES.font
      color: COLORS.textSecondary || COLORS.darkGray,
    },
    completeButton: {
      backgroundColor: COLORS.green, // Màu xanh lá từ COLORS
      paddingVertical: SIZES.padding,
      paddingHorizontal: SIZES.padding * 3,
      borderRadius: SIZES.radius * 2.5, // Bo tròn nhiều
      marginTop: SIZES.padding * 2,
      alignItems: 'center',
      width: '90%',
    },
    completeButtonText: {
      fontFamily: FONTS.bold?.fontFamily || 'System',
      color: COLORS.white,
      fontSize: SIZES.large, // SIZES.font * 1.1
    },
  });

  return (
    <View style={summaryStyles.container}>
      <Image
        source={require('../../assets/images/Logo.png')} // Đường dẫn tới logo của bạn
        style={summaryStyles.logo}
        resizeMode="contain"
      />
      <Text style={summaryStyles.title}>Kết quả hoàn thành</Text>

      <View style={summaryStyles.card}>
        <Text style={summaryStyles.iconText}>📊</Text>
        <Text style={summaryStyles.text}>
          Tỷ lệ đúng: {correctAnswersCount}/{totalQuestions}
        </Text>
      </View>

      <View style={summaryStyles.card}>
        <Text style={summaryStyles.iconText}>✅</Text>
        <Text style={summaryStyles.text}>Hoàn thành: {accuracy}%</Text>
      </View>

      <View style={summaryStyles.card}>
        <Text style={summaryStyles.iconText}>⏱️</Text>
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
  const lessonNameFromParam = route.params?.lessonName || 'Bài học';
  const currentLessonCode = parseInt(lessonCodeFromParam || '0', 10);

  const itemsForThisLesson = useMemo(() => {
    return allLessonContents
      .filter(content => content.lesson_code === currentLessonCode)
      .sort((a, b) => a.display_order - b.display_order);
  }, [currentLessonCode]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelectedOptionId, setUserSelectedOptionId] = useState<
    string | null
  >(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean | null>(
    null,
  );
  const [arrangedWords, setArrangedWords] = useState<Option[]>([]);

  // --- BEGIN STATES FOR SUMMARY ---
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  // --- END STATES FOR SUMMARY ---

  const currentItem = itemsForThisLesson[currentIndex];
  const totalItems = itemsForThisLesson.length;

  useEffect(() => {
    if (itemsForThisLesson.length > 0 && !startTime) {
      setStartTime(new Date());
      setCorrectAnswersCount(0);
      setShowSummaryScreen(false);
    }
  }, [itemsForThisLesson, startTime, currentLessonCode]); // Thêm currentLessonCode để reset khi đổi bài

  useEffect(() => {
    setUserSelectedOptionId(null);
    setShowAnswerFeedback(null);
    if (currentItem && currentItem.content_type === 'sapXep') {
      setArrangedWords([]);
    }
  }, [currentIndex, currentItem]);

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

  const handleCheckAnswer = () => {
    // Giữ nguyên logic handleCheckAnswer của bạn
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
        userAnswerIds.length === correctAnswerIds.length
      ) {
        isCorrect = userAnswerIds.every(
          (val, index) => val === correctAnswerIds[index],
        );
      }
    }
    setShowAnswerFeedback(isCorrect);
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (showSummaryScreen) {
      // Nếu đang ở màn hình tổng kết
      navigation.goBack();
      return;
    }

    // Điều kiện cần "Kiểm tra" trước
    if (
      (currentItem?.content_type === 'select' ||
        currentItem?.content_type === 'sapXep') &&
      showAnswerFeedback === null && // Chưa kiểm tra
      currentItem.options &&
      ((currentItem.content_type === 'select' && userSelectedOptionId) ||
        (currentItem.content_type === 'sapXep' && arrangedWords.length > 0))
    ) {
      Alert.alert('Thông báo', "Bạn cần nhấn 'Kiểm tra' trước khi tiếp tục!");
      return;
    }

    const isLastItem = currentIndex >= totalItems - 1;

    if (isLastItem) {
      // Chỉ chuyển sang màn hình tổng kết nếu là câu cuối VÀ
      // (đã kiểm tra xong (showAnswerFeedback !== null) ĐỐI VỚI select/sapXep) HOẶC (là loại voice/audio không cần bước kiểm tra)
      if (
        (currentItem?.content_type === 'select' &&
          showAnswerFeedback !== null) ||
        (currentItem?.content_type === 'sapXep' &&
          showAnswerFeedback !== null) ||
        currentItem?.content_type === 'voice' || // Thêm các loại không cần kiểm tra khác nếu có
        currentItem?.content_type === 'audio'
      ) {
        setEndTime(new Date());
        setShowSummaryScreen(true); // Chuyển sang màn hình tổng kết
      }
      // Không làm gì khác nếu là câu cuối của select/sapXep mà chưa kiểm tra (đã bị chặn ở trên)
    } else {
      // Nếu không phải câu cuối, chuyển sang câu tiếp theo
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTimeTaken = useCallback(() => {
    if (!startTime) return '0 phút 0 giây';
    const finalEndTime = endTime || new Date();
    const diffMs = finalEndTime.getTime() - startTime.getTime();
    if (diffMs < 0) return '0 phút 0 giây'; // Trường hợp startTime set sau endTime do race condition/logic
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.round((diffMs % 60000) / 1000);
    return `${diffMins} phút ${diffSecs} giây`;
  }, [startTime, endTime]);

  const handleBackPress = () => {
    // Giữ nguyên logic handleBackPress của bạn
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

  // renderContentItem giữ nguyên hoàn toàn như code gốc của bạn
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
            {/* Icon loa và micro giữ nguyên style gốc của bạn */}
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
            {/* Nút "Bỏ qua" trong voice sẽ gọi handleContinue, đã được xử lý ở footer */}
            {/* Bạn có thể giữ lại nút "Bỏ qua" ở đây nếu muốn nó tách biệt khỏi footer chung */}
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.instructionButton}>
              <Text style={styles.instructionText}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        );
      case 'select':
        // Toàn bộ phần render cho 'select' giữ nguyên như code gốc của bạn
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
        // Toàn bộ phần render cho 'sapXep' giữ nguyên như code gốc của bạn
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
  // --- HẾT PHẦN GIỮ NGUYÊN renderContentItem ---

  if (!lessonCodeFromParam || totalItems === 0) {
    // Giữ nguyên phần báo lỗi của bạn
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

  // --- RENDER MÀN HÌNH TỔNG KẾT NẾU CẦN ---
  if (showSummaryScreen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        {/* Bạn có thể thêm ImageBackground ở đây nếu muốn màn hình tổng kết có nền giống màn hình câu hỏi */}
        <ImageBackground
          source={require('../../assets/images/nen3.jpg')}
          style={StyleSheet.absoluteFillObject}
          imageStyle={{opacity: 0.08}} // Giữ opacity như cũ hoặc điều chỉnh
          resizeMode="cover">
          <LessonSummaryScreen
            correctAnswersCount={correctAnswersCount}
            totalQuestions={totalItems}
            timeTaken={formatTimeTaken()}
            onComplete={handleContinue} // Nút "Hoàn thành" trên màn tổng kết sẽ gọi goBack()
          />
        </ImageBackground>
      </SafeAreaView>
    );
  }
  // --- KẾT THÚC RENDER MÀN HÌNH TỔNG KẾT ---

  // const skillName = currentItem?.skill_code?.skill_name || ''; // Giữ lại nếu bạn dùng

  // Giao diện chính của màn hình câu hỏi, giữ nguyên như của bạn
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

          {/* Footer giữ nguyên như của bạn, chỉ có text của nút Tiếp tục có thể thay đổi */}
          <View style={styles.footer}>
            {/* Ghi âm: luôn hiển thị nút Bỏ qua (đã được xử lý trong renderContentItem hoặc có thể đặt ở đây) */}
            {/* {currentItem?.content_type === 'ghiAm' && ( // 'ghiAm' là tên bạn dùng hay 'voice'?
              <TouchableOpacity
                style={styles.skipButton} // Dùng style skipButton gốc của bạn
                onPress={handleContinue}>
                <Text style={styles.footerButtonText}>
                    {currentIndex >= totalItems - 1 ? "Xem tổng kết" : "Bỏ qua"}
                </Text>
              </TouchableOpacity>
            )} */}

            {/* Select hoặc SapXep: nếu đã chọn -> hiển thị nút Kiểm tra */}
            {(currentItem?.content_type === 'select' ||
              currentItem?.content_type === 'sapXep') &&
              showAnswerFeedback === null && // Quan trọng: chỉ hiện khi chưa kiểm tra
              ((currentItem.content_type === 'select' &&
                userSelectedOptionId) ||
                (currentItem.content_type === 'sapXep' &&
                  arrangedWords.length > 0)) && (
                <TouchableOpacity
                  style={styles.checkButton} // Dùng style checkButton gốc
                  onPress={handleCheckAnswer}>
                  <Text style={styles.footerButtonText}>Kiểm tra</Text>
                </TouchableOpacity>
              )}

            {/* Sau khi kiểm tra (cho select/sapXep) HOẶC cho voice (luôn có thể tiếp tục/xem tổng kết) */}
            {((currentItem?.content_type === 'select' ||
              currentItem?.content_type === 'sapXep') &&
              showAnswerFeedback !== null) ||
            currentItem?.content_type === 'voice' ||
            currentItem?.content_type === 'audio' ? (
              <>
                {/* Phần hiển thị audio feedback sau khi kiểm tra (giữ nguyên của bạn) */}
                {showAnswerFeedback !== null &&
                  (currentItem?.content_type === 'select' ||
                    currentItem?.content_type === 'sapXep') && (
                    <View
                      style={{
                        alignItems: 'center',
                        marginBottom: 10,
                        // backgroundColor: COLORS.green, // Bỏ màu nền này nếu bạn không muốn
                      }}>
                      <View style={{alignItems: 'center'}}>
                        {/* <Text style={{fontSize: 16, fontWeight: 'bold', marginRight: 8}}>
                        {currentItem?.content_detail} // Có thể bỏ nếu không muốn lặp lại
                      </Text> */}
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: showAnswerFeedback
                              ? COLORS.green
                              : COLORS.red,
                            marginBottom: 5,
                          }}>
                          {showAnswerFeedback ? 'Chính xác!' : 'Sai rồi!'}
                          {currentItem?.content_type === 'select' &&
                            !showAnswerFeedback &&
                            currentItem.options &&
                            currentItem.correct_answer &&
                            ` Đáp án đúng: ${
                              currentItem.options.find(
                                opt => opt.id === currentItem.correct_answer,
                              )?.text
                            }`}
                        </Text>
                        {currentItem?.audio_url && (
                          <TouchableOpacity
                            onPress={() => playSound(currentItem.audio_url)}>
                            <Image
                              source={require('../../assets/images/amThanhTiepTuc.png')}
                              style={{width: 64, height: 64}} // Giữ style của bạn
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                <TouchableOpacity
                  style={[
                    styles.continueButton /* Thêm style màu dựa trên showAnswerFeedback nếu muốn */,
                    showAnswerFeedback === true && styles.correctAnswerButton, // Dùng style gốc của bạn
                    showAnswerFeedback === false && styles.wrongAnswerButton, // Dùng style gốc của bạn
                    (currentItem?.content_type === 'voice' ||
                      currentItem?.content_type === 'audio') &&
                      styles.skipButton, // Dùng style skip gốc cho voice
                  ]}
                  onPress={handleContinue}>
                  <Text
                    style={
                      currentItem?.content_type === 'voice' ||
                      currentItem?.content_type === 'audio'
                        ? styles.footerButtonText // Giả sử footerButtonText phù hợp cho voice
                        : showAnswerFeedback !== null
                        ? styles.footerButtonText
                        : Colors.white // Dùng Colors.white gốc cho nút Tiếp tục
                    }>
                    Tiếp tục
                    {/* Text không cần thay đổi, logic trong handleContinue sẽ quyết định */}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// --- BEGIN STYLES ---
// Toàn bộ styles gốc của bạn được giữ nguyên ở đây
const screenWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
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
  correctAnswerButton: {
    // Style gốc của bạn
    backgroundColor: 'green',
  },
  wrongAnswerButton: {
    // Style gốc của bạn
    backgroundColor: 'red',
  },
  skipButton: {
    // Style gốc của bạn (cho voice/ghiAm)
    backgroundColor: '#ccc', // Hoặc COLORS.lightGray hoặc màu bạn muốn
    paddingVertical: SIZES.padding * 1.2, // Điều chỉnh cho nhất quán với continueButton
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1, // Nếu muốn nó chiếm hết footer
    // padding: 10, // Gốc
    // borderRadius: 8, // Gốc
  },
  backButton: {paddingHorizontal: SIZES.padding * 0.5},
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: 10,
  },
  questionAudioButtonIconOnly: {
    marginRight: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  questionAudioButtonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginRight: 20,
    borderRadius: SIZES.radius,
    marginLeft: 10,
    marginBottom: 30,
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
  progressText: {
    alignSelf: 'center',
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontSize: SIZES.small * 0.9,
    color: COLORS.white,
    fontWeight: 'bold',
    zIndex: 1,
  },
  questionSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  skillTag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.4,
    borderRadius: SIZES.radius * 1.5,
    marginLeft: SIZES.base,
  },
  skillTagText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '600',
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
    // backgroundColor: COLORS.white, // Nếu bạn muốn card có nền trắng riêng biệt
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
  contentCardVoice: {
    // Giữ style này nếu bạn dùng riêng cho voice
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  contentCardQuestion: {
    backgroundColor: COLORS.nenItem, // Giữ màu gốc của bạn
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
  contentTitleAudio: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3 * 1.1,
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: '600',
  },
  contentImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.margin,
    alignSelf: 'center',
  },
  contentDetailText: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 1.1,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.7,
    textAlign: 'left',
    marginBottom: SIZES.padding,
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
  audioIconSmall: {
    marginRight: 10,
    width: 35,
    height: 35,
  },
  audioSeekBarPlaceholder: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray,
    borderRadius: 4,
  },
  questionAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SIZES.base,
    marginBottom: SIZES.margin,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding * 2,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {
    width: 60,
    height: 60,
  },
  AudioIcon: {
    width: 150,
    height: 150,
  },
  instructionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'transparent',
    alignSelf: 'center', // để nút không chiếm toàn bộ chiều ngang
    borderRadius: 5,
    justifyContent: 'center', // căn giữa theo chiều dọc
    alignItems: 'center', // căn giữa theo chiều ngang
  },
  instructionText: {
    // Style cho nút "Bỏ qua" trong voice
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.xLarge, // Giữ style gốc
    color: COLORS.black, // Giữ style gốc
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',

    textDecorationLine: 'underline', // Giữ style gốc
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
  contentDetailSelect: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 1.05,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.6,
    marginBottom: SIZES.padding,
    textAlign: 'center',
    fontWeight: '900',
    paddingBottom: 20,
  },
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
  correctOptionText: {
    color: COLORS.darkGreen || '#155724',
    fontWeight: 'bold',
  },
  incorrectOption: {
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
  },
  incorrectOptionText: {
    color: COLORS.darkRed || '#721C24',
    fontWeight: 'bold',
  },
  optionText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'left',
    paddingTop: 5,
  },
  originalSentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding,
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
  arrangedWordText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  wordBankItemSelectedAndUsed: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
    opacity: 0.3,
  },
  disabledWordBankItem: {
    opacity: 0.3,
  },
  correctWordBackground: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
  },
  incorrectWordBackground: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.darkRed,
  },
  footer: {
    // Style footer gốc của bạn
    paddingVertical: SIZES.padding * 0.75,
    paddingHorizontal: SIZES.padding,
    paddingBottom:
      Platform.OS === 'ios' ? SIZES.padding * 1.5 + 10 : SIZES.padding * 1.2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray2,
    backgroundColor: COLORS.white,
    flexDirection: 'row', // Giữ lại nếu bạn muốn các nút trên cùng một hàng
    alignItems: 'center', // Giữ lại
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  checkButton: {
    // Style checkButton gốc của bạn
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginRight: SIZES.base, // Giữ lại nếu có nút Tiếp tục bên cạnh
  },
  continueButton: {
    // Style continueButton gốc của bạn
    backgroundColor: COLORS.green || '#4CAF50', // Màu mặc định khi chưa có feedback
    paddingVertical: SIZES.padding * 1.2, // Sửa lại cho giống checkButton nếu muốn
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
  },
  disabledButtonFooter: {backgroundColor: COLORS.lightGray}, // Giữ lại nếu dùng
  footerButtonText: {
    // Style footerButtonText gốc của bạn
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.font * 1.1,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.background, // Giữ lại
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
});
// --- END STYLES ---

export default ContentsScreen;
