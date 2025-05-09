// App.tsx
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/index';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  // 3. Sử dụng useEffect để ẩn SplashScreen
  useEffect(() => {
    // Các tác vụ khởi tạo khác của ứng dụng có thể được đặt ở đây nếu cần

    SplashScreen.hide(); // Lệnh này sẽ ẩn màn hình chờ (splash screen)
  }, []); // Mảng rỗng [] đảm bảo effect này chỉ chạy một lần sau khi component App render lần đầu

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
