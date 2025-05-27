// screens/admin/TaiKhoanScreen.tsx
import React, {useState, useEffect, useCallback, useRef} from 'react'; // Thêm useRef
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';

// --- BEGIN: Dữ liệu và Type ---
type ApiUser = {
  userId: string;
  userName: string;
  role: boolean;
};

type User = {
  user_id: string;
  username: string;
  role: boolean;
  profile_picture_url?: string;
  email?: string;
};
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png');
const DELETE_ICON = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON = require('../../assets/images/logout.png');
// --- END: Đường dẫn tới ảnh ---

// --- BEGIN: Định nghĩa ConfirmDeleteModal và styles của nó (GIỮ NGUYÊN) ---
interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string | null;
}
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  username,
}) => {
  if (!visible) {
    return null;
  }
  const confirmationMessage = username
    ? `Bạn có chắc chắn muốn xóa người dùng "${username}" không?`
    : 'Bạn có chắc chắn muốn xóa không?';
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={modalStyles.modalViewWrapper}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.messageText}>{confirmationMessage}</Text>
            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modalStyles.buttonText,
                    modalStyles.cancelButtonText,
                  ]}>
                  Không
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.7}>
                <Text
                  style={[
                    modalStyles.buttonText,
                    modalStyles.confirmButtonText,
                  ]}>
                  Có
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalViewWrapper: {
    width: '85%',
    maxWidth: 350,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  confirmButton: {
    backgroundColor: '#fff9e6',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primaryDark || '#333333'},
});
// --- END: Định nghĩa ConfirmDeleteModal ---

const API_BASE_URL = 'http://10.0.2.2:8080/api/admin/account';

