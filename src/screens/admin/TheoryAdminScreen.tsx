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
  Modal,
  Pressable,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import axios, {AxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message';
import {Video, VideoRef, OnLoadData} from 'react-native-video';

// --- Types cho API ---
interface ApiVocabularyItem {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  vocabularyUrl: string | null;
}

interface ApiGrammarItem {
  id: number;
  structure: string;
  explanation: string;
  example: string;
  urlAudio: string | null;
}

interface RequestVocabularyDTO {
  id?: number;
  word: string;
  meaning: string;
  pronunciation: string;
  urlAudio: string;
}

interface RequestGrammarDTO {
  id?: number;
  structure: string;
  explanation: string;
  example: string;
  urlAudio?: string;
}

const API_ADMIN_THEORY_BASE_URL = 'http://10.0.2.2:8080/api/admin/theory';

// --- Ảnh Icons ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const THEORY_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');

type TheoryAdminScreenRouteProp = RouteProp<RootStackParamList, 'TheoryAdmin'>;
type TheoryAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TheoryAdmin'
>;

type FormDataType = RequestVocabularyDTO | RequestGrammarDTO;

interface AddEditItemModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  itemType: 'vocabulary' | 'grammar';
  initialData?: FormDataType | null;
  onClose: () => void;
  onSubmit: (data: FormDataType) => Promise<void>;
  isSubmitting: boolean;
}

