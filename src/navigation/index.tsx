// src/navigation/index.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
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

// Main Tab Navigator
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: true, // Giữ lại vì bạn muốn hiển thị label
      tabBarActiveBackgroundColor: '#FFBF00', // Màu nền cho tab đang được chọn
      tabBarActiveTintColor: COLORS.white,
      tabBarInactiveTintColor: COLORS.white,

      tabBarStyle: {
        height: 65,
        paddingVertical: 5,
        backgroundColor: COLORS.primary, // Màu nền chung của thanh tab
        paddingBottom: 0, // Điều chỉnh paddingBottom nếu cần
      },
      tabBarLabelStyle: {
        fontSize: 16, // Điều chỉnh cho phù hợp với thiết kế
        fontWeight: '500', // Điều chỉnh cho phù hợp
        paddingVertical: 0,
        paddingBottom: 0, // Loại bỏ paddingBottom nếu không cần
        transform: [{translateY: -10}], // Dịch chuyển label lên
      },
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
        <RootStack.Screen name="Main" component={MainNavigator} />
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
