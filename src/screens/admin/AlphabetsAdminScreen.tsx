// src/screens/admin/AlphabetsAdminScreen.tsx
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
  ScrollView, // Thêm ScrollView
  TextInput, // Thêm TextInput
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, SIZES} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message';
import {Video, VideoRef, OnLoadData} from 'react-native-video';
import {Picker} from '@react-native-picker/picker'; // Thêm Picker

// --- DTO Interface (đặt ở đây vì modal giờ nằm trong file này) ---
export interface RequestAlphabetDTOClient {
  id?: number;
  urlAudio: string;
  alphabetType: 'HIRA' | 'KATA';
  pronunciations: string;
  alphabetCharacter: string;
  topic: number;
}

// --- API Interface ---
interface ApiAlphabetItem {
  id: number;
  urlAudio: string | null;
  alphabetType: 'HIRA' | 'KATA';
  pronunciations: string;
  alphabetCharacter: string;
}

const API_ADMIN_ALPHABETS_URL = 'http://10.0.2.2:8080/api/admin/alphabets';

// --- Icons ---
const LOGO_ICON_HEADER = require('../../assets/images/Logo.png');
const PROFILE_ICON_HEADER = require('../../assets/images/IconUserHeader.png');
const LOGOUT_ICON_MENU = require('../../assets/images/logout.png');
const BACK_ARROW_ICON = require('../../assets/images/IconBack.png');
const ALPHABET_ITEM_ICON = require('../../assets/images/ngoiSao.png');
const AUDIO_PLAY_ICON = require('../../assets/images/audioInconten.png');
const EDIT_ICON_ACTION = require('../../assets/images/chinhSua.png');
const DELETE_ICON_ACTION = require('../../assets/images/iconThungRac.png');

// --- Props cho Modal (đặt ở đây) ---
interface AddEditAlphabetModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialData?: RequestAlphabetDTOClient | null;
  onClose: () => void;
  onSubmit: (data: RequestAlphabetDTOClient) => Promise<void>;
  isSubmitting: boolean;
  currentTopicId: number | null;
}