// --- BEGIN: Component TaiKhoanScreen ---
const TaiKhoanScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); // Sử dụng type nếu cần thiết

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Alert đã có trong code gốc của bạn, giữ lại nếu bạn muốn.
      // Tuy nhiên, logout() sẽ điều hướng, nên Alert có thể không kịp hiển thị lâu.

      logout();
      throw new Error('Token not found');
    }
    return token;
  }, [logout]);

  const mapApiUserToUser = useCallback(
    (apiUser: ApiUser): User => ({
      user_id: apiUser.userId,
      username: apiUser.userName,
      role: apiUser.role,
      profile_picture_url: '',
      email: '',
    }),
    [],
  );

  const fetchUsers = useCallback(
    async (keyword?: string) => {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      if (isMountedRef.current) setError(null);

      try {
        const token = await getToken();

        const url = keyword
          ? `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`
          : API_BASE_URL;
        const response = await axios.get<ApiUser[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!isMountedRef.current) return;

        const fetchedApiUsers = response.data || [];
        const mappedUsers = fetchedApiUsers.map(mapApiUserToUser);

        if (!keyword) {
          if (isMountedRef.current) setUsers(mappedUsers);
        }
        if (isMountedRef.current) setFilteredUsers(mappedUsers);
      } catch (apiError: any) {
        // Kiểm tra isMountedRef trước khi thực hiện bất kỳ hành động nào trong catch
        if (!isMountedRef.current) {
          console.log(
            'TaiKhoanScreen: fetchUsers error caught, but compggonent unmounted. Suppressing further actions.',
          );
          return;
        }

        // Nếu lỗi là "Token not found", hàm getToken đã gọi logout, không cần làm gì thêm ở đây
        // ngoài việc dọn dẹp state (đã có isMountedRef kiểm tra)
        if (apiError.message !== 'Token not found') {
          const errorMessage =
            apiError.response?.data?.message ||
            apiError.message ||
            'Không thể tải danh sách người dùng. Vui lòng thử lại.';
          setError(errorMessage); // isMountedRef đã kiểm tra ở trên
        }
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [getToken, mapApiUserToUser, logout], // Thêm logout vì getToken gọi nó
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (searchQuery.trim() === '') {
        fetchUsers();
      } else {
        fetchUsers(searchQuery.trim());
      }
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchQuery, fetchUsers]);

  const performDeleteUser = useCallback(
    async (userId: string) => {
      if (!isMountedRef.current) return;
      setDeletingUserId(userId);
      if (isMountedRef.current) setError(null);
      try {
        const token = await getToken();
        await axios.delete(`${API_BASE_URL}/delete?userId=${userId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        if (!isMountedRef.current) return;
        Alert.alert('Thành công', 'Đã xóa người dùng thành công.');
        fetchUsers(searchQuery.trim() || undefined);
      } catch (apiError: any) {
        if (!isMountedRef.current) {
          console.log(
            'TaiKhoanScreen: performDeleteUser error caught, but component unmounted.',
          );
          return;
        }
        console.error(
          'Lỗi khi xóa người dùng:',
          apiError.response?.data || apiError.message,
        );
        if (apiError.message === 'Token not found') {
          if (isMountedRef.current) logout();
        } else {
          const errorMessage =
            apiError.response?.data?.message || 'Không thể xóa người dùng.';
          Alert.alert('Lỗi', errorMessage);
          if (isMountedRef.current) setError(errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setDeletingUserId(null);
          setIsModalVisible(false);
          setUserToDelete(null);
        }
      }
    },
    [fetchUsers, searchQuery, getToken, logout],
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setUserToDelete(null);
  }, []);
  const handleModalConfirm = useCallback(() => {
    if (userToDelete) {
      performDeleteUser(userToDelete.userId);
    }
  }, [userToDelete, performDeleteUser]);
  const handleDeletePress = useCallback((userId: string, username: string) => {
    Keyboard.dismiss();
    setUserToDelete({userId, username});
    setIsModalVisible(true);
  }, []);

  const handleLogout = useCallback(async () => {
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

  const renderUserItem = useCallback(
    ({item}: {item: User}) => (
      <View style={styles.userItem}>
        <Image source={PERSON_ICON} style={styles.personIcon} />
        <Text style={styles.usernameText} numberOfLines={1}>
          {item.username}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePress(item.user_id, item.username)}
          disabled={deletingUserId === item.user_id}>
          {deletingUserId === item.user_id ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary || '#007bff'}
            />
          ) : (
            <Image source={DELETE_ICON} style={styles.deleteIcon} />
          )}
        </TouchableOpacity>
      </View>
    ),
    [handleDeletePress, deletingUserId],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.primary}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} disabled>
          <Image
            source={LOGO_ICON}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý tài khoản</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Image
          source={SEARCH_ICON}
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
          clearButtonMode="while-editing"
        />
      </View>
      {isLoading && filteredUsers.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải người dùng...</Text>
        </View>
      )}
      {!isLoading && error && filteredUsers.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchUsers(searchQuery.trim() || undefined)}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isLoading && !error && filteredUsers.length === 0 && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            {searchQuery.trim() !== ''
              ? `Không tìm thấy người dùng cho "${searchQuery}"`
              : 'Không có người dùng nào.'}
          </Text>
        </View>
      )}
      {filteredUsers.length > 0 && (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.user_id}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
        />
      )}
      {isLoading && filteredUsers.length > 0 && (
        <ActivityIndicator
          style={styles.inlineSpinner}
          size="small"
          color={COLORS.primary}
        />
      )}
      <ConfirmDeleteModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        username={userToDelete?.username ?? null}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={isProfileMenuVisible}
        onRequestClose={() => setIsProfileMenuVisible(false)}>
        <Pressable
          style={profileMenuStyles.backdrop}
          onPress={() => setIsProfileMenuVisible(false)}>
          <View
            style={profileMenuStyles.menuViewWrapper}
            onStartShouldSetResponder={() => true}>
            <View style={profileMenuStyles.menuContainer}>
              <TouchableOpacity
                style={profileMenuStyles.menuItem}
                onPress={handleLogout}>
                <Image
                  source={LOGOUT_ICON}
                  style={profileMenuStyles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={profileMenuStyles.menuText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component TaiKhoanScreen ---

// --- BEGIN: Styles (Giữ nguyên) ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    height: 90,
  },
  headerButton: {padding: 5},
  headerIcon: {width: 30, height: 30},
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {width: 18, height: 18, marginRight: 10, tintColor: '#888'},
  searchInput: {flex: 1, fontSize: 16, color: '#333', paddingVertical: 0},
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  personIcon: {width: 28, height: 28, marginRight: 15, tintColor: '#666'},
  usernameText: {flex: 1, fontSize: 16, color: '#444', fontWeight: '500'},
  deleteButton: {padding: 5, marginLeft: 10},
  deleteIcon: {width: 24, height: 24, resizeMode: 'contain'},
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {fontSize: 16, color: '#888', textAlign: 'center'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: '#555'},
  errorText: {
    fontSize: 16,
    color: COLORS.red || 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {color: COLORS.white, fontSize: 16, fontWeight: 'bold'},
  inlineSpinner: {marginVertical: 10},
});
const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuViewWrapper: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 50 : 85,
    right: 15,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 150,
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
  menuIcon: {width: 20, height: 20, marginRight: 10, tintColor: '#555'},
  menuText: {fontSize: 16, color: '#333'},
});
// --- KẾT THÚC STYLES ---

export default TaiKhoanScreen;
