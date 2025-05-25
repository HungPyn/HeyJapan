// src/screens/admin/TheoryAdminScreen.tsx
import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  // Keyboard, // Bỏ Keyboard nếu không còn dùng trong modal (hiện tại modal chỉ là Alert)
  Modal,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
// import axios from 'axios'; // Bỏ axios nếu không còn dùng
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message';
import {Video, VideoRef, OnLoadData, OnProgressData} from 'react-native-video';

// --- BEGIN: Định nghĩa Type cho API Theory ---
interface ApiVocabularyItem {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  vocabulary_audio_url: string | null;
}

interface ApiGrammarItem {
  id: number;
  structure: string;
  explanation: string;
  example: string;
}

// Không cần khai báo API_ADMIN_THEORY_BASE_URL, VOCAB_ENDPOINT, GRAMMAR_ENDPOINT nữa nếu dùng fake data
// const API_ADMIN_THEORY_BASE_URL = 'http://10.0.2.2:8080/api/admin/theory';
// const VOCAB_ENDPOINT = `${API_ADMIN_THEORY_BASE_URL}/vocabulary/by-topic`;
// const GRAMMAR_ENDPOINT = `${API_ADMIN_THEORY_BASE_URL}/grammar/by-topic`;
// --- END: Định nghĩa Type cho API Theory ---

// --- BEGIN: Đường dẫn tới ảnh Icons ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const THEORY_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');

// --- Dữ liệu mẫu ---
const sampleVocabularyData: ApiVocabularyItem[] = [
  {
    id: 5,
    word: '土',
    meaning: 'đất',
    pronunciation: 'tsuchi',
    vocabulary_audio_url:
      'https://file-examples.com/storage/fe8bdcaf716586995962130/2017/11/file_example_MP3_700KB.mp3', // URL mẫu để test
  },
  {
    id: 6,
    word: '水',
    meaning: 'nước',
    pronunciation: 'mizu',
    vocabulary_audio_url: null,
  },
  {
    id: 7,
    word: '火',
    meaning: 'lửa',
    pronunciation: 'hi',
    vocabulary_audio_url:
      'https://file-examples.com/storage/fe8bdcaf716586995962130/2017/11/file_example_MP3_1MG.mp3', // URL mẫu khác
  },
  {
    id: 8,
    word: '人',
    meaning: 'người',
    pronunciation: 'hito',
    vocabulary_audio_url: null,
  },
];

const sampleGrammarData: ApiGrammarItem[] = [
  {
    id: 5,
    structure: '～そうだ',
    explanation: 'Trông có vẻ (màn này dữ liệu fix cứng)',
    example:
      '雨が降りそうです (Ame ga furisou desu - Trông có vẻ trời sắp mưa)',
  },
  {
    id: 6,
    structure: '～なければならない',
    explanation: 'Phải (làm gì đó)',
    example:
      '宿題をしなければなりません (Shukudai o shinakereba narimasen - Phải làm bài tập về nhà)',
  },
  {
    id: 7,
    structure: '～ことができる',
    explanation: 'Có thể (làm gì đó)',
    example:
      '日本語を話すことができます (Nihongo o hanasu koto ga dekimasu - Tôi có thể nói tiếng Nhật)',
  },
];

// --- Component TheoryAdminScreen ---
type TheoryAdminScreenRouteProp = RouteProp<RootStackParamList, 'TheoryAdmin'>;
type TheoryAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TheoryAdmin'
>;

