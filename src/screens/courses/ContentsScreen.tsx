// src/screens/lessons/ContentsScreen.tsx
import React, {useState, useMemo, useEffect} from 'react';
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
import {CoursesStackParamList, RootStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';

// --- BEGIN DATA INTERFACES AND MOCK DATA ---
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
    content_code: 1,
    content_type: 'audio',
    title: 'Chào hỏi cơ bản',
    content_detail: 'Luyện nghe các câu chào hỏi...',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: 'https://i.imgur.com/na3U2uk.png',
    display_order: 1,
    lesson_code: 12,
    skill_code: {skill_code: 1, skill_name: 'Nghe'},
  },
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
    title: "Chọn nghĩa đúng của 'こんにちは':",
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
    content_code: 7,
    content_type: 'sapXep',
    title: 'Sắp xếp từ thành nghĩa của câu dưới đây: ',
    content_detail: 'こんにちは、お父さん', // Câu nghĩa tiếng Việt/Yêu cầu
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: null,
    display_order: 3,
    lesson_code: 12,
    skill_code: {skill_code: 4, skill_name: 'Viết'},
    options: [
      {id: 'v1', text: 'xin chào'},
      {id: 'v2', text: 'chào buổi sáng'}, // Từ gây nhiễu
      {id: 'v3', text: 'bố'},
      {id: 'v4', text: 'mẹ'}, // Từ gây nhiễu
    ],
    correct_answer: ['v1', 'v3'], // Đáp án đúng: "xin chào", "bố"
  },
];
// --- END DATA ---

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
      <Text style={styles.progressText}>
        {current}/{total} câu
      </Text>
    </View>
  );
};

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

  const currentItem = itemsForThisLesson[currentIndex];
  const totalItems = itemsForThisLesson.length;

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
  };

  const handleContinue = () => {
    if (
      (currentItem?.content_type === 'select' ||
        currentItem?.content_type === 'sapXep') &&
      showAnswerFeedback === null &&
      currentItem.options &&
      ((currentItem.content_type === 'select' && userSelectedOptionId) ||
        (currentItem.content_type === 'sapXep' && arrangedWords.length > 0))
    ) {
      Alert.alert('Thông báo', "Bạn cần nhấn 'Kiểm tra' trước khi tiếp tục!");
      return;
    }
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert('Hoàn thành!', `Bạn đã hoàn thành ${lessonNameFromParam}.`);
      navigation.goBack();
    }
  };

  const renderContentItem = () => {
    if (!currentItem)
      return (
        <View style={styles.emptyContentContainer}>
          <Text style={styles.emptyContentText}>Hết nội dung.</Text>
        </View>
      );

    switch (currentItem.content_type) {
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
            <TouchableOpacity
              onPress={() => playSound(currentItem.audio_url)}
              style={styles.audioPlayerPlaceholder}>
              <Text style={styles.audioIconBig}>▶️</Text>
              <View style={styles.audioSeekBarPlaceholder} />
            </TouchableOpacity>
          </View>
        );
      case 'voice':
        return (
          <View style={styles.contentCard}>
            {currentItem.title && (
              <Text style={styles.contentTitle}>{currentItem.title}</Text>
            )}
            {currentItem.image_url && (
              <Image
                source={{uri: currentItem.image_url}}
                style={styles.contentImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.contentDetailText}>
              {currentItem.content_detail}
            </Text>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={() => Alert.alert('Ghi âm', 'Bắt đầu...')}>
              <Text style={styles.recordIcon}>🎤</Text>
            </TouchableOpacity>
            <Text style={styles.instructionText}>Nhấn để nói</Text>
          </View>
        );
      case 'select':
        return (
          <View style={styles.contentCard}>
            {currentItem.title && (
              <Text style={styles.contentTitleSelect}>{currentItem.title}</Text>
            )}
            {/* Hiển thị content_detail (câu hỏi) và nút loa nếu có */}
            <View style={styles.questionSelectContainer}>
              {currentItem.audio_url && (
                <TouchableOpacity
                  onPress={() => playSound(currentItem.audio_url)}
                  style={styles.questionAudioButtonSelect}>
                  <Image
                    source={require('../../assets/images/audioInconten.png')} // Đường dẫn đến file hình ảnh
                    style={styles.audioIconSmall} // Tạo style cho ảnh
                    resizeMode="contain" // Đảm bảo ảnh được chứa trong vùng bố cục
                  />
                </TouchableOpacity>
              )}
              <Text style={styles.contentDetailSelect}>
                {currentItem.content_detail}
              </Text>
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
                        styles.correctOption, // Chỉ highlight đúng nếu isCorrectOption
                      showAnswerFeedback === false &&
                        isSelected &&
                        styles.incorrectOption, // Chỉ highlight sai nếu isSelected và sai
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
                      source={require('../../assets/images/audioInconten.png')} // Đường dẫn đến file hình ảnh
                      style={styles.audioIconSmall} // Tạo style cho ảnh
                      resizeMode="contain" // Đảm bảo ảnh được chứa trong vùng bố cục
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
  const skillName = currentItem?.skill_code?.skill_name || '';

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
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progressWrapper}>
              <ProgressBar current={currentIndex + 1} total={totalItems} />
            </View>
            <View style={styles.skillTag}>
              <Text style={styles.skillTagText}>{skillName}</Text>
            </View>
          </View>

          <ScrollView
            style={styles.contentScrollArea}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
            key={`content_scroll_${currentIndex}_${showAnswerFeedback}`} // Thêm showAnswerFeedback vào key để re-render khi check
          >
            {renderContentItem()}
          </ScrollView>

          <View style={styles.footer}>
            {(currentItem?.content_type === 'select' ||
              currentItem?.content_type === 'sapXep') &&
              showAnswerFeedback === null &&
              currentItem.options &&
              ((currentItem.content_type === 'select' &&
                userSelectedOptionId) ||
                (currentItem.content_type === 'sapXep' &&
                  arrangedWords.length > 0)) && (
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    ((currentItem.content_type === 'select' &&
                      !userSelectedOptionId) ||
                      (currentItem.content_type === 'sapXep' &&
                        arrangedWords.length === 0)) &&
                      styles.disabledButtonFooter,
                  ]}
                  onPress={handleCheckAnswer}
                  disabled={
                    (currentItem.content_type === 'select' &&
                      !userSelectedOptionId) ||
                    (currentItem.content_type === 'sapXep' &&
                      arrangedWords.length === 0)
                  }>
                  <Text style={styles.footerButtonText}>Kiểm tra</Text>
                </TouchableOpacity>
              )}
            <TouchableOpacity
              style={[
                styles.continueButton,
                // Vô hiệu hóa nếu là select/sapXep và CHƯA kiểm tra đáp án VÀ đã có tương tác
                ((currentItem?.content_type === 'select' &&
                  userSelectedOptionId &&
                  showAnswerFeedback === null) ||
                  (currentItem?.content_type === 'sapXep' &&
                    arrangedWords.length > 0 &&
                    showAnswerFeedback === null)) &&
                  styles.disabledButtonFooter,
              ]}
              onPress={handleContinue}
              disabled={
                (currentItem?.content_type === 'select' &&
                  userSelectedOptionId &&
                  showAnswerFeedback === null) ||
                (currentItem?.content_type === 'sapXep' &&
                  arrangedWords.length > 0 &&
                  showAnswerFeedback === null)
              }>
              <Text style={styles.footerButtonText}>
                {currentIndex === totalItems - 1 ? 'Hoàn thành' : 'Tiếp tục'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// --- BEGIN STYLES ---
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
  backButton: {paddingHorizontal: SIZES.padding * 0.5},
  backButtonText: {
    fontSize: SIZES.xLarge * 1.8,
    color: COLORS.darkGray,
    fontWeight: '300',
  },
  questionAudioButtonIconOnly: {
    // Style chỉ cho nút loa, không bao gồm text câu hỏi
    marginRight: SIZES.base,
    paddingVertical: SIZES.base / 2, // Để dễ bấm hơn
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  questionAudioButtonSelect: {
    // Style cho TouchableOpacity chứa cả icon loa và câu hỏi
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary || 'rgba(253, 246, 236, 0.98)', // Nền màu kem giống các lựa chọn
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding,
    marginRight: 10, // Khoảng cách giữa icon và text
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding * 1.5, // Khoảng cách với các options

    // Có thể thêm viền nếu muốn
    // borderWidth: 1,
    // borderColor: COLORS.lightGray,
  },
  progressWrapper: {flex: 1, marginHorizontal: SIZES.base},
  progressBarContainer: {
    height: 22,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.green || '#4CAF50',
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
    // << STYLE MỚI BẠN CẦN THÊM
    flexDirection: 'row', // Để icon loa và text câu hỏi nằm cùng hàng
    alignItems: 'center', // Căn theo đầu dòng nếu text dài
    marginBottom: SIZES.padding, // Khoảng cách với các options
    // Bạn có thể thêm padding, margin, border ở đây nếu muốn
    // backgroundColor: 'rgba(0,0,0,0.05)', // Ví dụ nền nhẹ
    // padding: SIZES.base,
    // borderRadius: SIZES.radius,
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
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SIZES.margin * 1.5,
    textAlign: 'center',
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
    marginRight: SIZES.base,
    width: 35, // Kích thước của icon hình ảnh
    height: 35, // Kích thước của icon hình ảnh
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
    backgroundColor: COLORS.green,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {fontSize: SIZES.h1 * 1.5, color: COLORS.white},
  instructionText: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SIZES.base,
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
    paddingVertical: SIZES.padding * 1.2,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray2,
    marginBottom: SIZES.margin * 0.8,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary || 'rgba(0,122,255,0.1)', // Màu xanh dương nhạt làm ví dụ
  },
  correctOption: {
    backgroundColor: COLORS.lightGreen || 'rgba(40,167,69,0.15)',
    borderColor: COLORS.green || '#28A745',
  },
  correctOptionText: {
    color: COLORS.darkGreen || '#155724',
    fontWeight: 'bold',
    // textAlign: 'center', // Bỏ nếu optionText đã là center hoặc left
  },
  incorrectOption: {
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
  },
  incorrectOptionText: {
    color: COLORS.darkRed || '#721C24',
    fontWeight: 'bold',
    // textAlign: 'center',
  },
  optionText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'left', // Giữ căn trái như ảnh "detailConten1.jpg" (phải)
  },
  originalSentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5, // Giảm padding dọc chút
    paddingHorizontal: SIZES.padding,
  },
  contentDetailXapXep: {
    fontFamily: FONTS.bold?.fontFamily || 'System', // Đậm hơn cho câu tiếng Nhật
    fontSize: SIZES.font * 1.15, // To hơn chút
    color: COLORS.text,
    flex: 1,
    lineHeight: SIZES.font * 1.6,
    marginBottom: 18,
    fontWeight: '700',
  },
  wordArrangeDropArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 60, // Giảm chiều cao tối thiểu
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLG,
    padding: SIZES.padding * 0.75, // Padding vừa phải
    marginBottom: SIZES.margin, // Giảm margin bottom
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'flex-start',
  },
  arrangedTextPlaceholder: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9, // Chữ nhỏ hơn
    color: COLORS.gray,
    flex: 1,
    textAlign: 'center',
    lineHeight: SIZES.padding * 0.6 * 2 + SIZES.font * 1.05, // Điều chỉnh line height
  },
  arrangedWordItem: {
    // Style cho từ đã được xếp lên trên (nền xanh lá như ảnh)
    backgroundColor: COLORS.primary || '#28a745',

    paddingHorizontal: SIZES.padding * 0.8,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius, // Bo tròn vừa phải
    margin: SIZES.base * 0.3,
  },
  wordBankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 0.5,
    minHeight: 60, // Giảm chiều cao tối thiểu
  },
  wordBankItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.7,
    borderRadius: 10, // Đảm bảo các góc được cong
    margin: SIZES.base * 0.4,

    // Cài đặt shadow cho iOS
    shadowColor: COLORS.black, // Màu shadow
    shadowOffset: {width: 0, height: 9}, // Điều chỉnh shadow xuống dưới hơn một chút
    shadowOpacity: 0.15, // Độ mờ của shadow
    shadowRadius: 8, // Độ lan tỏa của shadow

    // Cài đặt shadow cho Android
    elevation: 5, // Độ cao của shadow trên Android, giúp có shadow
  },
  wordBankText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  arrangedWordText: {
    color: COLORS.white, // Chữ trắng trên nền xanh
    fontWeight: '500',
  },
  wordBankItemSelectedAndUsed: {
    // Style cho từ trong word bank khi đã được chọn lên drop area
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
    opacity: 0.3, // Làm mờ đi rõ hơn
  },
  disabledWordBankItem: {
    // Style cho từ trong word bank sau khi đã check đáp án
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
  },
  checkButton: {
    backgroundColor: COLORS.orange || '#FFA500',
    paddingVertical: SIZES.padding * 1.2,
    borderRadius: SIZES.radius * 2.5,
    alignItems: 'center',
    flex: 1,
    marginRight: SIZES.base,
  },
  continueButton: {
    backgroundColor: COLORS.green || '#4CAF50',
    paddingVertical: SIZES.padding * 1.5,
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
});

export default ContentsScreen;
