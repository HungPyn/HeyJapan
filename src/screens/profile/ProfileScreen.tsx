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
  PermissionsAndroid,
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import {useAuth} from '../auth/AuthContext';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  AndroidNotificationSetting,
} from '@notifee/react-native'; // Thay thế PushNotification
import DateTimePicker from '@react-native-community/datetimepicker'; // Thêm DateTimePicker
import moment from 'moment'; // Thêm moment
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';

// ID kênh thông báo
const PROFILE_REMINDER_CHANNEL_ID = 'profile-reminders-channel';

// ID duy nhất cho thông báo của màn hình Profile
const PROFILE_NOTIFICATION_UNIQUE_ID = 'userProfileReminderScheduled001';

// Hàm khởi tạo kênh thông báo
const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: PROFILE_REMINDER_CHANNEL_ID,
      name: 'Nhắc nhở học tập',
      description: 'Kênh thông báo nhắc nhở học tập hàng ngày',
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    console.log(
      '[ProfileScreen] Đã tạo kênh thông báo:',
      PROFILE_REMINDER_CHANNEL_ID,
    );
  }
};

// Hàm kiểm tra quyền thông báo
const checkNotificationPermission = async () => {
  const settings = await notifee.getNotificationSettings();

  if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    console.log('[ProfileScreen] Quyền thông báo đã được cấp.');
    return true;
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('[ProfileScreen] Quyền thông báo bị từ chối.');
    return false;
  } else {
    console.log('[ProfileScreen] Cần yêu cầu quyền thông báo.');
    return false;
  }
};

// Hàm yêu cầu quyền thông báo
const requestNotificationPermission = async () => {
  try {
    const settings = await notifee.requestPermission({
      sound: true,
      alert: true,
      badge: true,
      criticalAlert: true,
    });

    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      console.log('[ProfileScreen] Quyền thông báo đã được cấp.');

      // Với Android 13+, kiểm tra thêm quyền POST_NOTIFICATIONS
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Kiểm tra quyền chi tiết trên Android
        const androidSettings = await notifee.getNotificationSettings();

        if (
          androidSettings.android.alarm === AndroidNotificationSetting.ENABLED
        ) {
          console.log(
            '[ProfileScreen] Quyền SCHEDULE_EXACT_ALARM đã được cấp.',
          );
          return true;
        } else {
          console.log('[ProfileScreen] Chưa có quyền SCHEDULE_EXACT_ALARM.');
          // Yêu cầu quyền bổ sung thông qua PermissionsAndroid nếu cần
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
                '[ProfileScreen] Đã cấp quyền POST_NOTIFICATIONS thành công.',
              );
              return true;
            } else {
              console.log(
                '[ProfileScreen] Quyền POST_NOTIFICATIONS bị từ chối.',
              );
              Alert.alert(
                'Thông báo',
                'Bạn đã từ chối quyền gửi thông báo. Tính năng nhắc nhở sẽ không hoạt động.',
              );
              return false;
            }
          } catch (err) {
            console.warn(
              '[ProfileScreen] Lỗi khi yêu cầu quyền POST_NOTIFICATIONS:',
              err,
            );
            return false;
          }
        }
      }
      return true;
    } else {
      console.log('[ProfileScreen] Quyền thông báo bị từ chối.');
      Alert.alert(
        'Thông báo',
        'Bạn cần cấp quyền thông báo để sử dụng tính năng nhắc nhở.',
      );
      return false;
    }
  } catch (err) {
    console.error('[ProfileScreen] Lỗi khi yêu cầu quyền thông báo:', err);
    return false;
  }
};

