// src/screens/courses/CourseDetailScreen.tsx
import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CoursesStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Image} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Dữ liệu bảng chữ cái bạn cung cấp ---
interface KanaCharacter {
  romaji: string;
  hiragana: string;
  katakana: string;
}
const fullKanaChartData: KanaCharacter[] = [
  {romaji: 'a', hiragana: 'あ', katakana: 'ア'},
  {romaji: 'i', hiragana: 'い', katakana: 'イ'},
  {romaji: 'u', hiragana: 'う', katakana: 'ウ'},
  {romaji: 'e', hiragana: 'え', katakana: 'エ'},
  {romaji: 'o', hiragana: 'お', katakana: 'オ'},
  {romaji: 'ka', hiragana: 'か', katakana: 'カ'},
  {romaji: 'ki', hiragana: 'き', katakana: 'キ'},
  {romaji: 'ku', hiragana: 'く', katakana: 'ク'},
  {romaji: 'ke', hiragana: 'け', katakana: 'ケ'},
  {romaji: 'ko', hiragana: 'こ', katakana: 'コ'},
  {romaji: 'sa', hiragana: 'さ', katakana: 'サ'},
  {romaji: 'shi', hiragana: 'し', katakana: 'シ'},
  {romaji: 'su', hiragana: 'す', katakana: 'ス'},
  {romaji: 'se', hiragana: 'せ', katakana: 'セ'},
  {romaji: 'so', hiragana: 'そ', katakana: 'ソ'},
  {romaji: 'ta', hiragana: 'た', katakana: 'タ'},
  {romaji: 'chi', hiragana: 'ち', katakana: 'チ'},
  {romaji: 'tsu', hiragana: 'つ', katakana: 'ツ'},
  {romaji: 'te', hiragana: 'て', katakana: 'テ'},
  {romaji: 'to', hiragana: 'と', katakana: 'ト'},
  {romaji: 'na', hiragana: 'な', katakana: 'ナ'},
  {romaji: 'ni', hiragana: 'に', katakana: 'ニ'},
  {romaji: 'nu', hiragana: 'ぬ', katakana: 'ヌ'},
  {romaji: 'ne', hiragana: 'ね', katakana: 'ネ'},
  {romaji: 'no', hiragana: 'の', katakana: 'ノ'},
  {romaji: 'ha', hiragana: 'は', katakana: 'ハ'},
  {romaji: 'hi', hiragana: 'ひ', katakana: 'ヒ'},
  {romaji: 'fu', hiragana: 'ふ', katakana: 'フ'},
  {romaji: 'he', hiragana: 'へ', katakana: 'ヘ'},
  {romaji: 'ho', hiragana: 'ほ', katakana: 'ホ'},
  {romaji: 'ma', hiragana: 'ま', katakana: 'マ'},
  {romaji: 'mi', hiragana: 'み', katakana: 'ミ'},
  {romaji: 'mu', hiragana: 'む', katakana: 'ム'},
  {romaji: 'me', hiragana: 'め', katakana: 'メ'},
  {romaji: 'mo', hiragana: 'も', katakana: 'モ'},
  {romaji: 'ya', hiragana: 'や', katakana: 'ヤ'},
  {romaji: 'yu', hiragana: 'ゆ', katakana: 'ユ'},
  {romaji: 'yo', hiragana: 'よ', katakana: 'ヨ'},
  {romaji: 'ra', hiragana: 'ら', katakana: 'ラ'},
  {romaji: 'ri', hiragana: 'り', katakana: 'リ'},
  {romaji: 'ru', hiragana: 'る', katakana: 'ル'},
  {romaji: 're', hiragana: 'れ', katakana: 'レ'},
  {romaji: 'ro', hiragana: 'ろ', katakana: 'ロ'},
  {romaji: 'wa', hiragana: 'わ', katakana: 'ワ'},
  {romaji: 'wo', hiragana: 'を', katakana: 'ヲ'},
  {romaji: 'n', hiragana: 'ん', katakana: 'ン'},
];
// --- Kết thúc dữ liệu bảng chữ cái ---

