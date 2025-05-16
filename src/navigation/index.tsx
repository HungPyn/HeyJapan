// src/navigation/index.tsx
import React from 'react';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Định nghĩa các type cho navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>; // Đã đúng cho điều hướng lồng nhau
  Selection: undefined;
  Loading: undefined;
  CourseDetail: {courseId: string; title?: string}; // Thêm title là optional
  Lesson: {lessonId: string; courseId: string};
  DictionaryScreen: undefined;
  TienDoScreen: {topic_code: string; title: string};
  HomeAdmin: undefined;
  LessonAdmin: {topic_code: string; title: string};
  ContentAdmin: {lesson_code: number; lesson_name: string};
  TienDoDetail: {userId: string; username: string};
  CourseListScreen: {levelId: number}; // Type này vẫn có thể dùng nếu có lúc bạn nav trực tiếp
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Courses: NavigatorScreenParams<CoursesStackParamList>; // Đã đúng
  Dictionary: undefined;
  Flashcards: undefined;
  Profile: undefined;
};

export type CoursesStackParamList = {
  CourseList: {levelId: number}; // Đã đúng
  CourseDetail: {courseId: string; title: string}; // << Mong đợi cả title
  Lesson: {lessonId: string; courseId: string};
  ContentsLyThuyetScreen: {lessonCode: string; lessonName?: string};
  ContentsScreen: {lessonCode: string; lessonName?: string};
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
    <CoursesStack.Screen
      name="ContentsLyThuyetScreen"
      component={ContentsLyThuyetScreen}
    />
    <CoursesStack.Screen name="ContentsScreen" component={ContentsScreen} />
  </CoursesStack.Navigator>
);

// getTabBarVisibility
const getTabBarVisibility = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  const hiddenScreens = [
    'ContentsScreen',
    'CourseDetail',
    'ContentsLyThuyetScreen',
  ];
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

// Component màn hình chờ
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

// RootNavigator
const RootNavigator = () => {
  const {isAuthenticated, selectionComplete, isLoadingAuthState} = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState<string | null>(null);
  const [isCheckingData, setIsCheckingData] = React.useState(true); // Đổi tên từ isCheckingRole

  React.useEffect(() => {
    const fetchUserData = async () => {
      // Đổi tên hàm từ fetchRole
      console.log('(RootNavigator) useEffect triggered. Deps: ', {
        isAuthenticated,
        selectionComplete,
      });
      if (isAuthenticated) {
        setIsCheckingData(true);
        try {
          const storedRole = await AsyncStorage.getItem('role');
          const storedLevel = await AsyncStorage.getItem('userLevel');

          console.log(
            '(RootNavigator) Fetched Role:',
            storedRole,
            '| Fetched Level (userLevel):',
            storedLevel,
            '| selectionComplete from context:',
            selectionComplete,
          );

          setRole(storedRole);
          setLevel(storedLevel);
        } catch (error) {
          console.error(
            '(RootNavigator) Lỗi khi lấy dữ liệu từ AsyncStorage:',
            error,
          );
          setRole(null);
          setLevel(null);
        } finally {
          setIsCheckingData(false);
        }
      } else {
        setRole(null);
        setLevel(null);
        setIsCheckingData(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, selectionComplete]); // <<<<< ĐÃ THÊM selectionComplete VÀO ĐÂY!

  if (isLoadingAuthState || isCheckingData) {
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

  console.log(
    '(RootNavigator) Rendering with state - isAuthenticated:',
    isAuthenticated,
    'role:',
    role,
    'level:',
    level,
    'selectionComplete:',
    selectionComplete,
  );

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
          {/* Các màn hình khác mà Admin có thể truy cập trực tiếp từ RootStack */}
          <RootStack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
          />
          <RootStack.Screen name="Lesson" component={LessonScreen} />
        </>
      ) : !selectionComplete || level === null || level === 'null' ? (
        // Nếu chưa hoàn thành lựa chọn (selectionComplete là false)
        // HOẶC nếu level từ AsyncStorage chưa được load/set (level là null)
        // thì hiển thị SelectionScreen.
        // Khi SelectionScreen gọi markSelectionComplete() -> selectionComplete sẽ true.
        // useEffect trên sẽ chạy lại, fetch lại level (mà CourseListScreen đã lưu).
        // RootNavigator sẽ re-render. Nếu level mới khác null, sẽ vào nhánh else dưới.
        <RootStack.Screen name="Selection" component={SelectionScreen} />
      ) : (
        // Đã đăng nhập, không phải admin, VÀ (selectionComplete = true VÀ level đã có giá trị)
        <>
          <RootStack.Screen name="Main" component={MainNavigator} />
          {/* Các màn hình CourseDetail, Lesson, TienDoScreen cũng được khai báo ở RootStack.
            Điều này cho phép điều hướng tới chúng từ bất kỳ đâu trong RootStack, 
            ví dụ từ các màn hình bên trong MainNavigator (nếu bạn dùng navigation.navigate('CourseDetail', ...))
            mà không cần phải dùng '../TênStackCha/CourseDetail'.
            LƯU Ý: Đảm bảo rằng bạn không có xung đột tên nếu các màn hình này cũng được khai báo
            bên trong một Stack con nào đó với cùng tên mà bạn không muốn ghi đè.
            Trong trường hợp này, CourseDetail và Lesson cũng có trong CoursesStack.
            Khi điều hướng từ bên trong CoursesStack (ví dụ từ CourseList sang CourseDetail), 
            nó sẽ ưu tiên màn hình trong CoursesStack.
            Khi điều hướng từ RootStack (ví dụ từ một màn hình không thuộc MainNavigator), 
            nó sẽ dùng các khai báo ở đây.
          */}
          <RootStack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
          />
          <RootStack.Screen name="Lesson" component={LessonScreen} />
          <RootStack.Screen name="TienDoScreen" component={TienDoScreen} />

          {/* Dòng CourseListScreen ở đây không cần thiết nếu bạn đang điều hướng lồng vào
              Main -> Courses -> CourseList. Lệnh navigation.replace('Main', ...) sẽ lo việc đó.
              Việc khai báo CourseListScreen trong RootStackParamList vẫn hữu ích cho type checking 
              khi bạn định nghĩa params cho nó.
          */}
          {/* <RootStack.Screen name="CourseListScreen" component={CourseListScreen} /> */}
        </>
      )}
    </RootStack.Navigator>
  );
};

// AppNavigator
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