// --- Component AddEditAlphabetModal (định nghĩa trực tiếp trong file) ---
const AddEditAlphabetModal: React.FC<AddEditAlphabetModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  currentTopicId,
}) => {
  const [alphabetCharacter, setAlphabetCharacter] = useState('');
  const [pronunciations, setPronunciations] = useState('');
  const [urlAudio, setUrlAudio] = useState('');
  const [alphabetType, setAlphabetType] = useState<'HIRA' | 'KATA'>('HIRA');

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setAlphabetCharacter(initialData.alphabetCharacter || '');
        setPronunciations(initialData.pronunciations || '');
        setUrlAudio(initialData.urlAudio || '');
        setAlphabetType(initialData.alphabetType || 'HIRA');
      } else {
        setAlphabetCharacter('');
        setPronunciations('');
        setUrlAudio('');
        setAlphabetType('HIRA');
      }
    }
  }, [visible, mode, initialData]);

  const handleSubmitLocal = () => {
    // Đổi tên để tránh trùng với prop
    if (isSubmitting) return;
    if (!currentTopicId) {
      Alert.alert('Lỗi', 'Không xác định được chủ đề hiện tại.');
      return;
    }
    if (!alphabetCharacter.trim()) {
      Alert.alert('Lỗi', 'Ký tự không được để trống.');
      return;
    }
    if (!pronunciations.trim()) {
      Alert.alert('Lỗi', 'Phát âm không được để trống.');
      return;
    }
    if (!urlAudio.trim()) {
      Alert.alert('Lỗi', 'Link audio không được để trống.');
      return;
    }

    const dataToSubmit: RequestAlphabetDTOClient = {
      alphabetCharacter: alphabetCharacter.trim(),
      pronunciations: pronunciations.trim(),
      urlAudio: urlAudio.trim(),
      alphabetType: alphabetType,
      topic: currentTopicId,
    };

    if (mode === 'edit' && initialData?.id) {
      dataToSubmit.id = initialData.id;
    }
    onSubmit(dataToSubmit);
  };

  const modalTitle = mode === 'add' ? 'Thêm Bảng Chữ Cái' : 'Sửa Bảng Chữ Cái';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={addEditAlphabetModalStyles.backdrop} onPress={onClose}>
        <Pressable
          style={addEditAlphabetModalStyles.modalViewContainer}
          onPress={() => {}}>
          <View style={addEditAlphabetModalStyles.modalViewContent}>
            <View style={addEditAlphabetModalStyles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={addEditAlphabetModalStyles.backButton}>
                <Image
                  source={BACK_ARROW_ICON}
                  style={addEditAlphabetModalStyles.backIcon}
                />
              </TouchableOpacity>
              <Text style={addEditAlphabetModalStyles.headerTitle}>
                {modalTitle}
              </Text>
              <View style={{width: 30}} />
            </View>
            <ScrollView
              style={addEditAlphabetModalStyles.formContainer}
              keyboardShouldPersistTaps="handled">
              <View style={addEditAlphabetModalStyles.inputGroup}>
                <Text style={addEditAlphabetModalStyles.label}>
                  Ký tự{' '}
                  <Text style={addEditAlphabetModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditAlphabetModalStyles.input}
                  value={alphabetCharacter}
                  onChangeText={setAlphabetCharacter}
                  placeholder="Nhập ký tự (vd: あ, ア)"
                  editable={!isSubmitting}
                />
              </View>
              <View style={addEditAlphabetModalStyles.inputGroup}>
                <Text style={addEditAlphabetModalStyles.label}>
                  Phát âm{' '}
                  <Text style={addEditAlphabetModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditAlphabetModalStyles.input}
                  value={pronunciations}
                  onChangeText={setPronunciations}
                  placeholder="Nhập cách phát âm (vd: a)"
                  editable={!isSubmitting}
                />
              </View>
              <View style={addEditAlphabetModalStyles.inputGroup}>
                <Text style={addEditAlphabetModalStyles.label}>
                  Link Audio{' '}
                  <Text style={addEditAlphabetModalStyles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={addEditAlphabetModalStyles.input}
                  value={urlAudio}
                  onChangeText={setUrlAudio}
                  placeholder="Nhập URL âm thanh"
                  keyboardType="url"
                  editable={!isSubmitting}
                />
              </View>
              <View style={addEditAlphabetModalStyles.inputGroup}>
                <Text style={addEditAlphabetModalStyles.label}>
                  Loại chữ cái{' '}
                  <Text style={addEditAlphabetModalStyles.requiredStar}>*</Text>
                </Text>
                <View style={addEditAlphabetModalStyles.pickerWrapper}>
                  <Picker
                    selectedValue={alphabetType}
                    onValueChange={itemValue =>
                      setAlphabetType(itemValue as 'HIRA' | 'KATA')
                    }
                    enabled={mode === 'add' && !isSubmitting}
                    style={addEditAlphabetModalStyles.picker}
                    itemStyle={addEditAlphabetModalStyles.pickerItem}>
                    <Picker.Item label="Hiragana" value="HIRA" />
                    <Picker.Item label="Katakana" value="KATA" />
                  </Picker>
                </View>
                {mode === 'edit' && (
                  <Text style={addEditAlphabetModalStyles.disabledPickerText}>
                    Loại chữ cái không thể thay đổi khi chỉnh sửa.
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[
                  addEditAlphabetModalStyles.submitButton,
                  isSubmitting &&
                    addEditAlphabetModalStyles.submitButtonDisabled,
                ]}
                onPress={handleSubmitLocal}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={addEditAlphabetModalStyles.submitButtonText}>
                    {mode === 'add' ? 'Thêm' : 'Lưu thay đổi'}
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

// --- Types cho Navigation ---
type AlphabetsAdminScreenRouteProp = RouteProp<
  RootStackParamList,
  'AlphabetsAdminScreen'
>;
type AlphabetsAdminScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AlphabetsAdminScreen'
>;

// --- Component Màn hình chính ---
const AlphabetsAdminScreen = () => {
  const route = useRoute<AlphabetsAdminScreenRouteProp>();
  const navigation = useNavigation<AlphabetsAdminScreenNavigationProp>();
  const {logout} = useAuth();
  const {topic_code: topicCodeFromRoute, title: topicTitleFromRoute} =
    route.params;

  const [activeTab, setActiveTab] = useState<'HIRA' | 'KATA'>('HIRA');
  const [alphabetsHira, setAlphabetsHira] = useState<ApiAlphabetItem[]>([]);
  const [alphabetsKata, setAlphabetsKata] = useState<ApiAlphabetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [isDeletingItemId, setIsDeletingItemId] = useState<number | null>(null);

  const [isAlphabetModalVisible, setIsAlphabetModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAlphabet, setEditingAlphabet] =
    useState<ApiAlphabetItem | null>(null); // Dùng ApiAlphabetItem vì đây là dữ liệu từ list
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

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

  const fetchAlphabets = useCallback(
    async (topicId: number) => {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await axios.get<ApiAlphabetItem[]>(
          `${API_ADMIN_ALPHABETS_URL}?topicID=${topicId}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        if (isMountedRef.current) {
          const allAlphabets = response.data || [];
          setAlphabetsHira(allAlphabets.filter(a => a.alphabetType === 'HIRA'));
          setAlphabetsKata(allAlphabets.filter(a => a.alphabetType === 'KATA'));
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Không thể tải bảng chữ cái.';
        setError(msg);
        showMessage({message: msg, type: 'danger'});
        setAlphabetsHira([]);
        setAlphabetsKata([]);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (currentTopicId !== null) {
      fetchAlphabets(currentTopicId);
    } else {
      setError('ID chủ đề không hợp lệ.');
      showMessage({message: 'ID chủ đề không hợp lệ.', type: 'warning'});
      setAlphabetsHira([]);
      setAlphabetsKata([]);
    }
  }, [currentTopicId, fetchAlphabets]);

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

  const handleOpenAddItemModal = () => {
    setModalMode('add');
    setEditingAlphabet(null);
    setIsAlphabetModalVisible(true);
  };

  const handleOpenEditItemModal = (item: ApiAlphabetItem) => {
    setModalMode('edit');
    setEditingAlphabet(item); // item từ list (ApiAlphabetItem)
    setIsAlphabetModalVisible(true);
  };

  const handleAlphabetFormSubmit = async (
    formDataFromModal: RequestAlphabetDTOClient,
  ) => {
    if (!currentTopicId) {
      showMessage({message: 'Lỗi: Không tìm thấy ID chủ đề.', type: 'danger'});
      return;
    }
    setIsSubmittingForm(true);
    try {
      const token = await getToken();
      let response;
      // formDataFromModal đã chứa topic: currentTopicId từ trong modal

      if (modalMode === 'add') {
        const {id, ...createData} = formDataFromModal;
        response = await axios.post(
          `${API_ADMIN_ALPHABETS_URL}/create`,
          createData,
          {headers: {Authorization: `Bearer ${token}`}},
        );
      } else {
        if (!editingAlphabet?.id) {
          throw new Error('Không tìm thấy ID của mục cần sửa.');
        }
        const {id, ...updateData} = formDataFromModal; // id trong formDataFromModal là id của item, không phải là id để update
        response = await axios.post(
          `${API_ADMIN_ALPHABETS_URL}/update?id=${editingAlphabet.id}`,
          updateData,
          {headers: {Authorization: `Bearer ${token}`}},
        );
      }

      if (response && response.data) {
        showMessage({message: response.data as string, type: 'success'});
        if (currentTopicId) fetchAlphabets(currentTopicId);
        setIsAlphabetModalVisible(false);
        setEditingAlphabet(null); // Reset
      } else {
        throw new Error(
          modalMode === 'add' ? 'Thêm thất bại' : 'Cập nhật thất bại',
        );
      }
    } catch (err: any) {
      console.error(
        'Lỗi submit form alphabet:',
        err.response?.data || err.message,
      );
      let errorMessage =
        modalMode === 'add' ? 'Không thể thêm.' : 'Không thể cập nhật.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors
            .map((e: any) => e.defaultMessage || e.field)
            .join('\n');
        } else if (typeof err.response.data === 'object') {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      showMessage({message: errorMessage, type: 'danger', duration: 7000});
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteItem = (item: ApiAlphabetItem) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${item.alphabetCharacter}" (ID: ${item.id})?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (currentTopicId === null) {
              showMessage({
                message: 'Lỗi: Không tìm thấy ID chủ đề.',
                type: 'danger',
              });
              return;
            }
            setIsDeletingItemId(item.id);
            try {
              const token = await getToken();
              const response = await axios.post(
                `${API_ADMIN_ALPHABETS_URL}/delete?id=${item.id}`,
                {},
                {headers: {Authorization: `Bearer ${token}`}},
              );
              if (response && response.data) {
                showMessage({
                  message: response.data as string,
                  type: 'success',
                });
                fetchAlphabets(currentTopicId);
              } else {
                throw new Error('Xóa thất bại');
              }
            } catch (err: any) {
              console.error(
                'Lỗi xóa alphabet:',
                err.response?.data || err.message,
              );
              let errorMessage = 'Không thể xóa.';
              if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                  errorMessage = err.response.data;
                } else if (err.response.data.message) {
                  errorMessage = err.response.data.message;
                }
              } else {
                errorMessage = err.message || errorMessage;
              }
              showMessage({message: errorMessage, type: 'danger'});
            } finally {
              setIsDeletingItemId(null);
            }
          },
        },
      ],
    );
  };

  const renderAlphabetItem = useCallback(
    ({item}: {item: ApiAlphabetItem}) => (
      <View style={styles.listItem}>
        <Image source={ALPHABET_ITEM_ICON} style={styles.itemIcon} />
        <View style={styles.itemTextContainer}>
          <Text style={styles.alphabetCharacterText}>
            {item.alphabetCharacter}
          </Text>
          <Text style={styles.pronunciationText}>{item.pronunciations}</Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          {item.urlAudio && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => playSound(item.urlAudio)}>
              <Image source={AUDIO_PLAY_ICON} style={styles.actionIcon} />
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

  const currentList = activeTab === 'HIRA' ? alphabetsHira : alphabetsKata;
  const emptyListMessage = `Chủ đề này chưa có ${
    activeTab === 'HIRA' ? 'Hiragana' : 'Katakana'
  } nào.`;

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
          {topicTitleFromRoute || 'Bảng chữ cái'}
        </Text>
        <View style={{width: 30}} />
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'HIRA' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('HIRA')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'HIRA' && styles.tabTextActive,
            ]}>
            Hiragana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'KATA' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('KATA')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'KATA' && styles.tabTextActive,
            ]}>
            Katakana
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
              console.error('Audio Error:', videoError);
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
      {isLoading ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text>Đang tải bảng chữ cái...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : currentList.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>{emptyListMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          renderItem={renderAlphabetItem}
          keyExtractor={item => `${activeTab}-${item.id.toString()}`}
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
          <View
            style={profileMenuStyles.menuContainer}
            onStartShouldSetResponder={() => true}>
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
          </View>
        </Pressable>
      </Modal>
      {isAlphabetModalVisible && currentTopicId !== null && (
        <AddEditAlphabetModal
          visible={isAlphabetModalVisible}
          mode={modalMode}
          initialData={
            // Truyền dữ liệu cho modal edit, đảm bảo khớp RequestAlphabetDTOClient
            editingAlphabet && modalMode === 'edit'
              ? {
                  id: editingAlphabet.id,
                  alphabetCharacter: editingAlphabet.alphabetCharacter,
                  pronunciations: editingAlphabet.pronunciations,
                  urlAudio: editingAlphabet.urlAudio || '',
                  alphabetType: editingAlphabet.alphabetType,
                  topic: currentTopicId,
                }
              : null
          }
          onClose={() => {
            setIsAlphabetModalVisible(false);
            setEditingAlphabet(null);
          }}
          onSubmit={handleAlphabetFormSubmit}
          isSubmitting={isSubmittingForm}
          currentTopicId={currentTopicId}
        />
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
// Styles cho AddEditAlphabetModal (dựa theo formModalStyles của TheoryAdminScreen)
const addEditAlphabetModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)', // Giống TheoryAdminScreen
  },
  modalViewContainer: {
    width: '100%',
    backgroundColor: 'transparent', // Giống TheoryAdminScreen
    maxHeight: SIZES.height * 0.8, // Giới hạn chiều cao, có thể điều chỉnh
  },
  modalViewContent: {
    backgroundColor: COLORS.white, // Giống TheoryAdminScreen
    borderTopLeftRadius: 20, // Giống TheoryAdminScreen
    borderTopRightRadius: 20, // Giống TheoryAdminScreen
    paddingBottom:
      Platform.OS === 'ios' ? SIZES.padding * 2 : SIZES.padding + 10, // Giống TheoryAdminScreen
    flexGrow: 1, // Để ScrollView hoạt động tốt khi nội dung dài
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15, // Giống TheoryAdminScreen
    paddingHorizontal: 20, // Giống TheoryAdminScreen
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#eee', // Giống TheoryAdminScreen
  },
  backButton: {padding: 5}, // Giống TheoryAdminScreen
  backIcon: {width: 22, height: 22}, // Có thể điều chỉnh tintColor nếu muốn
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black || '#333',
  }, // Giống TheoryAdminScreen
  formContainer: {
    paddingHorizontal: 20, // Giống TheoryAdminScreen
    paddingTop: 15, // Tăng chút padding
  },
  inputGroup: {
    marginBottom: 18, // Tăng chút margin
  },
  label: {
    fontSize: 15,
    color: COLORS.darkGray || '#444', // Giống TheoryAdminScreen
    marginBottom: 7, // Tăng chút margin
    fontWeight: '500',
  },
  requiredStar: {
    color: COLORS.red || 'red', // Giống TheoryAdminScreen
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray || '#ddd', // Giống TheoryAdminScreen
    borderRadius: 8, // Giống TheoryAdminScreen
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, // Giống TheoryAdminScreen
    fontSize: 16,
    backgroundColor: COLORS.lightGray2 || '#f9f9f9', // Giống TheoryAdminScreen
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.gray || '#ddd',
    borderRadius: 8,
    backgroundColor: COLORS.lightGray2 || '#f9f9f9',
    overflow: Platform.OS === 'android' ? 'hidden' : undefined,
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    width: '100%',
  },
  pickerItem: {},
  disabledPickerText: {
    fontSize: 13,
    color: COLORS.gray || '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: COLORS.primary, // Giống TheoryAdminScreen
    paddingVertical: 14, // Có thể điều chỉnh
    borderRadius: 8, // Giống TheoryAdminScreen
    alignItems: 'center',
    marginTop: 20, // Tăng margin
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  submitButtonText: {color: COLORS.white, fontSize: 17, fontWeight: 'bold'}, // Giống TheoryAdminScreen
  submitButtonDisabled: {backgroundColor: COLORS.gray}, // Giống TheoryAdminScreen
});

// Styles chính của AlphabetsAdminScreen (giữ nguyên từ trước, đã cập nhật tabs)
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
  },
  backButtonSubHeader: {padding: 5, marginRight: 10},
  backIconSubHeader: {width: 20, height: 20},
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
    marginTop: 10,
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
    backgroundColor: COLORS.nenItemDam || '#E0E0E0',
    borderBottomColor: COLORS.primary,
  },
  tabText: {fontSize: 16, color: COLORS.black || '#555555', fontWeight: '500'},
  tabTextActive: {color: COLORS.primary, fontWeight: 'bold'},
  addNewButtonContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginBottom: 12,
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
  listContainer: {flex: 1, paddingTop: 5},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  itemIcon: {width: 32, height: 32, marginRight: 15},
  itemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 8,
  },
  alphabetCharacterText: {
    fontSize: 24,
    color: COLORS.black || '#333333',
    fontWeight: 'bold',
    marginRight: 10,
  },
  pronunciationText: {fontSize: 16, color: COLORS.darkGray || '#555555'},
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {padding: 6, marginLeft: 8},
  actionIcon: {width: 22, height: 22, resizeMode: 'contain'},
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.darkGray || '#888888',
    textAlign: 'center',
  },
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
  audioActivityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: SIZES.height / 2 - 50,
    zIndex: 100,
  },
  audioErrorText: {textAlign: 'center', color: COLORS.red, paddingVertical: 5},
});

// Styles cho Profile Menu (giữ nguyên)
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.1)'},
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 85,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {width: 20, height: 20, marginRight: 12},
  menuText: {fontSize: 16, color: COLORS.black || '#333'},
});

export default AlphabetsAdminScreen;
