// screens/admin/TienDoScreen.tsx
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
// Kiểu dữ liệu người dùng từ API (tham khảo từ TaiKhoanScreen)
type ApiUser = {
  userId: string;
  userName: string;
  role: boolean; // Giả sử API trả về role, có thể dùng nếu cần
};

// Kiểu dữ liệu User sử dụng trong component TienDoScreen
type User = {
  user_id: string; // Map từ userId
  username: string; // Map từ userName
  // Các trường này có thể không có từ API /api/admin/account
  // nhưng giữ lại là optional nếu bạn có nguồn dữ liệu khác hoặc để mặc định
  profile_picture_url?: string;
  email?: string;
  level_id?: number;
};
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png');
const LOGOUT_ICON = require('../../assets/images/logout.png');
// DELETE_ICON không còn cần thiết
// --- END: Đường dẫn tới ảnh ---

const API_BASE_URL = 'http://10.0.2.2:8080/api/admin/account';

// Định nghĩa type cho navigation prop của TienDoScreen
// TienDoScreen là một route trong RootStack, và nó điều hướng đến TienDoDetail (cũng trong RootStack)
type TienDoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoScreen' // Tên của route hiện tại
>;

const TienDoScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<TienDoScreenNavigationProp>();

  const [users, setUsers] = useState<User[]>([]); // Danh sách người dùng gốc từ API
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Danh sách hiển thị (sau khi tìm kiếm)
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State cho loading
  const [error, setError] = useState<string | null>(null); // State cho lỗi API

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  // Hàm lấy token (giống TaiKhoanScreen)
  const getToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Lỗi', 'Không tìm thấy token. Vui lòng đăng nhập lại.');
      logout(); // Đăng xuất nếu không có token
      throw new Error('Token not found');
    }
    return token;
  };

  // Hàm map ApiUser sang User
  const mapApiUserToUser = (apiUser: ApiUser): User => ({
    user_id: apiUser.userId,
    username: apiUser.userName,
    // Các trường khác nếu có từ API hoặc đặt giá trị mặc định
    profile_picture_url: '', // Hoặc ảnh mặc định
    email: '', // Hoặc thông tin từ API nếu có
  });

  // Hàm lấy danh sách người dùng từ API (tích hợp tìm kiếm)
  const fetchUsers = useCallback(
    async (keyword?: string) => {
      console.log(`TienDoScreen: Fetching users. Keyword: "${keyword || ''}"`);
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const url = keyword
          ? `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`
          : API_BASE_URL;

        console.log(`TienDoScreen: Calling API: ${url}`);
        const response = await axios.get<ApiUser[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });

        const fetchedApiUsers = response.data || [];
        console.log(
          `TienDoScreen: API response data count: ${fetchedApiUsers.length}`,
        );
        const mappedUsers = fetchedApiUsers.map(mapApiUserToUser);

        if (!keyword) {
          setUsers(mappedUsers); // Cập nhật danh sách gốc nếu không phải tìm kiếm
        }
        setFilteredUsers(mappedUsers); // Luôn cập nhật danh sách hiển thị
        if (mappedUsers.length === 0 && keyword) {
          console.log(
            `TienDoScreen: Không tìm thấy người dùng nào với từ khóa "${keyword}"`,
          );
        } else if (mappedUsers.length === 0 && !keyword) {
          console.log(`TienDoScreen: API không trả về người dùng nào.`);
        }
      } catch (apiError: any) {
        console.error(
          'TienDoScreen: Lỗi khi lấy danh sách người dùng:',
          apiError.response?.data || apiError.message,
        );
        const errorMessage =
          apiError.response?.data?.message ||
          'Không thể tải danh sách người dùng. Vui lòng thử lại.';
        setError(errorMessage);
        // Alert.alert('Lỗi API', errorMessage); // Có thể không cần Alert nếu đã hiển thị lỗi trên UI
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [logout],
  ); // Thêm logout vào dependency nếu getToken dùng nó khi lỗi

  // useEffect để lấy danh sách người dùng khi màn hình được mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // useEffect để xử lý tìm kiếm khi searchQuery thay đổi (với debounce)
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        // Nếu ô tìm kiếm trống, hiển thị lại toàn bộ danh sách gốc đã fetch trước đó
        // hoặc fetch lại toàn bộ nếu muốn dữ liệu mới nhất.
        // setFilteredUsers(users); // Cách 1: Dùng state users đã fetch (nhanh hơn)
        fetchUsers(); // Cách 2: Fetch lại toàn bộ (đảm bảo dữ liệu mới nhất)
      } else {
        fetchUsers(searchQuery.trim()); // Gọi API tìm kiếm
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timerId);
  }, [searchQuery, fetchUsers]); // Thêm users vào dependency nếu dùng Cách 1 ở trên

  const handleLogout = useCallback(async () => {
    // ... (logic logout giữ nguyên như cũ) ...
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
      <TouchableOpacity
        style={styles.userItem}
        activeOpacity={0.8}
        onPress={() => {
          console.log(
            `TienDoScreen: Xem tiến độ User: ${item.username} (ID: ${item.user_id})`,
          );
          // Điều hướng đến chi tiết tiến độ, truyền userId và username
          navigation.navigate('TienDoDetail', {
            userId: item.user_id,
            username: item.username,
          });
        }}>
        <Image
          source={PERSON_ICON} // Sử dụng icon người mặc định
          style={styles.personIcon}
        />
        <Text style={styles.usernameText} numberOfLines={1}>
          {item.username}
        </Text>
        {/* NÚT XÓA ĐÃ BỊ LOẠI BỎ */}
      </TouchableOpacity>
    ),
    [navigation], // Chỉ phụ thuộc vào navigation
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
        <Text style={styles.headerTitle}>Theo Dõi Tiến Độ</Text>
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
          clearButtonMode="while-editing" // Thêm nút clear cho iOS
        />
      </View>

      {isLoading && filteredUsers.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
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

      {/* ActivityIndicator nhỏ khi đang loading nhưng vẫn có data (ví dụ khi search) */}
      {isLoading && filteredUsers.length > 0 && (
        <ActivityIndicator
          style={styles.inlineSpinner}
          size="small"
          color={COLORS.primary}
        />
      )}

      {/* Profile Menu Modal (giữ nguyên) */}
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
            onStartShouldSetResponder={() =>
              true
            } /* Ngăn press lan ra backdrop */
          >
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
      {/* ConfirmDeleteModal đã được loại bỏ */}
    </SafeAreaView>
  );
};

