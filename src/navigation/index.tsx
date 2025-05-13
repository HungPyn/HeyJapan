// src/navigation/index.tsx
import React from 'react';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';

// Import screens
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
import FlashcardsScreen from '../screens/tools/FlashcardsScreen';
import {COLORS} from '../constants/theme';
import {AuthProvider, useAuth} from '../screens/auth/AuthContext';
import SelectionScreen from '../screens/courses/SelectionScreen';
import {ActivityIndicator} from 'react-native-paper';
import ContentsLyThuyetScreen from '../screens/courses/ContentsLyThuyetScreen';
import ContentsScreen from '../screens/courses/ContentsScreen';

// Định nghĩa các type cho navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Selection: undefined; // Màn hình lựa chọn sau khi đăng nhập
  Loading: undefined; // << THÊM DÒNG NÀY VÀO ĐÂY
  CourseDetail: {courseId: string};
  Lesson: {lessonId: string; courseId: string};
  DictionaryScreen: undefined; // Hoặc FollowScreen nếu bạn dùng tên đó
  TienDoScreen: {topic_code: string; title: string}; // Thêm dòng này
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
  Flashcards: undefined;
  Profile: undefined;
};

export type CoursesStackParamList = {
  CourseList: undefined;
  CourseDetail: {courseId: string; title: string}; // Thêm title vào đây
  Lesson: {lessonId: string; courseId: string};
  // Màn hình mới cho nội dung lý thuyết (từ vựng/ngữ pháp)
  ContentsLyThuyetScreen: {lessonCode: string; lessonName?: string};
  // Màn hình cho các loại nội dung bài học khác
  ContentsScreen: {
    lessonCode: string;
    lessonName?: string;
  };
};

// Tạo các navigator
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CoursesStack = createStackNavigator<CoursesStackParamList>();

// Auth Navigator
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

// Courses Stack Navigator
const CoursesNavigator = () => (
  <CoursesStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: {backgroundColor: COLORS.background},
    }}>
    <CoursesStack.Screen name="CourseList" component={CourseListScreen} />
    <CoursesStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    <CoursesStack.Screen name="Lesson" component={LessonScreen} />

    {/* THÊM CÁC MÀN HÌNH MỚI VÀO ĐÂY */}
    <CoursesStack.Screen
      name="ContentsLyThuyetScreen"
      component={ContentsLyThuyetScreen}
    />
    <CoursesStack.Screen name="ContentsScreen" component={ContentsScreen} />
  </CoursesStack.Navigator>
);

const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);

  const hiddenScreens = [
    'ContentsScreen',
    'CourseDetail',
    'ContentsLyThuyetScreen',
  ];

  // Kiểm tra nếu routeName hợp lệ và nằm trong danh sách cần ẩn
  return routeName ? !hiddenScreens.includes(routeName) : true;
};

// Main Tab Navigator
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
    <MainTab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{tabBarLabel: 'Cài đặt', tabBarIcon: () => null}}
    />
  </MainTab.Navigator>
);
// Đièu hướng sau khi đăng nhập
// Component màn hình chờ đơn giản
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

// Đièu hướng sau khi đăng nhập
const RootNavigator = () => {
  // Sử dụng useAuth để lấy tất cả các trạng thái đăng nhập
  const {isAuthenticated, selectionComplete, isLoadingAuthState} = useAuth();

  // << THÊM MỚI: Xử lý trạng thái đang tải >>
  if (isLoadingAuthState) {
    // Khi đang tải, hiển thị một Navigator chỉ chứa màn hình Loading
    // Điều này đảm bảo RootNavigator luôn trả về một cấu trúc Navigator hợp lệ.
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

  // Khi đã tải xong (isLoadingAuthState là false)

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.background},
      }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !selectionComplete ? (
        <RootStack.Screen name="Selection" component={SelectionScreen} />
      ) : (
        // Đã đăng nhập và hoàn thành lựa chọn
        <>
          {' '}
          {/* <--- ĐÃ SỬA: Bọc bằng React Fragment */}
          <RootStack.Screen name="Main" component={MainNavigator} />
          <RootStack.Screen name="TienDoScreen" component={TienDoScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
};

// Bọc NavigationContainer với AuthProvider (giữ nguyên)
const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator;