// Interface cho một item trong FlatList hiển thị bảng chữ cái
interface KanaDisplayItem {
  id: string;
  kana: string;
  romaji: string;
}

// Interfaces cho API data (giữ nguyên)
interface Lesson {
  lesson_code: number;
  lesson_name: string;
  status?: 'completed' | 'pending';
  lesson_type?: 'hira' | 'kata' | 'common' | 'theory' | 'exam';
  lesson_description: string;
  quantity_content: number;
  day_creation: string;
  topic_code: number;
}
interface ApiTheoryDTO {
  id: number;
  name: string;
  isComplete?: boolean | null;
}
interface ApiLessonInList {
  id: number;
  name: string;
  isComplete: boolean | null;
}
interface ApiExamResponseDTO {
  id: number;
  name: string;
  isComplete: boolean | null;
}
interface ApiTopicViewResponse {
  id: number;
  name: string;
  theoryDTO: ApiTheoryDTO | null;
  lessons: ApiLessonInList[];
  examResponseDTO: ApiExamResponseDTO | null;
}

type CourseDetailScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'Lesson' | 'ContentsLyThuyetScreen' | 'ContentsScreen'
>;

const LessonStatusIcon = ({status}: {status?: Lesson['status']}) => {
  if (status === 'completed') {
    return (
      <Image
        source={require('../../assets/images/hoanThanh.png')}
        style={styles.lessonStatusImage}
      />
    );
  }
  return (
    <Image
      source={require('../../assets/images/chuaHoc.png')}
      style={styles.lessonStatusImage}
    />
  );
};

