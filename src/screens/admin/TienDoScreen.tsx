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
import {COLORS} from '../../constants/theme'; // Đảm bảo đường dẫn đúng
import {useAuth} from '../auth/AuthContext'; // Đảm bảo đường dẫn đúng

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation'; // Đảm bảo đường dẫn đúng

// --- BEGIN: Dữ liệu và Type (Đồng bộ với TaiKhoanScreen) ---
type User = {
  user_id: string;
  oauth_subject_id: string;
  profile_picture_url: string; // Thêm từ TaiKhoanScreen
  username: string;
  email: string;
  user_password?: string;
  level_id?: number;
};

// Dữ liệu mẫu giống TaiKhoanScreen
const initialUsersData: User[] = [
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    oauth_subject_id: 'oauth_001',
    profile_picture_url: 'https://example.com/images/user1.jpg',
    username: 'alice_tiendo', // Giữ username để phân biệt nếu cần, hoặc đổi thành 'alice'
    email: 'alice@example.com',
    user_password: 'hashed_password_1',
    level_id: 1,
  },
  {
    user_id: 'a8cc7b9f-9024-4e70-b199-e390847c8201',
    oauth_subject_id: 'oauth_002',
    profile_picture_url: 'https://example.com/images/user2.jpg',
    username: 'bob_progress', // Giữ username để phân biệt nếu cần, hoặc đổi thành 'bob'
    email: 'bob@example.com',
    user_password: 'hashed_password_2',
    level_id: 2,
  },
  {
    user_id: 'bda57a61-f03e-46db-8122-11fa7eab9d03',
    oauth_subject_id: 'oauth_003',
    profile_picture_url: 'https://example.com/images/user3.jpg',
    username: 'charlie_learner', // Giữ username để phân biệt nếu cần, hoặc đổi thành 'charlie'
    email: 'charlie@example.com',
    user_password: 'hashed_password_3',
    level_id: 1,
  },
  {
    user_id: '1b56ee5e-2789-4a78-9df5-5b3a10f09e04',
    oauth_subject_id: 'oauth_004',
    profile_picture_url: 'https://example.com/images/user4.jpg',
    username: 'diana_tracker',
    email: 'diana@example.com',
    user_password: 'hashed_password_4',
    level_id: 3,
  },
  {
    user_id: '682ee790-058b-46d3-8715-e6466cf303e5',
    oauth_subject_id: 'oauth_005',
    profile_picture_url: 'https://example.com/images/user5.jpg',
    username: 'edward_monitor',
    email: 'edward@example.com',
    user_password: 'hashed_password_5',
    level_id: 1,
  },
];
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh (Đồng bộ tên PERSON_ICON) ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png'); // Đổi tên từ PERSON_ICON_PLACEHOLDER
const DELETE_ICON = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON = require('../../assets/images/logout.png');
// --- END: Đường dẫn tới ảnh ---

// --- ConfirmDeleteModal và modalStyles (Giữ nguyên, giống TaiKhoanScreen) ---
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
  if (!visible) return null;
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
        <Pressable onPress={() => {}} style={modalStyles.modalContainer}>
          <Text style={modalStyles.messageText}>{confirmationMessage}</Text>
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text
                style={[modalStyles.buttonText, modalStyles.cancelButtonText]}>
                Không
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}>
              <Text
                style={[modalStyles.buttonText, modalStyles.confirmButtonText]}>
                Có
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const modalStyles = StyleSheet.create({
  // Giống TaiKhoanScreen
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
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
  confirmButton: {backgroundColor: COLORS.primary || '#fff9e6'}, // Giữ màu primary nếu có, nếu không thì fallback
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: COLORS.primary ? COLORS.white : '#333333'}, // Text trắng nếu button primary có màu
});
// --- END: ConfirmDeleteModal ---

// --- BEGIN: Component TienDoScreen ---
type TienDoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HomeAdmin' // Hoặc route cha thực tế
>;

const TienDoScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation<TienDoScreenNavigationProp>();

  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Đổi tên từ isConfirmDeleteModalVisible
  const [userToDelete, setUserToDelete] = useState<{
    userId: string;
    username: string;
  } | null>(null);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    if (lowerCaseQuery === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.username.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const performDeleteUser = useCallback(async (userId: string) => {
    setDeletingUserId(userId); // Giả lập API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
    setDeletingUserId(null);
    Alert.alert('Thành công', 'Đã xóa người dùng.'); // Thông báo giống TaiKhoan (nếu có)
  }, []);

  const handleModalClose = useCallback(() => {
    // Đổi tên từ handleCloseConfirmDeleteModal
    setIsModalVisible(false);
    setUserToDelete(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    // Đổi tên từ handleConfirmDelete
    if (userToDelete) {
      performDeleteUser(userToDelete.userId);
    }
    handleModalClose();
  }, [userToDelete, performDeleteUser, handleModalClose]);

  const handleDeletePress = useCallback((userId: string, username: string) => {
    Keyboard.dismiss();
    setUserToDelete({userId, username});
    setIsModalVisible(true); // Sử dụng state đã đổi tên
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
      <TouchableOpacity // Giữ TouchableOpacity để navigate
        style={styles.userItem}
        activeOpacity={0.8} // activeOpacity có thể điều chỉnh
        onPress={() => {
          console.log(
            `Xem tiến độ User: ${item.username} (ID: ${item.user_id})`,
          );
          navigation.navigate('TienDoDetail', {
            // Điều hướng đến chi tiết tiến độ
            userId: item.user_id,
            username: item.username,
          });
        }}>
        <Image
          source={PERSON_ICON} // Sử dụng PERSON_ICON đã đổi tên
          style={styles.personIcon} // Style được cập nhật bên dưới // onError có thể thêm nếu muốn xử lý lỗi tải ảnh từ profile_picture_url // source={{ uri: item.profile_picture_url }} // Nếu muốn dùng ảnh từ URL
        />

        <Text style={styles.usernameText} numberOfLines={1}>
          {item.username}
        </Text>

        <TouchableOpacity
          style={styles.deleteButton} // Style được cập nhật bên dưới
          onPress={e => {
            e.stopPropagation(); // Ngăn không cho TouchableOpacity cha bị trigger
            handleDeletePress(item.user_id, item.username);
          }}
          disabled={deletingUserId === item.user_id}></TouchableOpacity>
      </TouchableOpacity>
    ),
    [navigation, deletingUserId, handleDeletePress], // Thêm navigation vào dependencies
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={COLORS.primary}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Image
            source={LOGO_ICON}
            style={styles.headerIcon} // Đổi tên style từ headerIconMain
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo Dõi Tiến Độ</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsProfileMenuVisible(true)}>
          <Image
            source={PROFILE_ICON}
            style={styles.headerIcon} // Đổi tên style từ headerIconMain
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
          placeholder="Tìm kiếm người dùng..." // Giống TaiKhoanScreen
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onBlur={() => Keyboard.dismiss()}
        />
      </View>
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.user_id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Không tìm thấy người dùng nào.
            </Text>
          </View>
        }
      />
      <ConfirmDeleteModal
        visible={isModalVisible} // Sử dụng state đã đổi tên
        onClose={handleModalClose} // Sử dụng hàm đã đổi tên
        onConfirm={handleModalConfirm} // Sử dụng hàm đã đổi tên
        username={userToDelete?.username ?? null}
      />
      <Modal // Profile Menu Modal
        animationType="fade"
        transparent={true}
        visible={isProfileMenuVisible}
        onRequestClose={() => setIsProfileMenuVisible(false)}>
        <Pressable
          style={profileMenuStyles.backdrop}
          onPress={() => setIsProfileMenuVisible(false)}>
          <View style={profileMenuStyles.menuContainer}>
            <Pressable onPress={() => {}} accessible={false}>
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
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
// --- END: Component TienDoScreen ---

// --- BEGIN: Styles (Cập nhật để giống TaiKhoanScreen và giữ cải tiến của TienDoScreen) ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white || '#FFFFFF'}, // Giống TienDo
  header: {
    // Giữ logic Platform OS của TienDoScreen
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingBottom: 10, // Thêm paddingBottom để cân đối hơn
    height:
      Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 90, // Chiều cao động
  },
  headerButton: {padding: 5},
  headerIcon: {width: 30, height: 30}, // Đổi tên từ headerIconMain và giữ tintColor
  headerTitle: {fontSize: 20, fontWeight: 'bold', color: COLORS.white},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray2 || '#f0f0f0', // Giống TienDo
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
    tintColor: COLORS.darkGray || '#888', // Giống TienDo
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black || '#333', // Giống TienDo
    paddingVertical: 0,
  },
  listContainer: {flex: 1},
  listContentContainer: {paddingHorizontal: 15, paddingBottom: 20},
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem || '#FFF9E6', // Giống TienDo (giả sử COLORS.nenItem là '#FFF9E6')
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
    // Giống TaiKhoanScreen
    width: 28,
    height: 28,
    marginRight: 15,
    tintColor: '#666', // Giống TaiKhoanScreen // Nếu dùng ảnh từ URL (profile_picture_url) và ảnh đã có bo tròn, thì bỏ borderRadius // borderRadius: 14, // Nếu muốn icon tròn và dùng ảnh placeholder
  },
  usernameText: {
    // Giống TaiKhoanScreen (flex:1) và màu của TienDo
    flex: 1,
    fontSize: 16,
    color: COLORS.black || '#444',
    fontWeight: '500',
  },
  deleteButton: {
    // Giống TaiKhoanScreen
    padding: 5, // Giống TaiKhoanScreen (có thể là paddingHorizontal: 10, paddingVertical: 5)
    marginLeft: 10, // Giống TaiKhoanScreen
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    // Giống TaiKhoanScreen
    width: 24,
    height: 24,
    resizeMode: 'contain', // tintColor: COLORS.red, // Bỏ tintColor để giống TaiKhoan, trừ khi icon gốc không có màu đỏ
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {fontSize: 16, color: COLORS.darkGray || '#888'}, // Giống TienDo
});

const profileMenuStyles = StyleSheet.create({
  // Giữ logic Platform OS của TienDoScreen cho top
  backdrop: {flex: 1, backgroundColor: 'transparent'},
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 50 : 85, // Giữ logic TienDo
    right: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 150,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
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
// --- END: Styles ---

export default TienDoScreen;
