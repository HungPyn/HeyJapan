// screens/admin/TienDoScreen.tsx
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

// --- Types & Interfaces (Giữ nguyên) ---
type ApiUser = {
  userId: string;
  userName: string;
  role: boolean;
};
type User = {
  user_id: string;
  username: string;
  profile_picture_url?: string;
  email?: string;
  level_id?: number;
};

// --- Đường dẫn tới ảnh (Giữ nguyên) ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png');
const LOGOUT_ICON = require('../../assets/images/logout.png');

const API_BASE_URL = 'http://10.0.2.2:8080/api/admin/account';

type TienDoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoScreen'
>;

const TienDoScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<TienDoScreenNavigationProp>();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  // Ref để theo dõi component có còn mounted không
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true; // Đặt là true khi component mount
    return () => {
      isMountedRef.current = false; // Đặt là false khi component unmount
    };
  }, []); // Chạy một lần khi mount và cleanup khi unmount

  const getToken = useCallback(async () => {
    // useCallback cho getToken
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      // Không Alert ở đây nữa, để fetchUsers xử lý lỗi này một cách tập trung
      // logout(); // Không gọi logout ở đây nữa, hàm gọi sẽ quyết định
      throw new Error('Token not found');
    }
    return token;
  }, []); // Không có dependency nếu không dùng state/props nào

  const mapApiUserToUser = useCallback(
    (apiUser: ApiUser): User => ({
      // useCallback cho mapApiUserToUser
      user_id: apiUser.userId,
      username: apiUser.userName,
      profile_picture_url: '',
      email: '',
    }),
    [],
  );

  const fetchUsers = useCallback(
    async (keyword?: string) => {
      if (!isMountedRef.current) {
        // Kiểm tra ngay từ đầu
        console.log('TienDoScreen: fetchUsers aborted, component not mounted.');
        return;
      }
      setIsLoading(true);
      if (isMountedRef.current) setError(null); // Chỉ set nếu còn mounted

      try {
        const token = await getToken(); // Nếu lỗi Token not found, sẽ nhảy vào catch

        const url = keyword
          ? `${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`
          : API_BASE_URL;

        const response = await axios.get<ApiUser[]>(url, {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!isMountedRef.current) return; // Kiểm tra lại sau await

        const fetchedApiUsers = response.data || [];
        const mappedUsers = fetchedApiUsers.map(mapApiUserToUser);

        if (!keyword) {
          if (isMountedRef.current) setUsers(mappedUsers);
        }
        if (isMountedRef.current) setFilteredUsers(mappedUsers);
      } catch (apiError: any) {
        if (!isMountedRef.current) return; // Kiểm tra trong catch

        console.error(
          'TienDoScreen: Lỗi khi lấy danh sách người dùng:',
          apiError.message,
        ); // Log lỗi gốc

        if (apiError.message === 'Token not found') {
          // Token không tìm thấy, có thể người dùng đã/đang đăng xuất.
          // Gọi logout để đảm bảo trạng thái nhất quán.
          // isMountedRef sẽ ngăn các set state không cần thiết nếu logout gây unmount.
          if (isMountedRef.current) logout();
        } else {
          // Các lỗi khác (ví dụ: lỗi mạng, lỗi server)
          const errorMessage =
            apiError.response?.data?.message ||
            apiError.message || // Hiển thị lỗi từ apiError.message nếu có
            'Không thể tải danh sách người dùng. Vui lòng thử lại.';
          if (isMountedRef.current) setError(errorMessage);
        }
        // Luôn dọn dẹp state khi có lỗi
        if (isMountedRef.current) {
          setUsers([]);
          setFilteredUsers([]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [getToken, mapApiUserToUser, logout], // Thêm mapApiUserToUser và logout vào dependencies
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (!isMountedRef.current) return; // Kiểm tra trước khi thực hiện logic
      if (searchQuery.trim() === '') {
        fetchUsers();
      } else {
        fetchUsers(searchQuery.trim());
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery, fetchUsers]);

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
            await logout(); // isMountedRef sẽ được xử lý bởi useEffect cleanup
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
          navigation.navigate('TienDoDetail', {
            userId: item.user_id,
            username: item.username,
          });
        }}>
        <Image source={PERSON_ICON} style={styles.personIcon} />
        <Text style={styles.usernameText} numberOfLines={1}>
          {item.username}
        </Text>
      </TouchableOpacity>
    ),
    [navigation],
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
          clearButtonMode="while-editing"
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
      {isLoading && filteredUsers.length > 0 && (
        <ActivityIndicator
          style={styles.inlineSpinner}
          size="small"
          color={COLORS.primary}
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

// Styles (Giữ nguyên)
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white || '#FFFFFF'},
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
  personIcon: {width: 28, height: 28, marginRight: 15, tintColor: '#666'},
  usernameText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black || '#444',
    fontWeight: '500',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.darkGray || '#888',
    textAlign: 'center',
  },
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: COLORS.gray || '#555'},
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

export default TienDoScreen;
