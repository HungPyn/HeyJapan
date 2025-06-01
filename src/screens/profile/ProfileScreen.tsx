// src/screens/profile/ProfileScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
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
  PermissionsAndroid, // Đã thêm
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import PushNotification from 'react-native-push-notification'; // Đã thêm
import AsyncStorage from '@react-native-async-storage/async-storage'; // Đã thêm
import {showMessage} from 'react-native-flash-message'; // Đã thêm
// Đảm bảo đường dẫn này chính xác tới file App.tsx của bạn
import {PROFILE_REMINDER_CHANNEL_ID} from '../../../App';

// ID duy nhất cho thông báo của màn hình Profile
const PROFILE_NOTIFICATION_UNIQUE_ID = 'userProfileReminderScheduled001';

// Hàm xin quyền thông báo (cho Android 13+)
const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Quyền Gửi Thông Báo',
            message:
              'Ứng dụng cần quyền này để gửi thông báo nhắc nhở bạn học tập.',
            buttonNeutral: 'Để sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Cho phép',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(
            '[ProfileScreen] Đã cấp quyền gửi thông báo (Android 13+).',
          );
          return true;
        } else {
          console.log(
            '[ProfileScreen] Quyền gửi thông báo bị từ chối (Android 13+).',
          );
          Alert.alert(
            'Thông báo',
            'Bạn đã từ chối quyền gửi thông báo. Tính năng nhắc nhở sẽ không hoạt động.',
          );
          return false;
        }
      } catch (err) {
        console.warn('[ProfileScreen] Lỗi xin quyền thông báo:', err);
        return false;
      }
    }
    console.log(
      '[ProfileScreen] Android < 13, quyền thông báo được coi là đã cấp (trừ khi bị chặn trong cài đặt).',
    );
    return true;
  }
  console.log(
    '[ProfileScreen] Không phải Android, bỏ qua xin quyền POST_NOTIFICATIONS.',
  );
  return true;
};