const TheoryAdminScreen = () => {
  const route = useRoute<TheoryAdminScreenRouteProp>();
  const navigation = useNavigation<TheoryAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {topic_code: topicCodeFromRoute, title: topicTitleFromRoute} =
    route.params;

  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar'>(
    'vocabulary',
  );

  const [vocabularies, setVocabularies] = useState<ApiVocabularyItem[]>([]);
  const [grammars, setGrammars] = useState<ApiGrammarItem[]>([]);

  const [isLoadingVocab, setIsLoadingVocab] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);

  const currentTopicId = useMemo(() => {
    return String(topicCodeFromRoute);
  }, [topicCodeFromRoute]);

  // getToken không còn được gọi trực tiếp bởi fetch nữa, nhưng có thể cần cho CRUD sau này
  const getToken = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      showMessage({
        message: 'Lỗi xác thực, vui lòng đăng nhập lại.',
        type: 'danger',
      });
      logout();
      throw new Error('Token not found');
    }
    return token;
  }, [logout]);

  const fetchVocabularies = useCallback(
    async (topicIdQuery: string) => {
      console.log(`Fake fetching vocabularies for topicId: ${topicIdQuery}`);
      setIsLoadingVocab(true);
      setVocabError(null);

      setTimeout(() => {
        // Lọc dữ liệu mẫu theo topicIdQuery nếu cần, hiện tại dùng toàn bộ sample data
        // Ví dụ: const filteredData = sampleVocabularyData.filter(v => v.id === Number(topicIdQuery));
        // setVocabularies(filteredData);
        setVocabularies(sampleVocabularyData);
        setIsLoadingVocab(false);
        showMessage({
          message: 'Đã tải dữ liệu Từ vựng (FAKE)',
          type: 'info',
          duration: 800,
        });
      }, 500);
    },
    [], // Không còn phụ thuộc getToken
  );

  const fetchGrammars = useCallback(
    async (topicIdQuery: string) => {
      console.log(`Fake fetching grammars for topicId: ${topicIdQuery}`);
      setIsLoadingGrammar(true);
      setGrammarError(null);

      setTimeout(() => {
        // Lọc dữ liệu mẫu theo topicIdQuery nếu cần
        // Ví dụ: const filteredData = sampleGrammarData.filter(g => g.id === Number(topicIdQuery));
        // setGrammars(filteredData);
        setGrammars(sampleGrammarData);
        setIsLoadingGrammar(false);
        showMessage({
          message: 'Đã tải dữ liệu Ngữ pháp (FAKE)',
          type: 'info',
          duration: 800,
        });
      }, 500);
    },
    [], // Không còn phụ thuộc getToken
  );

  useEffect(() => {
    if (currentTopicId) {
      fetchVocabularies(currentTopicId);
      fetchGrammars(currentTopicId);
    } else {
      setVocabularies([]);
      setGrammars([]);
      setVocabError('Không có ID chủ đề để tải từ vựng.');
      setGrammarError('Không có ID chủ đề để tải ngữ pháp.');
    }
  }, [currentTopicId, fetchVocabularies, fetchGrammars]);

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

  const handleAddNewItem = () => {
    const type = activeTab === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp';
    Alert.alert(
      'Thông báo',
      `Chức năng "Thêm mới ${type}" sẽ được cập nhật sau.`,
    );
  };

  const handleEditItem = (item: ApiVocabularyItem | ApiGrammarItem) => {
    const type = 'word' in item ? 'Từ vựng' : 'Ngữ pháp';
    Alert.alert('Thông báo', `Chức năng "Sửa ${type}" sẽ được cập nhật sau.`);
  };

  const handleDeleteItem = (item: ApiVocabularyItem | ApiGrammarItem) => {
    const type = 'word' in item ? 'Từ vựng' : 'Ngữ pháp';
    Alert.alert('Thông báo', `Chức năng "Xóa ${type}" sẽ được cập nhật sau.`);
  };

  const handleLogoutFromMenu = useCallback(async () => {
    setIsProfileMenuVisible(false);
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout]);

  const renderVocabularyItem = useCallback(
    ({item}: {item: ApiVocabularyItem}) => (
      <View style={styles.listItem}>
        <Image source={THEORY_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <View style={styles.vocabFirstLineContainer}>
            <Text style={styles.itemNameText} numberOfLines={1}>
              {item.word} {item.pronunciation ? `(${item.pronunciation})` : ''}
            </Text>
          </View>
          <Text style={styles.itemDetailText} numberOfLines={2}>
            {item.meaning}
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          {item.vocabulary_audio_url && (
            <TouchableOpacity
              style={styles.audioButtonVocabItem}
              onPress={() => playSound(item.vocabulary_audio_url)}>
              <Image source={AUDIO_PLAY_ICON} style={styles.audioIconSmall} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item)}>
            <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [playSound],
  );

  const renderGrammarItem = useCallback(
    ({item}: {item: ApiGrammarItem}) => (
      <View style={styles.listItem}>
        <Image source={THEORY_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemNameText} numberOfLines={2}>
            {item.explanation}: {item.structure}
          </Text>
          <Text style={styles.itemDetailText} numberOfLines={2}>
            {item.example}
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditItem(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item)}>
            <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainHeader}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => console.log('Logo pressed')}>
          <Image
            source={LOGO_ICON_HEADER}
            style={styles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.mainHeaderTitle}>JaVis</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON_HEADER}
            style={styles.headerIconMain}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backButtonSubHeader}
          onPress={() => navigation.goBack()}>
          <Image
            source={BACK_ARROW_ICON}
            style={styles.backIconSubHeader}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.topicTitleStyle} numberOfLines={1}>
          {topicTitleFromRoute || 'Quản lý Lý thuyết'}
        </Text>
        <View style={{width: 30}} />
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'vocabulary' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('vocabulary')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'vocabulary' && styles.tabTextActive,
            ]}>
            Từ vựng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'grammar' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('grammar')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'grammar' && styles.tabTextActive,
            ]}>
            Ngữ pháp
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addNewButtonContainer}>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewItem}
          activeOpacity={0.8}>
          <Text style={styles.addNewButtonText}>+ Thêm mới</Text>
        </TouchableOpacity>
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
            setIsAudioLoading(true);
            setAudioError('');
          }}
          onLoad={(data: OnLoadData) => {
            setIsAudioLoading(false);
            setIsAudioPlaying(true);
            audioRef.current?.seek(0);
          }}
          onProgress={(data: OnProgressData) => {
            // console.log("onProgress", data.currentTime);
          }}
          onEnd={() => {
            setIsAudioPlaying(false);
          }}
          onError={(videoError: any) => {
            console.error('TheoryAdmin Audio Error:', videoError);
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
      {audioError !== '' && (
        <Text style={styles.audioErrorText}>{audioError}</Text>
      )}

      {activeTab === 'vocabulary' ? (
        isLoadingVocab ? (
          <View style={styles.loadingContainerFull}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text>Đang tải từ vựng...</Text>
          </View>
        ) : vocabError ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.errorText}>{vocabError}</Text>
          </View>
        ) : vocabularies.length === 0 ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Chủ đề này chưa có từ vựng nào.
            </Text>
          </View>
        ) : (
          <FlatList
            data={vocabularies}
            renderItem={renderVocabularyItem}
            keyExtractor={item => `vocab-${item.id.toString()}`}
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : isLoadingGrammar ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text>Đang tải ngữ pháp...</Text>
        </View>
      ) : grammarError ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{grammarError}</Text>
        </View>
      ) : grammars.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Chủ đề này chưa có ngữ pháp nào.
          </Text>
        </View>
      ) : (
        <FlatList
          data={grammars}
          renderItem={renderGrammarItem}
          keyExtractor={item => `grammar-${item.id.toString()}`}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isProfileMenuVisible}
        onRequestClose={() => setIsProfileMenuVisible(false)}>
        <Pressable
          style={profileMenuStyles.backdrop}
          onPress={() => setIsProfileMenuVisible(false)}>
          <View style={profileMenuStyles.menuContainer}>
            <Pressable onPress={() => {}}>
              <TouchableOpacity
                style={profileMenuStyles.menuItem}
                onPress={handleLogoutFromMenu}>
                <Image
                  source={LOGOUT_ICON_MENU}
                  style={profileMenuStyles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={profileMenuStyles.menuText}>Đăng xuất</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background || '#FFFFFF'},
  mainHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingBottom: 10,
    height:
      Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 90,
  },
  headerButton: {padding: 5},
  headerIconMain: {width: 30, height: 30},
  mainHeaderTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#ECECEC',
    marginBottom: 0,
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {
    width: 20,
    height: 20,
    tintColor: COLORS.black || '#333333',
  },
  topicTitleStyle: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#000000',
    textAlign: 'left',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: COLORS.lightGray || '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
    height: 45,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.nenItemDam,
    borderBottomColor: COLORS.primary,
  },
  tabText: {fontSize: 16, color: COLORS.black || '#555555', fontWeight: '500'},
  tabTextActive: {color: COLORS.primary, fontWeight: 'bold'},
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginBottom: 12,
    marginTop: 5,
  },
  addNewButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingHorizontal: 18,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    height: 39,
    borderRadius: 5,
  },
  addNewButtonText: {color: COLORS.white, fontSize: 15, fontWeight: 'bold'},
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: COLORS.darkGray || '#777',
  },
  itemTextContainer: {flex: 1, justifyContent: 'center', marginRight: 8},
  itemNameText: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDetailText: {fontSize: 14, color: '#777777', lineHeight: 20},
  actionButtonsContainer: {flexDirection: 'row', alignItems: 'center'},
  actionButton: {padding: 6, marginLeft: 8},
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: COLORS.gray || '#888888',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {fontSize: 16, color: '#888888', textAlign: 'center'},
  loadingContainerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.red || 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  vocabFirstLineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Đẩy icon âm thanh sang phải
    alignItems: 'center',
    marginBottom: 2,
  },
  audioButtonVocabItem: {
    paddingLeft: 10, // Tạo khoảng cách với text
  },
  audioIconSmall: {
    width: 22, // Kích thước icon âm thanh nhỏ
    height: 22,
  },
  audioActivityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 70,
    zIndex: 100,
  },
  audioErrorText: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 70,
    color: COLORS.red,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    zIndex: 100,
  },
});
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 80,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {width: 20, height: 20, marginRight: 12, tintColor: '#555'},
  menuText: {fontSize: 16, color: '#333'},
});

export default TheoryAdminScreen;
