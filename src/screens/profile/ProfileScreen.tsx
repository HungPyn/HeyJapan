// src/screens/profile/ProfileScreen.tsx
import React, {useState, useEffect, useRef} from 'react'; // Thêm useRef
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
  StatusBar,
  Modal,
  Switch,
  Platform,
} from 'react-native';
// Bỏ import Picker nếu không dùng nữa: import {Picker} from '@react-native-picker/picker';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';

const ProfileScreen: React.FC = () => {
  const {logout} = useAuth();

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [reminderTime, setReminderTime] = useState<string>('19:30'); // Lưu thời gian dưới dạng string "HH:MM"
  const [isReminderEnabled, setIsReminderEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null); // Ref cho ScrollView

  // Hàm định dạng số thành 2 chữ số (00-23 cho giờ, 00 hoặc 30 cho phút)
  const formatTwoDigits = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  // Tạo danh sách các mốc thời gian cách nhau 30 phút
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      slots.push(`${formatTwoDigits(h)}:00`);
      slots.push(`${formatTwoDigits(h)}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const handleNotificationSettings = () => {
    setIsNotificationModalVisible(true);
    // Tùy chọn: tự động cuộn đến thời gian hiện tại khi mở modal
    // Điều này cần tính toán vị trí item, sẽ làm sau nếu cần.
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Thông báo nhắc nhở',
      icon: require('../../assets/images/notification.png'),
      action: handleNotificationSettings,
    },
  ];

  const handleSaveReminder = () => {
    console.log('Reminder Enabled:', isReminderEnabled);
    console.log('Reminder Time:', reminderTime);
    Alert.alert(
      'Đã lưu',
      `Thông báo nhắc nhở lúc ${reminderTime} đã được ${
        isReminderEnabled ? 'bật' : 'tắt'
      }.`,
    );
    setIsNotificationModalVisible(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Đăng xuất bị hủy'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Tự động cuộn đến mục đã chọn khi modal mở hoặc reminderTime thay đổi
  useEffect(() => {
    if (isNotificationModalVisible && reminderTime && scrollViewRef.current) {
      const selectedIndex = timeSlots.findIndex(slot => slot === reminderTime);
      if (selectedIndex !== -1) {
        // Giả sử mỗi item cao khoảng 45 (paddingVertical * 2 + fontSize)
        // Bạn cần điều chỉnh giá trị này cho phù hợp với style của timeSlotButton_NEW
        const itemHeight = SIZES.padding * 0.75 * 2 + (SIZES.h3 || 20); // Ước lượng chiều cao item
        const scrollToY = selectedIndex * itemHeight - itemHeight * 2; // Cuộn để item ở giữa
        scrollViewRef.current.scrollTo({
          y: Math.max(0, scrollToY),
          animated: true,
        });
      }
    }
  }, [isNotificationModalVisible, reminderTime, timeSlots]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.3}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.avatar}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Cài đặt</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.action}>
                <Image
                  source={item.icon}
                  style={styles.menuIconText}
                  resizeMode="contain"
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Image
                source={require('../../assets/images/logout.png')}
                style={styles.menuIconText}
                resizeMode="contain"
              />
              <Text style={styles.menuItemText}>Đăng xuất</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Modal Thông báo nhắc nhở với ScrollView các lựa chọn thời gian */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNotificationModalVisible}
        onRequestClose={() => {
          setIsNotificationModalVisible(!isNotificationModalVisible);
        }}>
        <View style={modalStyles.centeredView_NEW}>
          <View style={modalStyles.modalView_NEW}>
            <Text style={modalStyles.modalTitle_NEW}>Thông báo nhắc nhở</Text>

            <View style={modalStyles.timeSwitchRow_NEW}>
              <Text style={modalStyles.selectedTimeText_NEW}>
                {reminderTime}
              </Text>

              <Switch
                trackColor={{false: COLORS.gray, true: COLORS.green}}
                thumbColor={isReminderEnabled ? COLORS.white : COLORS.lightGray}
                ios_backgroundColor={COLORS.gray}
                onValueChange={() =>
                  setIsReminderEnabled(previousState => !previousState)
                }
                value={isReminderEnabled}
              />
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.white,
                width: '100%',
                marginVertical: 10,
              }}
            />

            {/* Phần chọn thời gian bằng ScrollView các lựa chọn */}
            <View style={modalStyles.timeSlotsScrollViewContainer_NEW}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true} // Cho phép cuộn bên trong Modal trên Android
              >
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index} // Nên dùng index nếu slot có thể trùng (mặc dù ở đây không)
                    style={[
                      modalStyles.timeSlotButton_NEW,
                      reminderTime === slot &&
                        modalStyles.timeSlotButtonSelected_NEW,
                    ]}
                    onPress={() => setReminderTime(slot)}>
                    <Text
                      style={[
                        modalStyles.timeSlotText_NEW,
                        reminderTime === slot &&
                          modalStyles.timeSlotTextSelected_NEW,
                      ]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={modalStyles.saveButton_NEW}
              onPress={handleSaveReminder}>
              <Text style={modalStyles.saveButtonText_NEW}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- STYLES GỐC CỦA BẠN (Không thay đổi) ---
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background},
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding,
    marginTop: StatusBar.currentHeight || 20,
  },
  avatar: {width: 36, height: 36, marginRight: SIZES.padding},
  headerTitleContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 7.5,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius * 10,
  },
  headerTitle: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {flex: 1, paddingHorizontal: SIZES.padding * 1.5, marginTop: 50},
  menuItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    marginBottom: SIZES.margin,
    borderRadius: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  menuIconText: {
    width: SIZES.large || 24,
    height: SIZES.large || 24,
    marginRight: SIZES.padding * 1.5,
  },
  menuItemText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large || 16,
    color: COLORS.black,
    flex: 1,
  },
  menuItemArrow: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large || 24,
    color: COLORS.gray,
  },
  logoutButton: {},
  logoutText: {},
});
// --- KẾT THÚC STYLES GỐC ---

// --- STYLES MỚI CHỈ DÀNH CHO MODAL VÀ DANH SÁCH CUỘN THỜI GIAN (Thêm vào cuối) ---
const modalStyles = StyleSheet.create({
  centeredView_NEW: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView_NEW: {
    width: SIZES.width * 0.85,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.padding * 1.5, // Giảm padding dọc một chút
    paddingHorizontal: SIZES.padding * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2,
    color: COLORS.white,
    marginBottom: SIZES.padding * 1.5,
    fontWeight: 'bold',
  },
  timeSwitchRow_NEW: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',

    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding * 0.5,
  },
  hr: {
    borderBottomColor: '#ccc', // màu xám nhẹ
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 10, // khoảng cách trên dưới
  },
  selectedTimeText_NEW: {
    fontWeight: 'bold',
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontSize: SIZES.h2, // To hơn một chút
    color: COLORS.white,
  },
  timeSlotsScrollViewContainer_NEW: {
    // Container cho ScrollView
    height: SIZES.height * 0.17, // Giới hạn chiều cao của ScrollView, ví dụ 25% chiều cao màn hình
    width: '50%', // Chiều rộng của ScrollView, có thể '100%' của modalView

    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding * 1.5,
  },
  timeSlotButton_NEW: {
    paddingVertical: SIZES.padding * 0.75,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray, // Đường kẻ mờ hơn giữa các item
  },
  timeSlotButtonSelected_NEW: {},
  timeSlotText_NEW: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.h3, // Cỡ chữ cho các mốc thời gian
    color: COLORS.lightGray, // Màu chữ mờ hơn khi chưa chọn
  },
  timeSlotTextSelected_NEW: {
    color: COLORS.white, // Màu chữ trắng rõ khi được chọn
    fontWeight: 'bold',
  },
  saveButton_NEW: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.padding * 0.8,
    paddingHorizontal: SIZES.padding * 4,
    elevation: 2,
    width: '80%',
    alignItems: 'center',
    marginTop: SIZES.padding * 0.5, // Giảm margin top nếu ScrollView đã có margin bottom
  },
  saveButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.green,
  },
});

export default ProfileScreen;
