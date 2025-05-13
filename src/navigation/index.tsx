// src/navigation/index.tsx
import React from 'react';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native'; // Giữ lại Text, View nếu bạn có dùng ở đâu đó khác mà tôi không thấy
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens (Giữ nguyên)
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CourseListScreen from '../screens/courses/CourseListScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import LessonScreen from '../screens/lessons/LessonScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DictionaryScreen from '../screens/tools/DictionaryScreen';
import TienDoScreen from '../screens/tools/TienDoScreen';
import {COLORS} from '../constants/theme';
import {AuthProvider, useAuth} from '../screens/auth/AuthContext';
import SelectionScreen from '../screens/courses/SelectionScreen';
import {ActivityIndicator} from 'react-native-paper';
import ContentsLyThuyetScreen from '../screens/courses/ContentsLyThuyetScreen';
import ContentsScreen from '../screens/courses/ContentsScreen';
import HomeAdminScreen from '../screens/admin/HomeAdminScreen';
import LessonAdminScreen from '../screens/admin/LessonAdminScreen';
import ContentAdminScreen from '../screens/admin/ContensAdminScreen';
import TienDoDetailScreen from '../screens/admin/TienDoDetailScreen';

// Định nghĩa các type cho navigation (Giữ nguyên)
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Selection: undefined;
  Loading: undefined;
  CourseDetail: {courseId: string};
  Lesson: {lessonId: string; courseId: string};
  DictionaryScreen: undefined;
  TienDoScreen: {topic_code: string; title: string}; // Type này có vẻ đang được định nghĩa cho User TienDoScreen
  HomeAdmin: undefined;
  LessonAdmin: {topic_code: string; title: string}; //
  ContentAdmin: {lesson_code: number; lesson_name: string}; // Dòng này quan trọng
  TienDoDetail: {userId: string; username: string};
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Courses: undefined;
  Dictionary: undefined;
  Flashcards: undefined; // Giữ lại type dù không thấy dùng trong MainNavigator
  Profile: undefined;
};

export type CoursesStackParamList = {
  CourseList: undefined;
  CourseDetail: {courseId: string; title: string};
  Lesson: {lessonId: string; courseId: string};
  ContentsLyThuyetScreen: {lessonCode: string; lessonName?: string};
  ContentsScreen: {lessonCode: string; lessonName?: string};
};

// Tạo các navigator (Giữ nguyên)
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CoursesStack = createStackNavigator<CoursesStackParamList>();

// Auth Navigator (Giữ nguyên)
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: {backgroundColor: COLORS.background},
    }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// Courses Stack Navigator (Giữ nguyên)
const CoursesNavigator = () => (
  <CoursesStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: {backgroundColor: COLORS.background},
    }}>
    <CoursesStack.Screen name="CourseList" component={CourseListScreen} />
    <CoursesStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <CoursesStack.Screen name="Lesson" component={LessonScreen} />
    <CoursesStack.Screen
      name="ContentsLyThuyetScreen"
      component={ContentsLyThuyetScreen}
    />
    <CoursesStack.Screen name="ContentsScreen" component={ContentsScreen} />
  </CoursesStack.Navigator>
);

// getTabBarVisibility (Giữ nguyên)
const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  const hiddenScreens = [
    'ContentsScreen',
    'CourseDetail',
    'ContentsLyThuyetScreen',
  ];
  return routeName ? !hiddenScreens.includes(routeName) : true;
};

// Main Tab Navigator (Giữ nguyên)
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={({route}) => {
      const isTabBarVisible = getTabBarVisibility(route);
      return {
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveBackgroundColor: '#FFBF00',
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.white,
        tabBarStyle: isTabBarVisible
          ? {
              height: 65,
              paddingVertical: 5,
              backgroundColor: COLORS.primary,
              paddingBottom: 0,
            }
          : {display: 'none'},
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          paddingVertical: 0,
          paddingBottom: 0,
          transform: [{translateY: -10}],
        },
      };
    }}>
    <MainTab.Screen
      name="Courses"
      component={CoursesNavigator}
      options={{tabBarLabel: 'Trang chủ', tabBarIcon: () => null}}
    />
    <MainTab.Screen
      name="Dictionary"
      component={DictionaryScreen}
      options={{tabBarLabel: 'Theo dõi', tabBarIcon: () => null}}
    />
    {/* Flashcards không được thêm vào đây, nếu cần bạn phải thêm một MainTab.Screen */}
    <MainTab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{tabBarLabel: 'Cài đặt', tabBarIcon: () => null}}
    />
  </MainTab.Navigator>
);