const ProfileScreen: React.FC = () => {
  const {logout} = useAuth();

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [reminderTime, setReminderTime] = useState<string>('19:30');
  const [isReminderEnabled, setIsReminderEnabled] = useState(false); // Mặc định là tắt
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadReminderSettings = async () => {
      try {
        const enabledJSON = await AsyncStorage.getItem(
          'profileReminderEnabled_v1',
        );
        if (enabledJSON !== null) {
          const enabled = JSON.parse(enabledJSON);
          setIsReminderEnabled(enabled);
          console.log(
            '[ProfileScreen] Đã tải isReminderEnabled từ AsyncStorage:',
            enabled,
          );
        } else {
          setIsReminderEnabled(false); // Mặc định là tắt nếu chưa từng đặt
          console.log(
            '[ProfileScreen] Không tìm thấy isReminderEnabled trong AsyncStorage, đặt thành false.',
          );
        }
        const time = await AsyncStorage.getItem('profileReminderTime_v1');
        if (time !== null) {
          setReminderTime(time);
          console.log(
            '[ProfileScreen] Đã tải reminderTime từ AsyncStorage:',
            time,
          );
        } else {
          setReminderTime('19:30'); // Thời gian mặc định nếu chưa có
          console.log(
            '[ProfileScreen] Không tìm thấy reminderTime trong AsyncStorage, đặt thành 19:30.',
          );
        }
      } catch (e) {
        console.error(
          '[ProfileScreen] Lỗi tải cài đặt nhắc nhở từ AsyncStorage:',
          e,
        );
      }
    };
    loadReminderSettings();
  }, []);

  const formatTwoDigits = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      slots.push(`${formatTwoDigits(h)}:00`);
      // Giữ nguyên XX:28 như file bạn cung cấp, nếu muốn XX:30 thì sửa ở đây
      slots.push(`${formatTwoDigits(h)}:57`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const handleNotificationSettings = () => {
    setIsNotificationModalVisible(true);
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Thông báo nhắc nhở',
      icon: require('../../assets/images/notification.png'),
      action: handleNotificationSettings,
    },
  ];

  const handleSaveReminder = async () => {
    console.log(
      '[ProfileScreen] Bắt đầu handleSaveReminder. isReminderEnabled:',
      isReminderEnabled,
      'reminderTime:',
      reminderTime,
    );
    setIsNotificationModalVisible(false);

    if (isReminderEnabled) {
      console.log('[ProfileScreen] Nhắc nhở đang BẬT. Tiến hành đặt lịch.');
      if (Platform.OS === 'android') {
        // Chỉ kiểm tra quyền cho Android
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          console.log(
            '[ProfileScreen] Quyền không được cấp. Tự động tắt Switch và lưu.',
          );
          setIsReminderEnabled(false);
          try {
            await AsyncStorage.setItem(
              'profileReminderEnabled_v1',
              JSON.stringify(false),
            );
            // Không cần lưu reminderTime mới nếu nhắc nhở bị tắt do từ chối quyền
          } catch (e) {
            console.error(
              '[ProfileScreen] Lỗi lưu trạng thái nhắc nhở (quyền từ chối):',
              e,
            );
          }
          return;
        }
        console.log(
          '[ProfileScreen] Quyền đã được cấp (hoặc không cần thiết cho phiên bản Android này).',
        );
      }

      const [hourStr, minuteStr] = reminderTime.split(':');
      const selectedHour = parseInt(hourStr, 10);
      const selectedMinute = parseInt(minuteStr, 10);

      console.log(
        `[ProfileScreen] Đã parse thời gian: Hour=${selectedHour}, Minute=${selectedMinute}`,
      );

      if (isNaN(selectedHour) || isNaN(selectedMinute)) {
        showMessage({
          message: 'Thời gian nhắc nhở không hợp lệ.',
          type: 'danger',
        });
        console.error('[ProfileScreen] Thời gian parse không hợp lệ.');
        return;
      }

      const now = new Date();
      const notificationFireDate = new Date();
      notificationFireDate.setHours(selectedHour, selectedMinute, 0, 0);

      console.log(
        `[ProfileScreen] Thời gian ban đầu được đặt (trước khi kiểm tra quá khứ): ${notificationFireDate.toLocaleString()}`,
      );
      console.log(
        `[ProfileScreen] Thời gian hiện tại trên máy: ${now.toLocaleString()}`,
      );

      if (notificationFireDate.getTime() <= now.getTime()) {
        notificationFireDate.setDate(notificationFireDate.getDate() + 1);
        console.log(
          `[ProfileScreen] Thời gian đã qua, điều chỉnh cho ngày mai: ${notificationFireDate.toLocaleString()}`,
        );
      }

      console.log('[ProfileScreen] Hủy bỏ thông báo cũ (nếu có)...');
      PushNotification.cancelLocalNotification(PROFILE_NOTIFICATION_UNIQUE_ID);

      const logDate = new Date(notificationFireDate.getTime()); // Tạo bản sao để log
      console.log(`[ProfileScreen] Chuẩn bị đặt lịch với các thông số:
        channelId: ${PROFILE_REMINDER_CHANNEL_ID},
        id: ${PROFILE_NOTIFICATION_UNIQUE_ID},
        message: 'Đến giờ học rồi! Mở HeyJapan lên nào bạn ơi! 📖',
        date (UTC): ${logDate.toISOString()} (Timestamp: ${logDate.getTime()}),
        date (Local for schedule): ${notificationFireDate.toLocaleString()},
        allowWhileIdle: true,
        repeatType: 'day',
        title: '⏰ HeyJapan Nhắc Nhở Học Tập',
        bigText: 'Đã đến ${reminderTime}! Hãy dành chút thời gian để học tiếng Nhật cùng HeyJapan nhé!'
      `);

      PushNotification.localNotificationSchedule({
        channelId: PROFILE_REMINDER_CHANNEL_ID,
        id: PROFILE_NOTIFICATION_UNIQUE_ID,
        message: 'Đến giờ học rồi! Mở HeyJapan lên nào bạn ơi! 📖',
        date: notificationFireDate, // Đối tượng Date đã được điều chỉnh
        allowWhileIdle: true,
        repeatType: 'day',
        title: '⏰ HeyJapan Nhắc Nhở Học Tập',
        bigText: `Đã đến ${reminderTime}! Hãy dành chút thời gian để học tiếng Nhật cùng HeyJapan nhé!`,
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
      });

      showMessage({
        message: `Đã đặt nhắc nhở vào ${reminderTime} hàng ngày.`,
        type: 'success',
        icon: 'success',
      });
      console.log(
        `[ProfileScreen] Đã lên lịch thông báo ID ${PROFILE_NOTIFICATION_UNIQUE_ID} vào (local time): ${notificationFireDate.toLocaleString()}`,
      );
    } else {
      console.log('[ProfileScreen] Nhắc nhở đang TẮT. Hủy bỏ thông báo.');
      PushNotification.cancelLocalNotification(PROFILE_NOTIFICATION_UNIQUE_ID);
      showMessage({
        message: 'Đã tắt nhắc nhở.',
        type: 'info',
        icon: 'info',
      });
      console.log(
        `[ProfileScreen] Đã hủy thông báo với ID: ${PROFILE_NOTIFICATION_UNIQUE_ID}`,
      );
    }

    try {
      console.log(
        '[ProfileScreen] Lưu cài đặt vào AsyncStorage: isReminderEnabled =',
        isReminderEnabled,
        ', reminderTime =',
        reminderTime,
      );
      await AsyncStorage.setItem(
        'profileReminderEnabled_v1',
        JSON.stringify(isReminderEnabled),
      );
      await AsyncStorage.setItem('profileReminderTime_v1', reminderTime);
    } catch (e) {
      console.error('[ProfileScreen] Lỗi lưu cài đặt nhắc nhở:', e);
    }
    console.log('[ProfileScreen] Kết thúc handleSaveReminder.');
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

  useEffect(() => {
    if (isNotificationModalVisible && reminderTime && scrollViewRef.current) {
      const selectedIndex = timeSlots.findIndex(slot => slot === reminderTime);
      if (selectedIndex !== -1) {
        const itemHeight = SIZES.padding * 0.75 * 2 + (SIZES.h3 || 20);
        const scrollToY = selectedIndex * itemHeight - itemHeight * 2;
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
                onValueChange={newValue => setIsReminderEnabled(newValue)}
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
            <View style={modalStyles.timeSlotsScrollViewContainer_NEW}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
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
    paddingVertical: SIZES.padding * 1.5,
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
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    marginVertical: 10,
  },
  selectedTimeText_NEW: {
    fontWeight: 'bold',
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontSize: SIZES.h2,
    color: COLORS.white,
  },
  timeSlotsScrollViewContainer_NEW: {
    height: SIZES.height * 0.17,
    width: '50%',

    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding * 1.5,
  },
  timeSlotButton_NEW: {
    paddingVertical: SIZES.padding * 0.75,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  timeSlotButtonSelected_NEW: {},
  timeSlotText_NEW: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.h3,
    color: COLORS.lightGray,
  },
  timeSlotTextSelected_NEW: {
    color: COLORS.white,
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
    marginTop: SIZES.padding * 0.5,
  },
  saveButtonText_NEW: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.green,
  },
});

export default ProfileScreen;