const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  visible,
  mode,
  itemType,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [vocabUrlAudio, setVocabUrlAudio] = useState(''); // State cho URL audio của vocab

  const [structure, setStructure] = useState('');
  const [explanation, setExplanation] = useState('');
  const [example, setExample] = useState('');
  const [grammarUrlAudio, setGrammarUrlAudio] = useState(''); // State cho URL audio của grammar

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        if (itemType === 'vocabulary') {
          const vocab = initialData as RequestVocabularyDTO;
          setWord(vocab.word || '');
          setMeaning(vocab.meaning || '');
          setPronunciation(vocab.pronunciation || '');
          setVocabUrlAudio(vocab.urlAudio || ''); // Sử dụng urlAudio từ initialData
        } else {
          const grammar = initialData as RequestGrammarDTO;
          setStructure(grammar.structure || '');
          setExplanation(grammar.explanation || '');
          setExample(grammar.example || '');
          setGrammarUrlAudio(grammar.urlAudio || '');
        }
      } else {
        setWord('');
        setMeaning('');
        setPronunciation('');
        setVocabUrlAudio('');
        setStructure('');
        setExplanation('');
        setExample('');
        setGrammarUrlAudio('');
      }
    }
  }, [visible, mode, initialData, itemType]);

  const handleSubmit = () => {
    if (isSubmitting) return;
    let dataToSubmit: FormDataType;

    if (itemType === 'vocabulary') {
      if (
        !word.trim() ||
        !meaning.trim() ||
        !pronunciation.trim() ||
        !vocabUrlAudio.trim()
      ) {
        Alert.alert(
          'Lỗi',
          'Vui lòng điền đầy đủ thông tin từ vựng, bao gồm cả URL Audio.',
        );
        return;
      }
      dataToSubmit = {
        id: initialData?.id,
        word: word.trim(),
        meaning: meaning.trim(),
        pronunciation: pronunciation.trim(),
        urlAudio: vocabUrlAudio.trim(),
      };
      console.log('Submitting Vocabulary Data (Modal Form):', dataToSubmit);
    } else {
      if (!structure.trim() || !explanation.trim() || !example.trim()) {
        Alert.alert(
          'Lỗi',
          'Vui lòng điền đầy đủ cấu trúc, giải thích và ví dụ cho ngữ pháp.',
        );
        return;
      }
      // urlAudio cho grammar có thể rỗng, không cần trim nếu rỗng
      dataToSubmit = {
        id: initialData?.id,
        structure: structure.trim(),
        explanation: explanation.trim(),
        example: example.trim(),
        urlAudio: grammarUrlAudio ? grammarUrlAudio.trim() : '',
      };
      console.log('Submitting Grammar Data (Modal Form):', dataToSubmit);
    }
    onSubmit(dataToSubmit);
  };

  const modalTitle =
    mode === 'add'
      ? `Thêm ${itemType === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} mới`
      : `Chỉnh sửa ${itemType === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}`;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={formModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={formModalStyles.modalViewContainer}
          onPress={() => Keyboard.dismiss()}
          accessible={false}>
          <View style={formModalStyles.modalViewContent}>
            <View style={formModalStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={formModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={formModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={formModalStyles.headerTitle}>{modalTitle}</Text>
              <View style={{width: 30}} />
            </View>
            <ScrollView
              style={formModalStyles.formContainer}
              keyboardShouldPersistTaps="handled">
              {itemType === 'vocabulary' ? (
                <>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Từ <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={word}
                      onChangeText={setWord}
                      placeholder="Nhập từ vựng"
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Nghĩa <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={meaning}
                      onChangeText={setMeaning}
                      placeholder="Nhập nghĩa của từ"
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Phát âm{' '}
                      <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={pronunciation}
                      onChangeText={setPronunciation}
                      placeholder="Nhập cách phát âm"
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      URL Audio{' '}
                      <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={vocabUrlAudio}
                      onChangeText={setVocabUrlAudio}
                      placeholder="Nhập URL âm thanh"
                      editable={!isSubmitting}
                      keyboardType="url"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Cấu trúc{' '}
                      <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={structure}
                      onChangeText={setStructure}
                      placeholder="Nhập cấu trúc ngữ pháp"
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Giải thích{' '}
                      <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={explanation}
                      onChangeText={setExplanation}
                      placeholder="Nhập giải thích"
                      multiline
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>
                      Ví dụ <Text style={formModalStyles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={example}
                      onChangeText={setExample}
                      placeholder="Nhập ví dụ"
                      multiline
                      editable={!isSubmitting}
                    />
                  </View>
                  <View style={formModalStyles.inputGroup}>
                    <Text style={formModalStyles.label}>URL Audio</Text>
                    <TextInput
                      style={formModalStyles.input}
                      value={grammarUrlAudio}
                      onChangeText={setGrammarUrlAudio}
                      placeholder="Nhập URL âm thanh (nếu có)"
                      editable={!isSubmitting}
                      keyboardType="url"
                    />
                  </View>
                </>
              )}
              <TouchableOpacity
                style={[
                  formModalStyles.submitButton,
                  isSubmitting && formModalStyles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={formModalStyles.submitButtonText}>
                    {mode === 'add' ? 'Thêm' : 'Lưu'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const formModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalViewContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    height: SIZES.height * 0.75,
  },
  modalViewContent: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? SIZES.padding * 2 : SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {padding: 5},
  backIcon: {width: 22, height: 22, tintColor: '#555'},
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  formContainer: {paddingHorizontal: 20, paddingTop: 10},
  inputGroup: {marginBottom: 15},
  label: {fontSize: 15, color: '#444', marginBottom: 6, fontWeight: '500'},
  requiredStar: {color: 'red'},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: COLORS.primary || '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  submitButtonText: {color: 'white', fontSize: 17, fontWeight: 'bold'},
  submitButtonDisabled: {backgroundColor: COLORS.gray},
});

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
  const [isDeletingItemId, setIsDeletingItemId] = useState<number | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<FormDataType | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const audioRef = useRef<VideoRef>(null);
  const [audioURLToPlay, setAudioUrlToPlayState] = useState<string | null>(
    null,
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioUrlToPlayRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const currentTopicId = useMemo(() => {
    const id = Number(topicCodeFromRoute);
    return isNaN(id) ? null : id;
  }, [topicCodeFromRoute]);
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
    async (topicId: number) => {
      if (!isMountedRef.current) return;
      setIsLoadingVocab(true);
      setVocabError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiVocabularyItem[]>(
          `${API_ADMIN_THEORY_BASE_URL}/vocabulary/by-topic?topicId=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) setVocabularies(response.data || []);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Không thể tải từ vựng.';
        setVocabError(msg);
        showMessage({message: msg, type: 'danger'});
        setVocabularies([]);
      } finally {
        if (isMountedRef.current) setIsLoadingVocab(false);
      }
    },
    [getToken],
  );

  const fetchGrammars = useCallback(
    async (topicId: number) => {
      if (!isMountedRef.current) return;
      setIsLoadingGrammar(true);
      setGrammarError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiGrammarItem[]>(
          `${API_ADMIN_THEORY_BASE_URL}/grammar/by-topic?topicId=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) setGrammars(response.data || []);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Không thể tải ngữ pháp.';
        setGrammarError(msg);
        showMessage({message: msg, type: 'danger'});
        setGrammars([]);
      } finally {
        if (isMountedRef.current) setIsLoadingGrammar(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (currentTopicId !== null) {
      if (activeTab === 'vocabulary') fetchVocabularies(currentTopicId);
      else fetchGrammars(currentTopicId);
    } else {
      setVocabularies([]);
      setGrammars([]);
      const errMsg = 'ID chủ đề không hợp lệ.';
      setVocabError(errMsg);
      setGrammarError(errMsg);
      showMessage({message: errMsg, type: 'warning'});
    }
  }, [currentTopicId, activeTab, fetchVocabularies, fetchGrammars]);

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
        if (isMountedRef.current) setAudioUrlToPlayState(audioUrlToPlayParam);
      }, 50);
    },
    [isAudioPlaying],
  );

  const handleOpenAddItemModal = () => {
    setModalMode('add');
    setEditingItem(null);
    setIsItemModalVisible(true);
  };

  const handleOpenEditItemModal = (
    item: ApiVocabularyItem | ApiGrammarItem,
  ) => {
    setModalMode('edit');
    if (activeTab === 'vocabulary') {
      const vocab = item as ApiVocabularyItem;
      setEditingItem({
        // Dùng RequestVocabularyDTO để edit
        id: vocab.id,
        word: vocab.word,
        meaning: vocab.meaning,
        pronunciation: vocab.pronunciation,
        urlAudio: vocab.vocabularyUrl || '', // Map vocabularyUrl từ GET response sang urlAudio cho form
      });
    } else {
      const grammar = item as ApiGrammarItem;
      setEditingItem({
        // Dùng RequestGrammarDTO để edit
        id: grammar.id,
        structure: grammar.structure,
        explanation: grammar.explanation,
        example: grammar.example,
        urlAudio: grammar.urlAudio || '', // Giữ nguyên urlAudio
      });
    }
    setIsItemModalVisible(true);
  };

  const handleSaveItem = useCallback(
    async (formData: FormDataType) => {
      if (currentTopicId === null) {
        showMessage({message: 'ID chủ đề không hợp lệ.', type: 'danger'});
        return;
      }
      if (!isMountedRef.current) return;
      setIsSubmittingItem(true);
      try {
        const token = await getToken();
        let url = '';
        let method: 'post' | 'put' = 'post';
        let dataToSend: any = {...formData};
        let successMessage = '';

        console.log(
          `Đang lưu ${activeTab} ở chế độ ${modalMode}. Dữ liệu gửi đi:`,
          JSON.stringify(dataToSend, null, 2),
        );

        if (activeTab === 'vocabulary') {
          const vocabData = dataToSend as RequestVocabularyDTO;
          if (!vocabData.urlAudio || vocabData.urlAudio.trim() === '') {
            showMessage({
              message: 'URL Audio cho từ vựng không được để trống.',
              type: 'danger',
            });
            setIsSubmittingItem(false);
            return;
          }
          if (modalMode === 'add') {
            url = `${API_ADMIN_THEORY_BASE_URL}/vocabulary/create?topicId=${currentTopicId}`;
            method = 'post';
            successMessage = 'Thêm từ vựng thành công!';
            delete vocabData.id;
          } else {
            url = `${API_ADMIN_THEORY_BASE_URL}/vocabulary/update`;
            method = 'put';
            successMessage = 'Cập nhật từ vựng thành công!';
            if (!vocabData.id) {
              throw new Error('ID từ vựng là bắt buộc để cập nhật.');
            }
          }
          dataToSend = vocabData;
        } else {
          // grammar
          const grammarData = dataToSend as RequestGrammarDTO;
          if (modalMode === 'add') {
            url = `${API_ADMIN_THEORY_BASE_URL}/grammar/create?topicId=${currentTopicId}`;
            method = 'post';
            successMessage = 'Thêm ngữ pháp thành công!';
            delete grammarData.id;
          } else {
            url = `${API_ADMIN_THEORY_BASE_URL}/grammar/update`;
            method = 'post'; // Theo controller backend
            successMessage = 'Cập nhật ngữ pháp thành công!';
            if (!grammarData.id) {
              throw new Error('ID ngữ pháp là bắt buộc để cập nhật.');
            }
          }
          dataToSend = grammarData;
        }

        await axios({
          method,
          url,
          data: dataToSend,
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!isMountedRef.current) return;
        showMessage({message: successMessage, type: 'success'});
        setIsItemModalVisible(false);
        setEditingItem(null);
        if (activeTab === 'vocabulary') fetchVocabularies(currentTopicId);
        else fetchGrammars(currentTopicId);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        console.error(
          `Lỗi khi ${modalMode === 'add' ? 'thêm' : 'sửa'} ${activeTab}:`,
          err.response?.data || err.message || err,
        );
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          'Thao tác thất bại.';
        showMessage({message: msg, type: 'danger', duration: 4000});
      } finally {
        if (isMountedRef.current) setIsSubmittingItem(false);
      }
    },
    [
      activeTab,
      modalMode,
      currentTopicId,
      getToken,
      fetchVocabularies,
      fetchGrammars,
    ],
  );

  const handleDeleteItem = async (item: ApiVocabularyItem | ApiGrammarItem) => {
    if (currentTopicId === null) {
      showMessage({message: 'ID chủ đề không hợp lệ.', type: 'danger'});
      return;
    }
    const isVocab = activeTab === 'vocabulary';
    const itemId = item.id;
    const itemName = isVocab
      ? (item as ApiVocabularyItem).word
      : (item as ApiGrammarItem).structure;
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa "${itemName}" không?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!isMountedRef.current) return;
            setIsDeletingItemId(itemId);
            try {
              const token = await getToken();
              let url = '';
              if (isVocab)
                url = `${API_ADMIN_THEORY_BASE_URL}/vocabulary/delete?vocabularyId=${itemId}`;
              else
                url = `${API_ADMIN_THEORY_BASE_URL}/grammar/delete?grammarId=${itemId}`;
              const response = await axios.delete(url, {
                headers: {Authorization: `Bearer ${token}`},
                responseType: 'text',
              });
              if (!isMountedRef.current) return;
              showMessage({
                message:
                  response.data ||
                  `${isVocab ? 'Từ vựng' : 'Ngữ pháp'} đã được xóa.`,
                type: 'success',
              });
              if (isVocab) fetchVocabularies(currentTopicId);
              else fetchGrammars(currentTopicId);
            } catch (err: any) {
              if (!isMountedRef.current) return;
              const msg = err.response?.data || err.message || `Không thể xóa.`;
              showMessage({message: msg, type: 'danger'});
            } finally {
              if (isMountedRef.current) setIsDeletingItemId(null);
            }
          },
        },
      ],
    );
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
          {item.vocabularyUrl && (
            <TouchableOpacity
              style={styles.audioButtonVocabItem}
              onPress={() => playSound(item.vocabularyUrl)}>
              <Image source={AUDIO_PLAY_ICON} style={styles.audioIconSmall} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenEditItemModal(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item)}
            disabled={isDeletingItemId === item.id}>
            {isDeletingItemId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [playSound, isDeletingItemId, handleOpenEditItemModal, handleDeleteItem],
  );

  const renderGrammarItem = useCallback(
    ({item}: {item: ApiGrammarItem}) => (
      <View style={styles.listItem}>
        <Image source={THEORY_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.grammarLabelText}>
            Cấu trúc:{' '}
            <Text style={styles.grammarValueText}>{item.structure}</Text>
          </Text>
          <Text style={styles.grammarLabelText}>
            Giải thích:{' '}
            <Text style={styles.grammarValueText} numberOfLines={2}>
              {item.explanation}
            </Text>
          </Text>
          <Text style={styles.grammarLabelText}>
            Ví dụ:{' '}
            <Text style={styles.grammarValueText} numberOfLines={3}>
              {item.example}
            </Text>
          </Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          {item.urlAudio && (
            <TouchableOpacity
              style={styles.audioButtonVocabItem}
              onPress={() => playSound(item.urlAudio)}>
              <Image source={AUDIO_PLAY_ICON} style={styles.audioIconSmall} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenEditItemModal(item)}>
            <Image source={EDIT_ICON_ACTION} style={styles.actionIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item)}
            disabled={isDeletingItemId === item.id}>
            {isDeletingItemId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Image source={DELETE_ICON_ACTION} style={styles.actionIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    ),
    [playSound, isDeletingItemId, handleOpenEditItemModal, handleDeleteItem],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainHeader}>
        <TouchableOpacity style={styles.headerButton} disabled>
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
          onPress={handleOpenAddItemModal}
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
            if (isMountedRef.current) {
              setIsAudioLoading(true);
              setAudioError('');
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
              console.error('TheoryAdmin Audio Error:', videoError);
              setAudioError('Lỗi phát audio.');
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

      {isItemModalVisible && (
        <AddEditItemModal
          visible={isItemModalVisible}
          mode={modalMode}
          itemType={activeTab}
          initialData={editingItem}
          onClose={() => {
            setIsItemModalVisible(false);
            setEditingItem(null);
          }}
          onSubmit={handleSaveItem}
          isSubmitting={isSubmittingItem}
        />
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
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
  grammarLabelText: {
    fontSize: 14,
    color: COLORS.darkGray || '#555',
    fontWeight: '600',
    marginTop: 3,
  }, // Đổi fontWeight thành 600
  grammarValueText: {
    fontSize: 14,
    color: '#444444',
    fontWeight: 'normal',
    flexShrink: 1,
    lineHeight: 18,
  },
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  audioButtonVocabItem: {paddingHorizontal: 5},
  audioIconSmall: {width: 22, height: 22},
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
