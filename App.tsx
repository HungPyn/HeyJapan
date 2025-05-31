// App.tsx (Đã sửa)
import 'react-native-gesture-handler'; // <-- QUAN TRỌNG: Đặt ở dòng đầu tiên nếu App.tsx là file gốc nhất
import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler'; // <-- THÊM IMPORT NÀY
import AppNavigator from './src/navigation/index';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';
// import { PaperProvider } from 'react-native-paper'; // <-- Thêm PaperProvider nếu bạn dùng và chưa có ở AppNavigator

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    // Bọc toàn bộ ứng dụng bằng GestureHandlerRootView
    // style={{ flex: 1 }} rất quan trọng để nó chiếm toàn bộ không gian
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        {/* <PaperProvider> // Nếu bạn dùng PaperProvider ở đây */}
        <AppNavigator />
        <FlashMessage position="center" />
        {/* </PaperProvider> */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
