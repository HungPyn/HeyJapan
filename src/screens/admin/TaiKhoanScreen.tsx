import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert, // << THÊM Alert để xác nhận đăng xuất
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native';
// Giả sử bạn có file định nghĩa màu sắc
import {COLORS} from '../../constants/theme';
// --- IMPORT useAuth ---
import {useAuth} from '../auth/AuthContext'; // << Đảm bảo đường dẫn đúng

// --- BEGIN: Dữ liệu và Type ---
// Định nghĩa kiểu dữ liệu cho User
type User = {
  user_id: string;
  oauth_subject_id: string;
  profile_picture_url: string;
  username: string;
  email: string;
  user_password?: string;
  level_id?: number;
};

// Dữ liệu mẫu bạn cung cấp
const initialUsersData: User[] = [
  {
    user_id: 'f23b8f14-6a2b-4c6e-8e3f-1d4823e8b001',
    oauth_subject_id: 'oauth_001',
    profile_picture_url: 'https://example.com/images/user1.jpg',
    username: 'alice',
    email: 'alice@example.com',
    user_password: 'hashed_password_1',
    level_id: 1,
  },
  {
    user_id: 'a8cc7b9f-9024-4e70-b199-e390847c8201',
    oauth_subject_id: 'oauth_002',
    profile_picture_url: 'https://example.com/images/user2.jpg',
    username: 'bob',
    email: 'bob@example.com',
    user_password: 'hashed_password_2',
    level_id: 2,
  },
  {
    user_id: 'bda57a61-f03e-46db-8122-11fa7eab9d03',
    oauth_subject_id: 'oauth_003',
    profile_picture_url: 'https://example.com/images/user3.jpg',
    username: 'charlie',
    email: 'charlie@example.com',
    user_password: 'hashed_password_3',
    level_id: 1,
  },
  {
    user_id: '1b56ee5e-2789-4a78-9df5-5b3a10f09e04',
    oauth_subject_id: 'oauth_004',
    profile_picture_url: 'https://example.com/images/user4.jpg',
    username: 'diana',
    email: 'diana@example.com',
    user_password: 'hashed_password_4',
    level_id: 3,
  },
  {
    user_id: '682ee790-058b-46d3-8715-e6466cf303e5',
    oauth_subject_id: 'oauth_005',
    profile_picture_url: 'https://example.com/images/user5.jpg',
    username: 'edward',
    email: 'edward@example.com',
    user_password: 'hashed_password_5',
    level_id: 1,
  },
  {
    user_id: 'd12a0795-5c20-47f3-bbb4-28156fc37f06',
    oauth_subject_id: 'oauth_006',
    profile_picture_url: 'https://example.com/images/user6.jpg',
    username: 'frank',
    email: 'frank@example.com',
    user_password: 'hashed_password_6',
    level_id: 2,
  },
  {
    user_id: 'decc82b2-efb6-4f30-986b-bb070ca2d607',
    oauth_subject_id: 'oauth_007',
    profile_picture_url: 'https://example.com/images/user7.jpg',
    username: 'grace',
    email: 'grace@example.com',
    user_password: 'hashed_password_7',
    level_id: 3,
  },
  {
    user_id: '6c73dbb5-ec58-4c37-8f52-824c4eb1c708',
    oauth_subject_id: 'oauth_008',
    profile_picture_url: 'https://example.com/images/user8.jpg',
    username: 'henry',
    email: 'henry@example.com',
    user_password: 'hashed_password_8',
    level_id: 2,
  },
  {
    user_id: '9df7ed29-31e1-4bcb-b537-65b5cfcfa209',
    oauth_subject_id: 'oauth_009',
    profile_picture_url: 'https://example.com/images/user9.jpg',
    username: 'irene',
    email: 'irene@example.com',
    user_password: 'hashed_password_9',
    level_id: 1,
  },
  {
    user_id: 'b1323eb3-1738-46ea-bab7-90850f2d800a',
    oauth_subject_id: 'oauth_010',
    profile_picture_url: 'https://example.com/images/user10.jpg',
    username: 'jack',
    email: 'jack@example.com',
    user_password: 'hashed_password_10',
    level_id: 2,
  },
];
// --- END: Dữ liệu và Type ---

// --- BEGIN: Đường dẫn tới ảnh ---
const LOGO_ICON = require('../../assets/images/Logo.png');
const PROFILE_ICON = require('../../assets/images/IconUserHeader.png');
const SEARCH_ICON = require('../../assets/images/IconTimKiem.png');
const PERSON_ICON = require('../../assets/images/IconUser.png');
const DELETE_ICON = require('../../assets/images/iconThungRac.png');
const LOGOUT_ICON = require('../../assets/images/logout.png');
// --- END: Đường dẫn tới ảnh ---

// --- BEGIN: Định nghĩa ConfirmDeleteModal và styles của nó ---
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
        <Pressable onPress={() => {}}>
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
  confirmButton: {backgroundColor: '#fff9e6'},
  buttonText: {fontSize: 16, fontWeight: '500'},
  cancelButtonText: {color: '#555555'},
  confirmButtonText: {color: '#333333'},
});
// --- END: Định nghĩa ConfirmDeleteModal và styles của nó ---

// --- BEGIN: Component TaiKhoanScreen ---
const TaiKhoanScreen = () => {
  const {logout} = useAuth();

  const [users, setUsers] = useState<User[]>(initialUsersData);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
    setDeletingUserId(userId);
    console.log('Bắt đầu xóa user:', userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
    console.log('Đã xóa user (giả lập):', userId);
    setDeletingUserId(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setUserToDelete(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (userToDelete) {
      performDeleteUser(userToDelete.userId);
    }
    handleModalClose();
  }, [userToDelete, performDeleteUser, handleModalClose]);

  const handleDeletePress = useCallback((userId: string, username: string) => {
    Keyboard.dismiss();
    setUserToDelete({userId, username});
    setIsModalVisible(true);
  }, []);

  // --- SỬA Ở ĐÂY: Bỏ khoảng trắng thừa quanh item.username ---
  const renderUserItem = useCallback(
    ({item}: {item: User}) => (
      <View style={styles.userItem}>
        <Image source={PERSON_ICON} style={styles.personIcon} />
        <Text style={styles.usernameText} numberOfLines={1}>
          {item.username} {/* << ĐÃ BỎ {' '} */}
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
  // --- KẾT THÚC SỬA ---

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
            await logout();
            console.log('Đã đăng xuất.');
          },
        },
      ],
      {cancelable: true},
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
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
          <View style={profileMenuStyles.menuContainer}>
            <Pressable onPress={() => {}}>
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
// --- END: Component TaiKhoanScreen ---

// --- BEGIN: Styles chính của TaiKhoanScreen ---
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
    backgroundColor: COLORS.nenItem,
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
    marginTop: 50,
  },
  emptyListText: {fontSize: 16, color: '#888'},
});
// --- END: Styles chính của TaiKhoanScreen ---

// --- THÊM STYLES CHO PROFILE MENU ---
const profileMenuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    right: 15,
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