const ProfileScreen: React.FC = () => {
  const {logout} = useAuth();

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);

  // State mới để lưu trữ thời gian dưới dạng Date object
  const [reminderDate, setReminderDate] = useState<Date>(new Date());

  // State để hiển thị DateTimePicker
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Khởi tạo thông báo khi component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      await createNotificationChannel();
    };

    initializeNotifications();
  }, []);

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
          setIsReminderEnabled(false);
          console.log(
            '[ProfileScreen] Không tìm thấy isReminderEnabled trong AsyncStorage, đặt thành false.',
          );
        }

        const timeString = await AsyncStorage.getItem('profileReminderTime_v1');
        if (timeString !== null) {
          const [hours, minutes] = timeString.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          setReminderDate(date);
          console.log(
            '[ProfileScreen] Đã tải reminderTime từ AsyncStorage:',
            timeString,
            'Chuyển thành Date:',
            date.toLocaleTimeString(),
          );
        } else {
          const defaultDate = new Date();
          defaultDate.setHours(19, 30, 0, 0);
          setReminderDate(defaultDate);
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

  const handleNotificationSettings = () => {
    setIsNotificationModalVisible(true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Ẩn picker trên Android sau khi chọn

    if (selectedDate) {
      console.log(
        '[ProfileScreen] Thời gian đã chọn:',
        selectedDate.toLocaleTimeString(),
      );
      setReminderDate(selectedDate);
    }
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
      'reminderDate:',
      reminderDate.toLocaleTimeString(),
    );
    setIsNotificationModalVisible(false);

    if (isReminderEnabled) {
      console.log('[ProfileScreen] Nhắc nhở đang BẬT. Tiến hành đặt lịch.');

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
        } catch (e) {
          console.error(
            '[ProfileScreen] Lỗi lưu trạng thái nhắc nhở (quyền từ chối):',
            e,
          );
        }
        return;
      }

      console.log(
        '[ProfileScreen] Quyền đã được cấp. Tiến hành lên lịch thông báo.',
      );

      await notifee.cancelNotification(PROFILE_NOTIFICATION_UNIQUE_ID);
      console.log('[ProfileScreen] Đã hủy thông báo cũ (nếu có)');

      const now = new Date();
      const triggerDate = new Date();
      triggerDate.setHours(
        reminderDate.getHours(),
        reminderDate.getMinutes(),
        0,
        0,
      );

      console.log(
        `[ProfileScreen] Thời gian ban đầu được đặt: ${triggerDate.toLocaleString()}`,
      );
      console.log(
        `[ProfileScreen] Thời gian hiện tại: ${now.toLocaleString()}`,
      );

      if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
        console.log(
          `[ProfileScreen] Thời gian đã qua, điều chỉnh cho ngày mai: ${triggerDate.toLocaleString()}`,
        );
      }

      // Tạo trigger cho notifee
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      // Định dạng thời gian đẹp hơn với moment
      const formattedTime = moment(reminderDate).format('HH:mm');

      console.log(`[ProfileScreen] Chuẩn bị đặt lịch thông báo với các thông số:
        id: ${PROFILE_NOTIFICATION_UNIQUE_ID},
        title: '⏰ HeyJapan Nhắc Nhở Học Tập',
        body: 'Đến giờ học rồi! Mở HeyJapan lên nào bạn ơi! 📖',
        triggerDate: ${triggerDate.toLocaleString()} (${triggerDate.getTime()}),
        repeatFrequency: DAILY
      `);

      // Lên lịch thông báo với notifee
      await notifee.createTriggerNotification(
        {
          id: PROFILE_NOTIFICATION_UNIQUE_ID,
          title: '⏰ HeyJapan Nhắc Nhở Học Tập',
          body: `Đã đến ${formattedTime}! Hãy dành chút thời gian để học tiếng Nhật cùng HeyJapan nhé!`,
          android: {
            channelId: PROFILE_REMINDER_CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'logoopen', // Đổi thành tên biểu tượng trong dự án của bạn
            color: COLORS.primary,
            sound: 'default',
            vibrationPattern: [300, 500],
            lights: ['#FF0000', 300, 600],
          },
        },
        trigger,
      );

      showMessage({
        message: `Đã đặt nhắc nhở vào ${formattedTime} hàng ngày.`,
        type: 'success',
        icon: 'success',
      });
      console.log(
        `[ProfileScreen] Đã lên lịch thông báo ID ${PROFILE_NOTIFICATION_UNIQUE_ID} vào ${triggerDate.toLocaleString()}`,
      );
    } else {
      console.log('[ProfileScreen] Nhắc nhở đang TẮT. Hủy bỏ thông báo.');
      await notifee.cancelNotification(PROFILE_NOTIFICATION_UNIQUE_ID);
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
        moment(reminderDate).format('HH:mm'),
      );

      await AsyncStorage.setItem(
        'profileReminderEnabled_v1',
        JSON.stringify(isReminderEnabled),
      );

      // Lưu thời gian dưới dạng chuỗi HH:MM
      await AsyncStorage.setItem(
        'profileReminderTime_v1',
        moment(reminderDate).format('HH:mm'),
      );
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

      {/* Modal cài đặt thông báo */}
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
              {/* Hiển thị thời gian đã chọn */}
              <TouchableOpacity
                style={modalStyles.timePickerButton_NEW}
                onPress={() => setShowTimePicker(true)}>
                <Text style={modalStyles.selectedTimeText_NEW}>
                  {moment(reminderDate).format('HH:mm')}
                </Text>
              </TouchableOpacity>

              <Switch
                trackColor={{false: COLORS.gray, true: COLORS.green}}
                thumbColor={isReminderEnabled ? COLORS.white : COLORS.lightGray}
                ios_backgroundColor={COLORS.gray}
                onValueChange={newValue => setIsReminderEnabled(newValue)}
                value={isReminderEnabled}
              />
            </View>

            {/* Hiển thị DateTimePicker khi cần */}
            {showTimePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}

            <View style={modalStyles.infoContainer_NEW}>
              <Text style={modalStyles.infoText_NEW}>
                Bạn sẽ nhận được thông báo nhắc nhở học tập vào lúc{' '}
                {moment(reminderDate).format('HH:mm')} hàng ngày.
              </Text>
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

// --- STYLES MỚI (Đã chỉnh sửa cho DateTimePicker) ---
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
  timePickerButton_NEW: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  selectedTimeText_NEW: {
    fontWeight: 'bold',
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontSize: SIZES.h2,
    color: COLORS.white,
  },
  infoContainer_NEW: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.padding * 1.5,
    width: '100%',
  },
  infoText_NEW: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.h4 || 14,
    color: COLORS.white,
    textAlign: 'center',
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
