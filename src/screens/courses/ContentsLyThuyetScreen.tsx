// src/screens/lessons/ContentsLyThuyetScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
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
  Image,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  Video,
  VideoRef,
  OnLoadData,
  OnBufferData,
  OnProgressData,
} from 'react-native-video'; // Thêm các type cho callback

import {CoursesStackParamList, RootStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- Định nghĩa kiểu dữ liệu ---
interface VocabularyItemAPI {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  vocabularyUrl: string | null;
}

interface GrammarItemAPI {
  id: number;
  structure: string;
  explanation: string;
  example: string;
  urlAudio: string | null;
}
// --- END Định nghĩa kiểu dữ liệu ---

type ContentsLyThuyetScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsLyThuyetScreen'
>;

type ContentsLyThuyetScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const ContentsLyThuyetScreen: React.FC = () => {
  const route = useRoute<ContentsLyThuyetScreenRouteProp>();
  const navigation = useNavigation<ContentsLyThuyetScreenNavigationProp>();

  const topicIdFromParam = route.params?.topicId;
  const lessonNameFromParam = route.params?.lessonName;

  const [activeContentType, setActiveContentType] = useState<
    'Từ vựng' | 'Ngữ pháp'
  >('Từ vựng');

  const [vocabularyData, setVocabularyData] = useState<VocabularyItemAPI[]>([]);
  const [grammarData, setGrammarData] = useState<GrammarItemAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioPlayerError, setAudioPlayerError] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!topicIdFromParam) {
        setError('Không tìm thấy ID chủ đề.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('Không tìm thấy token xác thực.');
          setLoading(false);
          Alert.alert('Lỗi', 'Bạn cần đăng nhập để xem nội dung này.');
          return;
        }
        const requestHttpHeaders = {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };
        let parsedTopicId: number;
        try {
          parsedTopicId =
            typeof topicIdFromParam === 'string'
              ? parseInt(topicIdFromParam, 10)
              : topicIdFromParam;
          if (isNaN(parsedTopicId)) {
            throw new Error('topicId không phải là số hợp lệ');
          }
        } catch (e: any) {
          setError('ID chủ đề không hợp lệ.');
          setLoading(false);
          return;
        }
        const vocabularyApiUrl = `http://10.0.2.2:8080/api/user/theory/vocabulary?topicId=${parsedTopicId}`;
        const grammarApiUrl = `http://10.0.2.2:8080/api/user/theory/grammar?topicId=${parsedTopicId}`;

        console.log('Fetching vocab from:', vocabularyApiUrl);
        console.log('Fetching grammar from:', grammarApiUrl);

        const [vocabResponse, grammarResponse] = await Promise.all([
          axios.get(vocabularyApiUrl, {headers: requestHttpHeaders}),
          axios.get(grammarApiUrl, {headers: requestHttpHeaders}),
        ]);

        console.log('Vocab data received:', vocabResponse.data);
        console.log('Grammar data received:', grammarResponse.data);

        if (vocabResponse.data) setVocabularyData(vocabResponse.data);
        if (grammarResponse.data) setGrammarData(grammarResponse.data);
      } catch (err: any) {
        const errorMessage =
          err.isAxiosError && err.message === 'Network Error'
            ? 'Lỗi mạng. Vui lòng kiểm tra kết nối, server, và cài đặt `usesCleartextTraffic` cho Android.'
            : `Lỗi ${err.response?.status || 'không xác định'}: ${
                err.response?.data?.message || err.message
              }`;
        setError(`Không thể tải dữ liệu. (${errorMessage})`);
        Alert.alert('Lỗi', `Không thể tải dữ liệu. (${errorMessage})`);
      } finally {
        setLoading(false);
      }
    };
    if (topicIdFromParam) fetchData();
    else {
      setError('Không tìm thấy ID chủ đề.');
      setLoading(false);
    }
  }, [topicIdFromParam]);

  const playSound = (audioUrlToPlayParam: string | null) => {
    console.log('[playSound] Called with URL:', audioUrlToPlayParam);
    if (!audioUrlToPlayParam) {
      console.log('[playSound] URL is null, resetting states.');
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
      console.log(
        '[playSound] Audio is currently playing and same URL clicked. Pausing.',
      );
      audioRef.current.pause();
      setIsAudioPlaying(false);
      return;
    }
    console.log(
      '[playSound] Setting new audio or replaying. Current requested URL:',
      audioUrlToPlayParam,
    );
    setAudioUrlToPlayState(null); // Reset để đảm bảo Video nhận source mới
    audioUrlToPlayRef.current = audioUrlToPlayParam;
    setTimeout(() => {
      console.log(
        '[playSound] setTimeout: Setting audioURLToPlay to:',
        audioUrlToPlayParam,
      );
      setAudioUrlToPlayState(audioUrlToPlayParam);
    }, 50);
  };

  const renderVocabularyItem = ({item}: {item: VocabularyItemAPI}) => (
    <View style={styles.vocabItemContainer}>
      <View style={styles.vocabTextContainer}>
        <Text style={styles.vocabJapanese}>{item.word}</Text>
        <View style={styles.vocabDetailRow}>
          <Text style={styles.vocabPronunciation}>{item.pronunciation}</Text>
          <Text style={styles.vocabMeaningInRow}> ({item.meaning})</Text>
        </View>
      </View>
      {item.vocabularyUrl && (
        <TouchableOpacity
          onPress={() => {
            console.log(
              `Play button clicked for vocab ID ${item.id}, URL: ${item.vocabularyUrl}`,
            );
            playSound(item.vocabularyUrl);
          }}
          style={styles.audioButton}>
          <Image
            source={require('../../assets/images/audioInconten.png')}
            style={styles.audioPlayIconStyle}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGrammarItem = ({item}: {item: GrammarItemAPI}) => (
    <View style={styles.grammarItemContainer}>
      <View style={{flex: 1}}>
        <Text style={styles.grammarStructure}>{item.structure}</Text>
        <Text style={styles.grammarExplanation}>
          <Text style={styles.grammarLabel}>Giải thích: </Text>
          {item.explanation}
        </Text>
        <Text style={styles.grammarExample}>
          <Text style={styles.grammarLabel}>Ví dụ: </Text>
          {item.example}
        </Text>
      </View>
    </View>
  );

  const headerDisplayTitle = lessonNameFromParam || 'Nội dung chủ đề';

  if (!topicIdFromParam || !lessonNameFromParam) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không có thông tin chủ đề để hiển thị.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.1}}
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
                {headerDisplayTitle}
              </Text>
            </View>
            <View style={styles.segmentControlContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeContentType === 'Từ vựng' && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveContentType('Từ vựng')}>
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeContentType === 'Từ vựng' &&
                      styles.segmentButtonTextActive,
                  ]}>
                  Từ vựng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeContentType === 'Ngữ pháp' &&
                    styles.segmentButtonActive,
                ]}
                onPress={() => setActiveContentType('Ngữ pháp')}>
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeContentType === 'Ngữ pháp' &&
                      styles.segmentButtonTextActive,
                  ]}>
                  Ngữ pháp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeContentType === 'Từ vựng' ? (
            vocabularyData.length > 0 ? (
              <FlatList
                data={vocabularyData}
                renderItem={renderVocabularyItem}
                keyExtractor={item => `vocab-${item.id.toString()}`}
                style={styles.contentList}
                contentContainerStyle={styles.contentListContent}
              />
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyContentText}>
                  Chưa có từ vựng cho chủ đề này.
                </Text>
              </View>
            )
          ) : grammarData.length > 0 ? (
            <FlatList
              data={grammarData}
              renderItem={renderGrammarItem}
              keyExtractor={item => `grammar-${item.id.toString()}`}
              style={styles.contentList}
              contentContainerStyle={styles.contentListContent}
            />
          ) : (
            <View style={styles.emptyContentContainer}>
              <Text style={styles.emptyContentText}>
                Chưa có nội dung ngữ pháp cho chủ đề này.
              </Text>
            </View>
          )}

          {audioURLToPlay && (
            <Video
              ref={audioRef}
              source={{uri: audioURLToPlay}}
              paused={!isAudioPlaying}
              volume={1.0}
              muted={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch={'ignore'}
              onLoadStart={() => {
                console.log('[Video] onLoadStart - URL:', audioURLToPlay);
                setIsAudioLoading(true);
                setAudioPlayerError('');
              }}
              onLoad={(data: OnLoadData) => {
                console.log(
                  '[Video] onLoad - Duration:',
                  data.duration,
                  'URL:',
                  audioURLToPlay,
                );
                setIsAudioLoading(false);
                setIsAudioPlaying(true); // Bắt đầu phát khi đã tải xong
              }}
              onEnd={() => {
                console.log('[Video] onEnd - URL:', audioURLToPlay);
                setIsAudioPlaying(false);
              }}
              onError={(errorData: any) => {
                // `any` vì cấu trúc lỗi có thể đa dạng
                console.error(
                  '[Video] onError - URL:',
                  audioURLToPlay,
                  'Error:',
                  JSON.stringify(errorData),
                );
                setAudioPlayerError('Lỗi khi phát audio.');
                setIsAudioLoading(false);
                setIsAudioPlaying(false);
              }}
              onBuffer={(bufferData: OnBufferData) => {
                console.log(
                  '[Video] onBuffer - Is Buffering:',
                  bufferData.isBuffering,
                  'URL:',
                  audioURLToPlay,
                );
                setIsAudioLoading(bufferData.isBuffering);
              }}
              onProgress={(progressData: OnProgressData) => {
                // Log này có thể rất nhiều, chỉ bật khi cần debug chi tiết
                // console.log('[Video] onProgress - Current Time:', progressData.currentTime, 'Playable Duration:', progressData.playableDuration);
              }}
              style={{height: 0, width: 0}} // Ẩn component
            />
          )}
          {isAudioLoading && (
            <ActivityIndicator
              style={styles.audioStatusIndicator}
              color={COLORS.primary}
            />
          )}
          {audioPlayerError ? (
            <Text style={styles.audioStatusErrorText}>{audioPlayerError}</Text>
          ) : null}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: 40,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    paddingRight: SIZES.padding,
    paddingLeft: 15,
    paddingVertical: SIZES.padding * 0.5,
    marginBottom: 4,
  },
  backButtonText: {
    fontSize: SIZES.xLarge * 2,
    color: COLORS.black,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  segmentControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
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
  segmentButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  contentList: {
    flex: 1,
  },
  contentListContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 2,
  },
  vocabItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  vocabTextContainer: {
    flex: 1,
    marginRight: SIZES.medium,
  },
  vocabJapanese: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.medium * 1.3,
    color: COLORS.black,
    marginBottom: 3,
    fontWeight: '900',
  },
  vocabDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  vocabPronunciation: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9,
    color: COLORS.darkGray,
    marginRight: SIZES.base,
  },
  vocabMeaningInRow: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9,
    color: COLORS.black,
    flexShrink: 1,
  },
  grammarItemContainer: {
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  grammarStructure: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.medium * 1.2,
    color: COLORS.black,
    marginBottom: SIZES.base,
    fontWeight: '700',
  },
  grammarLabel: {
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  grammarExplanation: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.4,
    marginBottom: SIZES.base * 0.5,
    textAlign: 'justify',
  },
  grammarExample: {
    fontStyle: 'italic',
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.font * 1.4,
    textAlign: 'justify',
  },
  lessonStatusImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
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
  audioButton: {
    padding: SIZES.base / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayIconStyle: {
    width: 28,
    height: 28,
  },
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

export default ContentsLyThuyetScreen;
