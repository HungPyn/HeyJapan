// App.tsx
import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/index';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';

// --- THÊM CÁC IMPORT CHO PUSH NOTIFICATION ---
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';
// --- KẾT THÚC IMPORT CHO PUSH NOTIFICATION ---

// --- ĐỊNH NGHĨA VÀ EXPORT ID KÊNH THÔNG BÁO ---
// Bạn sẽ import ID này vào ProfileScreen.tsx
export const PROFILE_REMINDER_CHANNEL_ID = 'profile-reminder-channel-v1'; // Đặt tên ID kênh của bạn
// --- KẾT THÚC ĐỊNH NGHĨA ID KÊNH ---

const App = () => {
  useEffect(() => {
    SplashScreen.hide();

    // --- CẤU HÌNH PUSH NOTIFICATION VÀ TẠO KÊNH ---
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('APP.TSX - NOTIFICATION:', notification);
        // Xử lý khi thông báo được nhấn
        // Ví dụ: nếu thông báo có data payload để điều hướng
        // if (notification.userInteraction && notification.data && notification.data.screen) {
        //   // Điều hướng ở đây, bạn cần có instance của navigation
        //   // Điều này có thể phức tạp hơn nếu AppNavigator chưa sẵn sàng
        // }
      },
      // onRegister: function(token) {
      //   console.log("APP.TSX - TOKEN:", token);
      // },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: PROFILE_REMINDER_CHANNEL_ID, // Sử dụng ID kênh đã định nghĩa
          channelName: 'Nhắc nhở HeyJapan', // Tên kênh sẽ hiển thị cho người dùng
          channelDescription:
            'Kênh dành cho các nhắc nhở bạn đã đặt trong ứng dụng HeyJapan.',
          playSound: true,
          soundName: 'default',
          importance: 4, // (Importance.HIGH)
          vibrate: true,
        },
        created =>
          console.log(
            `Kênh thông báo "${PROFILE_REMINDER_CHANNEL_ID}" được tạo: ${created}`,
          ),
      );
    }
    // --- KẾT THÚC CẤU HÌNH PUSH NOTIFICATION ---
  }, []); // useEffect này chỉ chạy một lần khi App mount

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppNavigator />
        <FlashMessage position="center" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
