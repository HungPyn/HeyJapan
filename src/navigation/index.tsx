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
import {AuthProvider, useAuth} from '../context/AuthContext';

// Định nghĩa các type cho navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
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
  CourseDetail: {courseId: string};
  Lesson: {lessonId: string; courseId: string};
};

// Tạo các navigator
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CoursesStack = createStackNavigator<CoursesStackParamList>();

// Tab icon component (thay thế cho vector icons)
const TabIcon = ({iconText, focused}: {iconText: string; focused: boolean}) => (
  <View style={{alignItems: 'center', justifyContent: 'center'}}>
    <Text
      style={{
        fontSize: 20,
        color: focused ? COLORS.primary : COLORS.textLight,
      }}>
      {iconText}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: focused ? COLORS.primary : COLORS.textLight,
        marginTop: 2,
      }}>
      {iconText === '📚'
        ? 'Khóa học'
        : iconText === '📖'
        ? 'Từ điển'
        : iconText === '🗂️'
        ? 'Thẻ ghi nhớ'
        : 'Cá nhân'}
    </Text>
  </View>
);

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
  </CoursesStack.Navigator>
);

// Main Tab Navigator
const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        height: 60,
        paddingVertical: 5,
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
    }}>
    <MainTab.Screen
      name="Courses"
      component={CoursesNavigator}
      options={{
        tabBarIcon: ({focused}) => <TabIcon iconText="📚" focused={focused} />,
      }}
    />
    <MainTab.Screen
      name="Dictionary"
      component={DictionaryScreen}
      options={{
        tabBarIcon: ({focused}) => <TabIcon iconText="📖" focused={focused} />,
      }}
    />
    <MainTab.Screen
      name="Flashcards"
      component={FlashcardsScreen}
      options={{
        tabBarIcon: ({focused}) => <TabIcon iconText="🗂️" focused={focused} />,
      }}
    />
    <MainTab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({focused}) => <TabIcon iconText="👤" focused={focused} />,
      }}
    />
  </MainTab.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  // Sử dụng useAuth để lấy trạng thái đăng nhập
  const {isAuthenticated} = useAuth();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: COLORS.background},
      }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

// Bọc NavigationContainer với AuthProvider
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