const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailScreenRouteProp>();
  const navigation = useNavigation<CourseDetailScreenNavigationProp>();

  const {courseId, title: initialTopicTitle} = route.params || {};

  const [allScreenItems, setAllScreenItems] = useState<Lesson[]>([]); // Dùng cho dữ liệu từ API (không phải bảng chữ cái)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<'Hira' | 'Kata'>('Hira'); // Dùng cho cả 2 chế độ
  const [displayTitle, setDisplayTitle] = useState<string>(
    initialTopicTitle || 'Chi tiết chủ đề',
  );

  const currentTopicIdAsNumber = useMemo(() => {
    if (typeof courseId === 'string' && courseId.trim() !== '') {
      return parseInt(courseId, 10);
    }
    return NaN;
  }, [courseId]);

  const isAlphabetTopic = useMemo(
    () => (displayTitle || '').toLowerCase() === 'bảng chữ cái',
    [displayTitle],
  );

  const fetchTopicDetails = useCallback(
    async (topicIdToFetch: number, userId: string) => {
      // ... (Nội dung hàm fetchTopicDetails giữ nguyên như code bạn đã cung cấp lần trước)
      // Chỉ đảm bảo nó không bị gọi nếu isAlphabetTopic là true
      if (isNaN(topicIdToFetch) || !userId) {
        setError('ID chủ đề hoặc UserId không hợp lệ.');
        setIsLoading(false);
        setAllScreenItems([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token.');
        const response = await axios.get<ApiTopicViewResponse>(
          `http://10.0.2.2:8080/api/user/topic/view?topicId=${topicIdToFetch}&idUser=${userId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (response.data) {
          const topicData = response.data;
          setDisplayTitle(
            topicData.name || initialTopicTitle || 'Chi tiết chủ đề',
          );
          const combinedItems: Lesson[] = [];
          if (topicData.theoryDTO)
            combinedItems.push({
              lesson_code: topicData.theoryDTO.id,
              lesson_name: topicData.theoryDTO.name,
              status:
                topicData.theoryDTO.isComplete === true
                  ? 'completed'
                  : 'pending',
              lesson_type: 'common',
              lesson_description: '',
              quantity_content: 0,
              day_creation: '',
              topic_code: topicIdToFetch,
            });
          if (topicData.lessons?.length)
            topicData.lessons.forEach(apiLesson =>
              combinedItems.push({
                lesson_code: apiLesson.id,
                lesson_name: apiLesson.name,
                status: apiLesson.isComplete === true ? 'completed' : 'pending',
                lesson_type: 'common',
                lesson_description: '',
                quantity_content: 0,
                day_creation: '',
                topic_code: topicIdToFetch,
              }),
            );
          if (topicData.examResponseDTO)
            combinedItems.push({
              lesson_code: topicData.examResponseDTO.id,
              lesson_name: topicData.examResponseDTO.name,
              status:
                topicData.examResponseDTO.isComplete === true
                  ? 'completed'
                  : 'pending',
              lesson_type: 'common',
              lesson_description: '',
              quantity_content: 0,
              day_creation: '',
              topic_code: topicIdToFetch,
            });
          setAllScreenItems(combinedItems);
        } else {
          setAllScreenItems([]);
          setError('Không nhận được dữ liệu API.');
        }
      } catch (err) {
        /* ... xử lý lỗi ... */ setError('Lỗi tải dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    },
    [initialTopicTitle],
  );

  useEffect(() => {
    // Cập nhật displayTitle từ initialTopicTitle khi component mount hoặc initialTopicTitle thay đổi
    if (initialTopicTitle) {
      setDisplayTitle(initialTopicTitle);
    }
  }, [initialTopicTitle]);

  useEffect(() => {
    const loadData = async () => {
      // Xác định isAlphabetTopic dựa trên displayTitle đã được cập nhật
      const isAlphabet = (displayTitle || '').toLowerCase() === 'bảng chữ cái';
      console.log(
        'CourseDetailScreen: isAlphabetTopic =',
        isAlphabet,
        'displayTitle =',
        displayTitle,
      );

      if (isAlphabet) {
        setIsLoading(false); // Không loading API
        setAllScreenItems([]); // Xóa dữ liệu API (nếu có)
        setError(null);
        // Dữ liệu bảng chữ cái sẽ được xử lý bởi alphabetDisplayData
      } else if (!isNaN(currentTopicIdAsNumber)) {
        try {
          const storedUserId = await AsyncStorage.getItem('UserId');
          if (storedUserId) {
            fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
          } else {
            setError('Không tìm thấy UserId. Không thể tải dữ liệu.');
            setIsLoading(false);
          }
        } catch (e) {
          setError('Lỗi đọc UserId.');
          setIsLoading(false);
        }
      } else if (courseId) {
        // courseId có nhưng không parse được thành số hợp lệ
        setError('ID chủ đề không hợp lệ.');
        setIsLoading(false);
      } else {
        // Không có courseId (trường hợp này đã được chặn ở đầu component)
        setIsLoading(false); // Hoàn tất việc kiểm tra
      }
    };
    loadData();
  }, [currentTopicIdAsNumber, displayTitle, fetchTopicDetails, courseId]); // Thêm displayTitle và courseId

  // Dữ liệu cho FlatList khi ở chế độ hiển thị bảng chữ cái
  const alphabetDisplayData = useMemo((): KanaDisplayItem[] => {
    if (!isAlphabetTopic) return [];
    return fullKanaChartData.map((char, index) => ({
      id: `${activeSegment}-${char.romaji}-${index}`, // Key duy nhất
      kana: activeSegment === 'Hira' ? char.hiragana : char.katakana,
      romaji: char.romaji,
    }));
  }, [isAlphabetTopic, activeSegment]);

  // itemsForDisplay cho các chủ đề thông thường (từ API)
  const apiItemsForDisplay = useMemo(() => {
    if (isAlphabetTopic) return []; // Nếu là bảng chữ cái thì không dùng cái này
    return allScreenItems; // Hiện tại không có filter Hira/Kata cho API data ở đây nữa
    // vì segment control chỉ dành cho bảng chữ cái
  }, [allScreenItems, isAlphabetTopic]);

  // Kiểm tra params ban đầu (giữ nguyên)
  if (!courseId || !initialTopicTitle) {
    // ... (như cũ) ...
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Lỗi: Thiếu thông tin chủ đề.</Text>
      </SafeAreaView>
    );
  }

  // handleLessonPress cho các mục từ API (giữ nguyên)
  const handleLessonPress = (item: Lesson) => {
    // ... (như cũ) ...
    const lessonNameLower = (item.lesson_name || '').toLowerCase();
    const targetLessonId = item.lesson_code.toString();
    const targetLessonName = item.lesson_name;

    if (lessonNameLower.includes('lý thuyết')) {
      navigation.navigate('ContentsLyThuyetScreen', {
        lessonCode: targetLessonId,
        lessonName: targetLessonName,
      });
    } else {
    }
  };

  // renderItem cho các mục từ API (giữ nguyên)
  const renderApiItem = ({item, index}: {item: Lesson; index: number}) => {
    // ... hàm renderScreenItemWithCorrectIndex của bạn có thể đặt tên lại là renderApiItem
    // và sử dụng logic đếm index của nó ...
    // Ví dụ đơn giản:
    let displayIndex = '';
    const itemNameLower = item.lesson_name.toLowerCase();

    if (itemNameLower.includes('lý thuyết')) {
      displayIndex = 'Lý thuyết';
    } else if (itemNameLower.includes('kiểm tra')) {
      displayIndex = 'Kiểm tra';
    } else {
      let lessonCounter = 0;
      for (let i = 0; i < index; i++) {
        if (
          allScreenItems[i] &&
          !allScreenItems[i].lesson_name.toLowerCase().includes('lý thuyết') &&
          !allScreenItems[i].lesson_name.toLowerCase().includes('kiểm tra')
        ) {
          lessonCounter++;
        }
      }
      displayIndex = `Bài ${lessonCounter + 1}`;
    }
    return (
      <TouchableOpacity
        style={styles.lessonItemContainer}
        onPress={() => handleLessonPress(item)}>
        <Text style={styles.lessonNumberText}>{displayIndex}</Text>
        <View style={styles.lessonInfoContainer}>
          <Text style={styles.lessonNameText} numberOfLines={1}>
            {item.lesson_name}
          </Text>
        </View>
        <LessonStatusIcon status={item.status} />
      </TouchableOpacity>
    );
  };

  // renderItem MỚI cho bảng chữ cái
  const renderAlphabetCharacterItem = ({item}: {item: KanaDisplayItem}) => (
    <View style={styles.kanaCharacterItem}>
      <Text style={styles.kanaCharacterText}>{item.kana}</Text>
      <Text style={styles.kanaRomajiText}>{item.romaji}</Text>
    </View>
  );

  const showSegmentControl = isAlphabetTopic; // Segment control chỉ hiển thị cho bảng chữ cái

  const handleRetryFetch = async () => {
    if (!isAlphabetTopic && !isNaN(currentTopicIdAsNumber)) {
      // Chỉ retry nếu không phải bảng chữ cái
      const storedUserId = await AsyncStorage.getItem('UserId');
      if (storedUserId) fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
      else setError('Không tìm thấy UserId. Không thể thử lại.');
    }
  };

  if (isLoading) {
    // ... (return JSX cho isLoading giữ nguyên như code bạn cung cấp) ...
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header tối giản khi loading */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>
          <View style={{width: SIZES.padding * 4}} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !isAlphabetTopic) {
    // Chỉ hiển thị lỗi API nếu không phải là bảng chữ cái
    // ... (return JSX cho error giữ nguyên như code bạn cung cấp) ...
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
          </View>
          <View style={{width: SIZES.padding * 4}} />
        </View>
        <View style={styles.errorDisplayContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={handleRetryFetch}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.15}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {displayTitle}
              </Text>
            </View>
            {showSegmentControl ? ( // Nút Hira/Kata chỉ hiển thị khi là bảng chữ cái
              <View style={styles.segmentControlContainer}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    activeSegment === 'Hira' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setActiveSegment('Hira')}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      activeSegment === 'Hira' &&
                        styles.segmentButtonTextActive,
                    ]}>
                    Hira
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    activeSegment === 'Kata' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setActiveSegment('Kata')}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      activeSegment === 'Kata' &&
                        styles.segmentButtonTextActive,
                    ]}>
                    Kata
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{width: SIZES.padding * 4}} /> // Placeholder giữ layout
            )}
          </View>

          {isAlphabetTopic ? (
            alphabetDisplayData.length > 0 ? (
              <FlatList
                key="alphabet-list"
                data={alphabetDisplayData}
                renderItem={renderAlphabetCharacterItem}
                keyExtractor={item => item.id}
                numColumns={5} // Ví dụ: 5 cột cho bảng chữ cái
                contentContainerStyle={styles.kanaListContentContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyLessonsContainer}>
                <Text style={styles.emptyLessonsText}>
                  Không có dữ liệu bảng chữ cái.
                </Text>
              </View>
            )
          ) : apiItemsForDisplay.length > 0 ? ( // Các chủ đề khác
            <FlatList
              data={apiItemsForDisplay}
              renderItem={renderApiItem} // Sử dụng renderApiItem (tên mới của renderScreenItemWithCorrectIndex)
              keyExtractor={item => `${item.lesson_code}-${item.lesson_name}`}
              style={styles.lessonsList}
              contentContainerStyle={styles.lessonsListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyLessonsContainer}>
              <Text style={styles.emptyLessonsText}>
                Chưa có nội dung nào cho chủ đề này.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (giữ nguyên phần lớn, thêm style cho kana item)
const styles = StyleSheet.create({
  // ... (tất cả style cũ của bạn giữ nguyên) ...
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: StatusBar.currentHeight || 20,
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.gray,
  },
  backButton: {
    paddingRight: SIZES.padding,
    paddingLeft: SIZES.padding * 0.5,
    paddingVertical: SIZES.padding * 0.5,
  },
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: SIZES.padding * 0.5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: SIZES.medium,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
    width: undefined /* Để tự động co dãn hoặc set giá trị cụ thể */,
  },
  segmentButton: {
    paddingHorizontal: SIZES.padding * 1.2,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.white,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2.0,
    elevation: 2,
  },
  segmentButtonText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  segmentButtonTextActive: {color: COLORS.white, fontWeight: 'bold'},
  lessonsList: {flex: 1},
  lessonsListContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 2,
  },
  lessonItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    paddingVertical: SIZES.padding * 1.3,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin * 1.2,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  lessonNumberText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.black,
    fontWeight: '700',
    marginRight: 10,
    minWidth: 50,
    textAlign: 'center',
  },
  lessonInfoContainer: {flex: 1, justifyContent: 'center'},
  lessonNameText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 2,
    fontWeight: '400',
  },
  lessonStatusImage: {width: 20, height: 20, marginLeft: SIZES.padding},
  emptyLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  emptyLessonsText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: SIZES.font, color: COLORS.gray},
  errorDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.red,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
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

  // Styles mới cho hiển thị bảng chữ cái
  kanaListContentContainer: {
    padding: SIZES.padding / 2,
    alignItems: 'flex-start', // Căn trái các dòng nếu không đủ item
  },
  kanaCharacterItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75, // Điều chỉnh padding cho vừa vặn
    margin: SIZES.padding / 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: (SIZES.width - SIZES.padding * 3) / 5 - SIZES.padding / 2, // Tính toán chiều rộng cho 5 cột, trừ đi padding
    height: (SIZES.width / 5) * 1.1, // Chiều cao tương đối
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
  },
  kanaCharacterText: {
    fontFamily: FONTS.h2?.fontFamily || 'System',
    fontSize: SIZES.h1 * 0.9, // Kích thước chữ Kana
    color: COLORS.black,
    marginBottom: 2,
  },
  kanaRomajiText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium * 0.9, // Kích thước chữ Romaji
    color: COLORS.gray,
  },
});

export default CourseDetailScreen;