// Styles (giữ nguyên phần lớn, loại bỏ style của nút xóa nếu có)
// Tôi sẽ dùng lại các style bạn đã cung cấp cho TienDoScreen
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white || '#FFFFFF'},
  header: {
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
  headerIcon: {width: 30, height: 30},
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2 || '#f0f0f0',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: COLORS.darkGray || '#888',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black || '#333',
    paddingVertical: 0,
  },
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6',
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
  personIcon: {
    width: 28,
    height: 28,
    marginRight: 15,
    tintColor: '#666',
  },
  usernameText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black || '#444',
    fontWeight: '500',
  },
  // deleteButton và deleteIcon styles không còn cần thiết nữa
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Hoặc padding nếu muốn
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.darkGray || '#888',
    textAlign: 'center',
  },
  loadingContainer: {
    // Style cho loading toàn màn hình khi chưa có data
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {marginTop: 10, fontSize: 16, color: COLORS.gray || '#555'}, // Giống TaiKhoanScreen
  errorText: {
    // Giống TaiKhoanScreen
    fontSize: 16,
    color: COLORS.red || 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    // Giống TaiKhoanScreen
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    // Giống TaiKhoanScreen
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineSpinner: {
    // Giống TaiKhoanScreen
    marginVertical: 10,
  },
});

const profileMenuStyles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuViewWrapper: {
    // Thêm wrapper này để bắt sự kiện press chính xác hơn
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

export default TienDoScreen;