// Component màn hình chờ đơn giản (Giữ nguyên)
const LoadingScreenComponent = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background || '#FFFFFF',
    }}>
    <ActivityIndicator size="large" color={COLORS.primary || '#0000ff'} />
  </View>
);

// --- BEGIN: SỬA ĐỔI RootNavigator ---
// Đièu hướng sau khi đăng nhập
const RootNavigator = () => {
  const {isAuthenticated, selectionComplete, isLoadingAuthState} = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  // isCheckingRole sẽ được quản lý bên trong useEffect dựa trên isAuthenticated
  const [isCheckingRole, setIsCheckingRole] = React.useState(true);

  // --- SỬA useEffect NÀY ---
  React.useEffect(() => {
    const fetchRole = async () => {
      // Chỉ thực hiện đọc role nếu đã đăng nhập
      if (isAuthenticated) {
        try {
          // Bắt đầu kiểm tra role cho trạng thái đã đăng nhập
          setIsCheckingRole(true);
          const storedRole = await AsyncStorage.getItem('role');
          console.log(
            '(Index) DEBUG: Role lấy từ AsyncStorage (khi authenticated):',
            storedRole,
          ); // Giữ log debug
          setRole(storedRole);
        } catch (error) {
          console.error('(Index) Lỗi khi lấy role từ AsyncStorage:', error);
          setRole(null); // Đặt về null nếu có lỗi
        } finally {
          setIsCheckingRole(false); // Kết thúc kiểm tra cho trạng thái này
        }
      } else {
        // Nếu không đăng nhập, xóa role state và kết thúc kiểm tra
        setRole(null);
        setIsCheckingRole(false);
      }
    };

    fetchRole();
    // }, []); // Bỏ dependency rỗng
  }, [isAuthenticated]); // <-- THAY ĐỔI Dependency Array
  // --- KẾT THÚC SỬA useEffect ---

  // Xử lý trạng thái đang tải (Kiểm tra cả isLoadingAuthState VÀ isCheckingRole)
  if (isLoadingAuthState || isCheckingRole) {
    return (
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: COLORS.background},
        }}>
        <RootStack.Screen name="Loading" component={LoadingScreenComponent} />
      </RootStack.Navigator>
    );
  }

  // Log trạng thái trước khi render (Giữ lại để debug nếu cần)
  // console.log("(Index) DEBUG: Render RootNavigator với: ", { isAuthenticated, role, selectionComplete });

  // Khi đã tải xong
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.background},
      }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : role?.toUpperCase() === 'ROLE_ADMIN' ? (
        <>
          <RootStack.Screen name="HomeAdmin" component={HomeAdminScreen} />
          <RootStack.Screen name="LessonAdmin" component={LessonAdminScreen} />
          <RootStack.Screen name="TienDoScreen" component={TienDoScreen} />

          <RootStack.Screen
            name="TienDoDetail"
            component={TienDoDetailScreen}
          />
          <RootStack.Screen
            name="ContentAdmin"
            component={ContentAdminScreen}
          />
        </>
      ) : !selectionComplete ? (
        <RootStack.Screen name="Selection" component={SelectionScreen} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainNavigator} />
          {/* Dòng dưới có thể không cần nếu TienDoScreen được gọi từ MainNavigator */}
          {/* Hoặc nếu nó là màn hình riêng biệt có thể gọi từ bất kỳ đâu trong User flow */}
          <RootStack.Screen name="TienDoScreen" component={TienDoScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
};
// --- KẾT THÚC SỬA ĐỔI RootNavigator ---

// Bọc NavigationContainer với AuthProvider (Giữ nguyên)
const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator; // Giữ nguyên export
