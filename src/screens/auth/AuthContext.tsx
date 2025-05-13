// src/screens/auth/AuthContext.tsx (Hoặc đường dẫn file của bạn)

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Đảm bảo bạn đã cài đặt: npm install jwt-decode
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import {
  Alert, // Alert có thể không cần thiết ở đây nếu bạn dùng showMessage
} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import authService from '../../services/authService';

type AuthContextType = {
  isAuthenticated: boolean;
  selectionComplete: boolean;
  isLoadingAuthState: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  markSelectionComplete: () => Promise<void>;
  handleLoginGoole: () => Promise<void>;
  // Bạn có thể thêm user, role vào đây nếu muốn truy cập chúng từ context
  // userRole: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [isLoadingAuthState, setIsLoadingAuthState] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  // const [userRole, setUserRole] = useState<string | null>(null); // Ví dụ nếu muốn lưu role

  useEffect(() => {
    const loadAuthStateFromStorage = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role'); // Nếu bạn lưu role
        const storedSelectionFlag = await AsyncStorage.getItem(
          'hasCompletedSelection',
        );

        if (token) {
          // TODO: Thêm kiểm tra token hết hạn nếu API của bạn không tự xử lý khi token hết hạn
          // Ví dụ: const decodedToken: any = jwtDecode(token);
          // if (decodedToken.exp * 1000 < Date.now()) {
          //   // Token hết hạn, xử lý logout
          //   await AsyncStorage.multiRemove(['token', 'role', 'hasCompletedSelection']);
          // } else {
          //   setIsAuthenticated(true);
          //   if (storedRole) setUserRole(storedRole);
          // }
          setIsAuthenticated(true);
          // if (storedRole) setUserRole(storedRole); // Nếu bạn muốn lưu role vào state
        }

        if (storedSelectionFlag === 'true') {
          setSelectionComplete(true);
        }
      } catch (error) {
        console.error('Lỗi khi tải trạng thái xác thực từ storage:', error);
      } finally {
        setIsLoadingAuthState(false);
      }
    };

    loadAuthStateFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoadingAuthState(true); // Bắt đầu quá trình xử lý, có thể hiển thị loading
    try {
      const response = await axios.post('http://10.0.2.2:8080/test/login', {
        email,
        password: password,
      });

      console.log('API response:', response);
      const token = response.data.accessToken; // Hoặc response.data.token tùy theo API của bạn

      if (!token || typeof token !== 'string') {
        console.error(
          'Không có token hợp lệ trong phản hồi từ API',
          response.data.accessToken,
        );
        showMessage({
          message: 'Lỗi đăng nhập: Phản hồi không hợp lệ.',
          type: 'danger',
        });
        setIsLoadingAuthState(false);
        return false;
      }

      const decodedToken: any = jwtDecode(token);
      const roleFromToken =
        decodedToken.role ||
        decodedToken.roles ||
        decodedToken.authorities ||
        'ROLE_USER'; // Mặc định là USER nếu không có

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', String(roleFromToken));

      console.log('Đã lưu token:', token);
      console.log('Đã lưu role:', roleFromToken);

      // setUserRole(String(roleFromToken)); // Nếu bạn muốn lưu role vào state

      // Logic kiểm tra người dùng cũ/mới
      // Cách 1: Nếu API login trả về thông tin isSetupComplete (ví dụ trong response.data.userInfo)
      // if (response.data.userInfo && typeof response.data.userInfo.isSetupComplete === 'boolean') {
      //   if (response.data.userInfo.isSetupComplete) {
      //     setSelectionComplete(true);
      //     await AsyncStorage.setItem('hasCompletedSelection', 'true');
      //   } else {
      //     setSelectionComplete(false);
      //     await AsyncStorage.removeItem('hasCompletedSelection'); // Đảm bảo người mới phải chọn
      //   }
      // } else {
      // Cách 2: Dựa vào AsyncStorage (mặc định cho người mới)
      const storedSelectionFlag = await AsyncStorage.getItem(
        'hasCompletedSelection',
      );
      if (storedSelectionFlag === 'true') {
        setSelectionComplete(true);
      } else {
        setSelectionComplete(false); // Cần vào SelectionScreen
      }
      // }

      setIsAuthenticated(true);
      setIsLoadingAuthState(false);
      return true;
    } catch (error: any) {
      console.error('Login error occurred:', error);
      let errorMessage = 'Đã xảy ra lỗi không xác định khi đăng nhập.';
      if (error.response && error.response.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          errorMessage;
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      showMessage({
        message: errorMessage,
        type: 'danger', // 'danger' thường được dùng cho các lỗi
        duration: 2000,
        position: 'center',
        style: {
          backgroundColor: 'rgba(128, 128, 128, 0.6)', // Màu nền trắng
        },
        textStyle: {
          fontSize: 16,
        },
      });
      setIsLoadingAuthState(false);
      return false;
    }
  };

  const handleGoogleLoginData = async (googleData: any) => {
    if (googleData.idToken) {
      setIsSigningIn(true); // Bắt đầu quá trình gọi backend
      try {
        console.log(
          '[AuthContext] Lấy được idToken từ Google:',
          googleData.idToken,
        );
        Alert.alert('Đang xác thực với server...', 'Vui lòng chờ');

        // Gọi backend để xác thực token và lấy thông tin người dùng của hệ thống
        const backendUser = await authService.verifyGoogleToken(
          googleData.idToken,
        );

        if (backendUser && backendUser.email) {
          // Lưu thông tin người dùng và đặt trạng thái là đã xác thực
          setIsAuthenticated(true);

          // Lưu token vào AsyncStorage nếu có
          if (backendUser.token) {
            await AsyncStorage.setItem('token', backendUser.token);

            // Lưu role nếu có
            if (backendUser.role) {
              await AsyncStorage.setItem('role', backendUser.role);
            }
          }

          Alert.alert(
            'Xác thực thành công!',
            `Xin chào ${backendUser.name || backendUser.email}`,
          );
        } else {
          // Trường hợp backend không trả về dữ liệu user mong đợi
          console.error(
            '[AuthContext] Phản hồi từ backend không hợp lệ:',
            backendUser,
          );
          Alert.alert(
            'Lỗi từ Server',
            backendUser?.message ||
              'Không nhận được thông tin người dùng hợp lệ.',
          );
        }
      } catch (backendError: any) {
        console.error(
          '[AuthContext] Lỗi khi xác thực với backend:',
          backendError,
        );
        Alert.alert(
          'Lỗi xác thực Backend',
          backendError.message || 'Không thể xác thực với server.',
        );
      } finally {
        setIsSigningIn(false); // Kết thúc quá trình gọi backend
      }
    } else {
      Alert.alert('Lỗi Google Sign-In', 'Không nhận được idToken từ Google.');
      console.log(
        '[AuthContext] Không có idToken trong dữ liệu Google:',
        googleData,
      );
      setIsSigningIn(false);
    }
  };

  const handleSuccessfulSignIn = (successResponse: any) => {
    console.log(
      '===== DỮ LIỆU ĐĂNG NHẬP GOOGLE THÀNH CÔNG ĐẦY ĐỦ (handleSuccessfulSignIn) =====',
    );
    console.log(JSON.stringify(successResponse, null, 2));
    console.log(
      '===================================================================',
    );

    if (successResponse.data && successResponse.data.user) {
      // Gọi hàm mới để xử lý việc gửi token lên backend
      handleGoogleLoginData(successResponse.data);
    } else {
      console.error(
        'Dữ liệu user không tìm thấy trong phản hồi thành công:',
        successResponse,
      );
      Alert.alert(
        'Lỗi dữ liệu Google',
        'Không nhận được thông tin người dùng đầy đủ từ Google.',
      );
    }
  };

  const handleLoginGoole = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const response = await GoogleSignin.signIn();

      console.log(
        '===== PHẢN HỒI TỪ GoogleSignin.signIn() (handleLoginGoole) =====',
      );
      console.log(JSON.stringify(response, null, 2));
      console.log(
        '==============================================================',
      );

      if (response.type === 'success') {
        handleSuccessfulSignIn(response);
      } else if (response.type === 'cancelled') {
        Alert.alert('Đã hủy', 'Bạn đã hủy quá trình đăng nhập.');
      } else {
        console.warn(
          'Phản hồi đăng nhập không như mong đợi hoặc không thành công:',
          response,
        );
        Alert.alert(
          'Lỗi đăng nhập',
          'Phản hồi không được xử lý. Kiểm tra console.',
        );
      }
    } catch (err: any) {
      console.error(
        'Google Sign-In Error (trong catch):',
        err,
        'Code:',
        err.code,
      );
      // Các mã lỗi khác từ statusCodes
      if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert(
          'Đang xử lý',
          'Đang có một quá trình đăng nhập khác diễn ra.',
        );
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Lỗi dịch vụ',
          'Google Play Services không khả dụng. Vui lòng cập nhật.',
        );
      } else if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
        // SIGN_IN_CANCELLED đã được xử lý bởi response.type
        Alert.alert(
          'Lỗi đăng nhập',
          `Lỗi không xác định. (Code: ${err.code || 'N/A'})`,
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    setIsLoadingAuthState(true);
    setIsAuthenticated(false);
    setSelectionComplete(false);
    // setUserRole(null); // Nếu bạn có state cho role
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('hasCompletedSelection');
    } catch (error) {
      console.error('Lỗi khi xóa AsyncStorage lúc logout:', error);
    } finally {
      setIsLoadingAuthState(false);
    }
  };

  const markSelectionComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedSelection', 'true');
      setSelectionComplete(true);
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái hoàn tất lựa chọn:', error);
      showMessage({message: 'Lỗi khi lưu lựa chọn.', type: 'danger'});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        selectionComplete,
        isLoadingAuthState,
        login,
        handleLoginGoole,
        logout,
        markSelectionComplete,
        // userRole, // Nếu bạn muốn cung cấp userRole
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
