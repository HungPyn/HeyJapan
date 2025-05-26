// src/screens/courses/CourseDetailScreen.tsx
import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
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
  Platform,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
// SỬA Ở ĐÂY: Sử dụng CoursesStackParamList cho cả RouteProp và StackNavigationProp
// vì CourseDetailScreen và các màn hình nó điều hướng tới chủ yếu nằm trong CoursesStack
import {CoursesStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Image} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Video, VideoRef, OnLoadData} from 'react-native-video';
import {showMessage} from 'react-native-flash-message';
import {useAuth} from '../auth/AuthContext';

// --- Dữ liệu bảng chữ cái từ API ---
interface ApiAlphabetCharacter {
  id: number;
  urlAudio: string;
  alphabetType: 'HIRA' | 'KATA';
  alphabetCharacter: string;
  pronunciations: string;
}

interface KanaDisplayItem {
  id: string;
  kana: string;
  romaji: string;
  urlAudio: string | null;
}
// --- Kết thúc dữ liệu bảng chữ cái ---

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

// SỬA TYPE CHO ROUTE VÀ NAVIGATION PROP
type CourseDetailScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'CourseDetail'
>;
// Với type trên, navigation.navigate sẽ được kiểm tra dựa trên các màn hình có trong CoursesStackParamList

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
  const {logout} = useAuth();

  const {courseId, title: initialTopicTitle} = route.params || {};

  const [allScreenItems, setAllScreenItems] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<'Hira' | 'Kata'>('Hira');
  const [displayTitle, setDisplayTitle] = useState<string>(
    initialTopicTitle || 'Chi tiết chủ đề',
  );

  const [hiraganaChars, setHiraganaChars] = useState<ApiAlphabetCharacter[]>(
    [],
  );
  const [katakanaChars, setKatakanaChars] = useState<ApiAlphabetCharacter[]>(
    [],
  );
  const [isLoadingAlphabet, setIsLoadingAlphabet] = useState<boolean>(false);
  const [alphabetError, setAlphabetError] = useState<string | null>(null);

  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioErrorState, setAudioErrorState] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      if (isMountedRef.current) {
        showMessage({
          message: 'Lỗi xác thực hoặc phiên đã hết hạn.',
          type: 'danger',
        });
        logout();
      }
      throw new Error('Token not found');
    }
    return token;
  }, [logout]);

  const currentTopicIdAsNumber = useMemo(() => {
    if (typeof courseId === 'string' && courseId.trim() !== '') {
      const parsedId = parseInt(courseId, 10);
      return !isNaN(parsedId) ? parsedId : null;
    }
    return null;
  }, [courseId]);

  const isAlphabetTopic = useMemo(
    () => (displayTitle || '').toLowerCase() === 'bảng chữ cái',
    [displayTitle],
  );

  const fetchAlphabets = useCallback(
    async (topicIdToFetch: number) => {
      if (!isMountedRef.current) return;
      setIsLoadingAlphabet(true);
      setAlphabetError(null);
      try {
        const token = await getToken();

        const response = await axios.get<ApiAlphabetCharacter[]>(
          `http://10.0.2.2:8080/api/user/alphabets?topicId=${topicIdToFetch}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );

        if (isMountedRef.current) {
          if (response.data && Array.isArray(response.data)) {
            const hira: ApiAlphabetCharacter[] = [];
            const kata: ApiAlphabetCharacter[] = [];
            response.data.forEach(char => {
              if (char.alphabetType === 'HIRA') hira.push(char);
              else if (char.alphabetType === 'KATA') kata.push(char);
            });
            setHiraganaChars(hira);
            setKatakanaChars(kata);
          } else {
            setAlphabetError('Dữ liệu bảng chữ cái không hợp lệ.');
            setHiraganaChars([]);
            setKatakanaChars([]);
          }
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        console.error(
          'Lỗi tải bảng chữ cái:',
          err.response?.data || err.message,
        );
        if (err.message !== 'Token not found') {
          const msg =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải bảng chữ cái.';
          setAlphabetError(msg);
        }
        setHiraganaChars([]);
        setKatakanaChars([]);
      } finally {
        if (isMountedRef.current) setIsLoadingAlphabet(false);
      }
    },
    [getToken],
  );

  const fetchTopicDetails = useCallback(
    async (topicIdToFetch: number, userId: string) => {
      if (isNaN(topicIdToFetch) || !userId) {
        if (isMountedRef.current) {
          setError('ID chủ đề hoặc UserId không hợp lệ.');
          setIsLoading(false);
          setAllScreenItems([]);
        }
        return;
      }
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiTopicViewResponse>(
          `http://10.0.2.2:8080/api/user/topic/view?topicId=${topicIdToFetch}&idUser=${userId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) {
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
                  status:
                    apiLesson.isComplete === true ? 'completed' : 'pending',
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
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        if (err.message !== 'Token not found') {
          setError('Lỗi tải dữ liệu chi tiết chủ đề.');
        }
        console.error(
          'Fetch Topic Details Error:',
          err.response?.data || err.message,
        );
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [initialTopicTitle, getToken],
  );

  useEffect(() => {
    if (initialTopicTitle) {
      setDisplayTitle(initialTopicTitle);
    }
  }, [initialTopicTitle]);

  useEffect(() => {
    const loadData = async () => {
      if (!isMountedRef.current) return;
      const isAlphabet = (displayTitle || '').toLowerCase() === 'bảng chữ cái';

      if (isAlphabet) {
        if (currentTopicIdAsNumber !== null) {
          fetchAlphabets(currentTopicIdAsNumber);
        } else {
          if (isMountedRef.current)
            setAlphabetError('ID chủ đề bảng chữ cái không hợp lệ.');
        }
        if (isMountedRef.current) {
          setIsLoading(false);
          setAllScreenItems([]);
          setError(null);
        }
      } else if (currentTopicIdAsNumber !== null) {
        try {
          const storedUserId = await AsyncStorage.getItem('UserId');
          if (storedUserId) {
            fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
          } else {
            if (isMountedRef.current) {
              setError('Không tìm thấy UserId.');
              setIsLoading(false);
            }
          }
        } catch (e) {
          if (isMountedRef.current) {
            setError('Lỗi đọc UserId.');
            setIsLoading(false);
          }
        }
      } else if (courseId) {
        if (isMountedRef.current) {
          setError('ID chủ đề không hợp lệ.');
          setIsLoading(false);
        }
      } else {
        if (isMountedRef.current) setIsLoading(false);
      }
    };
    loadData();
  }, [
    currentTopicIdAsNumber,
    displayTitle,
    fetchTopicDetails,
    fetchAlphabets,
    courseId,
  ]);

  const playSound = useCallback(
    (audioUrlToPlayParam: string | null) => {
      if (!isMountedRef.current) return;
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
        if (isMountedRef.current) {
          setAudioUrlToPlayState(audioUrlToPlayParam);
        }
      }, 50);
    },
    [isAudioPlaying],
  );

  const alphabetDisplayData = useMemo((): KanaDisplayItem[] => {
    if (!isAlphabetTopic) return [];
    const sourceArray =
      activeSegment === 'Hira' ? hiraganaChars : katakanaChars;
    return sourceArray.map(char => ({
      id: String(char.id),
      kana: char.alphabetCharacter,
      romaji: char.pronunciations,
      urlAudio: char.urlAudio,
    }));
  }, [isAlphabetTopic, activeSegment, hiraganaChars, katakanaChars]);

  const apiItemsForDisplay = useMemo(() => {
    if (isAlphabetTopic) return [];
    return allScreenItems;
  }, [allScreenItems, isAlphabetTopic]);

  if (!courseId || !initialTopicTitle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Lỗi: Thiếu thông tin chủ đề.</Text>
      </SafeAreaView>
    );
  }

  const handleLessonPress = (item: Lesson) => {
    const lessonNameLower = (item.lesson_name || '').toLowerCase();
    const targetLessonId = item.lesson_code.toString();
    const targetLessonName = item.lesson_name;
    const topicCode = item.topic_code.toString();

    if (lessonNameLower.includes('lý thuyết')) {
      navigation.navigate('ContentsLyThuyetScreen', {
        topicId: topicCode,
        lessonName: targetLessonName,
      });
    } else if (lessonNameLower.includes('kiểm tra')) {
      navigation.navigate('ContentExam', {
        topicId: topicCode,
        lessonName: targetLessonName,
      });
    } else {
      navigation.navigate('ContentsScreen', {
        lessonCode: targetLessonId,
        lessonName: targetLessonName,
      });
    }
  };

  const renderApiItem = ({item, index}: {item: Lesson; index: number}) => {
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

  const renderAlphabetCharacterItem = ({item}: {item: KanaDisplayItem}) => (
    <TouchableOpacity
      style={styles.kanaCharacterItem}
      onPress={() => playSound(item.urlAudio)}
      activeOpacity={0.7}>
      <Text style={styles.kanaCharacterText}>{item.kana}</Text>
      <Text style={styles.kanaRomajiText}>{item.romaji}</Text>
    </TouchableOpacity>
  );

  const showSegmentControl = isAlphabetTopic;

  const handleRetryFetch = async () => {
    if (!isAlphabetTopic && currentTopicIdAsNumber !== null) {
      const storedUserId = await AsyncStorage.getItem('UserId');
      if (storedUserId) fetchTopicDetails(currentTopicIdAsNumber, storedUserId);
      else if (isMountedRef.current) setError('Không tìm thấy UserId.');
    } else if (isAlphabetTopic && currentTopicIdAsNumber !== null) {
      fetchAlphabets(currentTopicIdAsNumber);
    }
  };

  let currentContentIsLoading = isLoading;
  let currentContentError = error;
  let currentContentIsEmpty = apiItemsForDisplay.length === 0;
  let emptyTextMessage = 'Chưa có nội dung nào cho chủ đề này.';

  if (isAlphabetTopic) {
    currentContentIsLoading = isLoadingAlphabet;
    currentContentError = alphabetError;
    currentContentIsEmpty = alphabetDisplayData.length === 0;
    emptyTextMessage = 'Không có dữ liệu bảng chữ cái cho chủ đề này.';
  }

  if (currentContentIsLoading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentContentError) {
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
          <Text style={styles.errorText}>{currentContentError}</Text>
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
            {showSegmentControl ? (
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
              <View style={{width: SIZES.padding * 4}} />
            )}
          </View>

          {audioURLToPlay && (
            <Video
              ref={audioRef}
              source={{uri: audioURLToPlay}}
              paused={!isAudioPlaying}
              playInBackground={Platform.OS === 'ios'}
              playWhenInactive={Platform.OS === 'ios'}
              ignoreSilentSwitch="ignore"
              onLoadStart={() => {
                if (isMountedRef.current) {
                  setIsAudioLoading(true);
                  setAudioErrorState('');
                }
              }}
              onLoad={(data: OnLoadData) => {
                if (isMountedRef.current) {
                  setIsAudioLoading(false);
                  setIsAudioPlaying(true);
                  audioRef.current?.seek(0);
                }
              }}
              onEnd={() => {
                if (isMountedRef.current) setIsAudioPlaying(false);
              }}
              onError={(videoError: any) => {
                if (isMountedRef.current) {
                  console.error('CourseDetail Audio Error:', videoError);
                  setAudioErrorState('Lỗi phát audio.');
                  setIsAudioLoading(false);
                  setIsAudioPlaying(false);
                }
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
          {audioErrorState !== '' && (
            <Text style={styles.audioErrorText}>{audioErrorState}</Text>
          )}

          {isAlphabetTopic ? (
            alphabetDisplayData.length > 0 ? (
              <FlatList
                key="alphabet-list"
                data={alphabetDisplayData}
                renderItem={renderAlphabetCharacterItem}
                keyExtractor={item => item.id}
                numColumns={5}
                contentContainerStyle={styles.kanaListContentContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              !isLoadingAlphabet && (
                <View style={styles.emptyLessonsContainer}>
                  <Text style={styles.emptyLessonsText}>
                    {emptyTextMessage}
                  </Text>
                </View>
              )
            ) // Hiển thị chỉ khi không loading
          ) : apiItemsForDisplay.length > 0 ? (
            <FlatList
              data={apiItemsForDisplay}
              renderItem={renderApiItem}
              keyExtractor={item => `${item.lesson_code}-${item.lesson_name}`}
              style={styles.lessonsList}
              contentContainerStyle={styles.lessonsListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            !isLoading && (
              <View style={styles.emptyLessonsContainer}>
                <Text style={styles.emptyLessonsText}>{emptyTextMessage}</Text>
              </View>
            )
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: 15,
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
    width: undefined,
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
  kanaListContentContainer: {
    padding: SIZES.padding / 2,
    alignItems: 'center',
  },
  kanaCharacterItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 0.75,
    margin: SIZES.padding / 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: (SIZES.width - SIZES.padding * 3) / 5 - SIZES.padding / 2,
    height: (SIZES.width / 5) * 1.1,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 1.0,
  },
  kanaCharacterText: {
    fontFamily: FONTS.h2?.fontFamily || 'System',
    fontSize: SIZES.h1 * 0.9,
    color: COLORS.black,
    marginBottom: 2,
  },
  kanaRomajiText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium * 0.9,
    color: COLORS.gray,
  },
  audioActivityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    zIndex: 10,
  },
  audioErrorText: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    color: COLORS.red,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    zIndex: 10,
  },
});

export default CourseDetailScreen;
