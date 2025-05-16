import React, {useState, useEffect, useCallback} from 'react';
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
} from 'react-native';
import axios from 'axios'; // << THÊM Axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // << THÊM AsyncStorage
import {COLORS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';

// --- BEGIN: Dữ liệu và Type ---
// Kiểu dữ liệu người dùng từ API
type ApiUser = {
  userId: string;
  userName: string;
  role: boolean;
};

// Kiểu dữ liệu User sử dụng trong component (điều chỉnh cho phù hợp với API)
type User = {
  user_id: string; // Map từ userId
  username: string; // Map từ userName
  role: boolean; // Map từ role
  // Các trường cũ có thể giữ lại là optional nếu cần, hoặc bỏ đi nếu không dùng
  profile_picture_url?: string; // API không có, sẽ để trống hoặc mặc định
  email?: string; // API không có, sẽ để trống
};

// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png'); // Giữ lại icon này
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
    // Để Pressable con không bị đóng khi chạm vào modal content
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
  }, // Giữ màu vàng nhạt cho confirm
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primaryDark || '#333333'},
});
// --- END: Định nghĩa ConfirmDeleteModal và styles của nó ---

const API_BASE_URL = 'http://10.0.2.2:8080/api/admin/account';

// --- BEGIN: Component TaiKhoanScreen ---
const TaiKhoanScreen = () => {
  const {logout} = useAuth();

  const [users, setUsers] = useState<User[]>([]); // Sẽ lấy từ API
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Sẽ lấy từ API hoặc kết quả search
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null); // User ID đang trong quá trình xóa (API)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // State cho loading
  const [error, setError] = useState<string | null>(null); // State cho lỗi API

  // Hàm lấy token
  const getToken = async () => {
    const token = await AsyncStorage.getItem('token'); // Giả sử token được lưu với key 'userToken'
    if (!token) {
      Alert.alert(
        'Lỗi',
        'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
      );
      // Có thể gọi logout() ở đây hoặc điều hướng về màn hình login
      logout(); // Ví dụ: gọi logout nếu không có token
      throw new Error('Token not found');
    }
    return token;
  };

  // Hàm map ApiUser sang User
  const mapApiUserToUser = (apiUser: ApiUser): User => ({
    user_id: apiUser.userId,
    username: apiUser.userName,
    role: apiUser.role,
    profile_picture_url: '', // API không cung cấp, để trống hoặc ảnh mặc định
    email: '', // API không cung cấp
  });

  // Hàm lấy danh sách người dùng từ API
  const fetchUsers = useCallback(
    async (keyword?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const url = keyword
          ? `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`
          : API_BASE_URL;
        console.log(`Workspaceing users from: ${url}`);
        const response = await axios.get<ApiUser[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });

        const fetchedApiUsers = response.data || [];
        const mappedUsers = fetchedApiUsers.map(mapApiUserToUser);

        if (!keyword) {
          // Nếu không tìm kiếm, cập nhật cả users và filteredUsers
          setUsers(mappedUsers);
        }
        setFilteredUsers(mappedUsers); // Luôn cập nhật filteredUsers
      } catch (apiError: any) {
        console.error(
          'Lỗi khi lấy danh sách người dùng:',
          apiError.response?.data || apiError.message,
        );
        setError(
          apiError.response?.data?.message ||
            'Không thể tải danh sách người dùng. Vui lòng thử lại.',
        );
        setUsers([]); // Xóa danh sách hiện tại nếu có lỗi
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [logout],
  ); // Thêm logout vào dependencies của useCallback nếu nó được dùng trong getToken

  // useEffect để lấy danh sách người dùng khi màn hình được mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // useEffect để xử lý tìm kiếm khi searchQuery thay đổi
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        // Nếu ô tìm kiếm trống, hiển thị lại toàn bộ danh sách gốc đã fetch
        // Hoặc fetch lại toàn bộ nếu bạn muốn luôn lấy dữ liệu mới nhất
        // setFilteredUsers(users); // Cách 1: Dùng state users đã fetch
        fetchUsers(); // Cách 2: Fetch lại toàn bộ (đảm bảo dữ liệu mới nhất)
      } else {
        fetchUsers(searchQuery.trim()); // Gọi API tìm kiếm
      }
    }, 500); // Debounce để tránh gọi API liên tục khi gõ

    return () => clearTimeout(timerId); // Cleanup timer
  }, [searchQuery, fetchUsers]); // Thêm fetchUsers vào dependencies

  const performDeleteUser = useCallback(
    async (userId: string) => {
      setDeletingUserId(userId); // Báo hiệu đang xóa user này (cho UI)
      setError(null);
      try {
        const token = await getToken();
        console.log('Bắt đầu xóa user với API:', userId);
        await axios.delete(`${API_BASE_URL}/delete?userId=${userId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        console.log('Đã xóa user thành công từ API:', userId);
        Alert.alert('Thành công', 'Đã xóa người dùng thành công.');
        // Sau khi xóa thành công, fetch lại danh sách người dùng
        // Điều này đảm bảo dữ liệu trên UI được đồng bộ với server
        fetchUsers(searchQuery.trim() || undefined); // Fetch lại dựa trên query hiện tại
      } catch (apiError: any) {
        console.error(
          'Lỗi khi xóa người dùng:',
          apiError.response?.data || apiError.message,
        );
        Alert.alert(
          'Lỗi',
          apiError.response?.data?.message ||
            'Không thể xóa người dùng. Vui lòng thử lại.',
        );
        setError(apiError.response?.data?.message || 'Lỗi khi xóa người dùng.');
      } finally {
        setDeletingUserId(null); // Kết thúc trạng thái đang xóa
        setIsModalVisible(false); // Đóng modal xác nhận
        setUserToDelete(null);
      }
    },
    [fetchUsers, searchQuery, logout],
  ); // Thêm logout

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setUserToDelete(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (userToDelete) {
      performDeleteUser(userToDelete.userId);
    }
    // Không cần gọi handleModalClose ở đây nữa vì nó đã được gọi trong performDeleteUser.finally
  }, [userToDelete, performDeleteUser]);

  const handleDeletePress = useCallback((userId: string, username: string) => {
    Keyboard.dismiss();
    setUserToDelete({userId, username});
    setIsModalVisible(true);
  }, []);

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

  const handleLogout = useCallback(async () => {
    setIsProfileMenuVisible(false);
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
          onPress: () => console.log('Hủy đăng xuất'),
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            console.log('Bắt đầu đăng xuất...');
            await logout(); // Sử dụng hàm logout từ AuthContext
            console.log('Đã đăng xuất.');
            // AuthContext sẽ xử lý việc điều hướng sau khi logout
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} disabled>
          {/* Nút logo không cần active */}
          <Image
            source={LOGO_ICON}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>JaVis</Text>
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
          onChangeText={setSearchQuery} // Cập nhật searchQuery trực tiếp
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
        />
      </View>

      {isLoading &&
        filteredUsers.length === 0 && ( // Chỉ hiển thị loading toàn màn hình khi chưa có data
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary || '#007bff'}
            />
            <Text style={styles.loadingText}>Đang tải người dùng...</Text>
          </View>
        )}

      {!isLoading &&
        error &&
        filteredUsers.length === 0 && ( // Hiển thị lỗi nếu có và không có data
          <View style={styles.emptyListContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchUsers(searchQuery.trim() || undefined)}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

      {!isLoading &&
        !error &&
        filteredUsers.length === 0 && ( // Hiển thị không có user nếu không loading, không lỗi, và list rỗng
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Không tìm thấy người dùng nào.
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
          // Không cần ListEmptyComponent ở đây nữa vì đã xử lý ở trên
        />
      )}

      {/* ActivityIndicator nhỏ khi đang loading nhưng vẫn có data (ví dụ khi search hoặc delete) */}
      {isLoading && filteredUsers.length > 0 && (
        <ActivityIndicator
          style={styles.inlineSpinner}
          size="small"
          color={COLORS.primary || '#007bff'}
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
          {/* Bao bọc menu content bằng Pressable để ngăn việc đóng modal khi chạm vào nó */}
          <Pressable
            style={profileMenuStyles.menuViewWrapper}
            onPress={() => {}}>
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component TaiKhoanScreen ---

// --- BEGIN: Styles chính của TaiKhoanScreen ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {
    paddingTop: 30, // Giữ nguyên
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    height: 90, // Giữ nguyên
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
    backgroundColor: COLORS.nenItem || '#FAFAFA', // Thêm fallback color
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
    // Style cho thông báo khi list rỗng hoặc lỗi
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Thêm padding
  },
  emptyListText: {fontSize: 16, color: '#888', textAlign: 'center'},
  loadingContainer: {
    // Style cho loading toàn màn hình
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineSpinner: {
    // Spinner nhỏ khi đang load nhưng vẫn có data
    marginVertical: 10,
  },
});
// --- END: Styles chính của TaiKhoanScreen ---

// --- THÊM STYLES CHO PROFILE MENU (GIỮ NGUYÊN) ---
const profileMenuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent', // Cho phép click xuyên qua để đóng menu
    // justifyContent: 'flex-start', // Để menu không bị ảnh hưởng bởi justify/align của backdrop
    // alignItems: 'flex-end',
  },
  menuViewWrapper: {
    // Wrapper cho menu content để bắt sự kiện press trên nó
    position: 'absolute',
    top: 80, // Điều chỉnh vị trí của menu
    right: 15,
    // không cần width/height ở đây, để nó tự điều chỉnh theo content
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#555',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
// --- KẾT THÚC STYLES CHO PROFILE MENU ---

export default TaiKhoanScreen;
