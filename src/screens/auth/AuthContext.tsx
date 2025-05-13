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
  SignInResponse,
  SignInSilentlyResponse,
} from '@react-native-google-signin/google-signin';
import authService from '../../services/authService';
interface ActualSuccessResponse {
  type: 'success';
  data: SuccessDataPayload;
}
interface SuccessDataPayload {
  scopes: string[];
  serverAuthCode: string | null; // serverAuthCode có thể là null
  idToken: string | null; // idToken có thể là null (dù hiếm khi thành công)
  user: LoggedInUser;
}
interface LoggedInUser {
  photo: string;
  givenName?: string; // Có thể có hoặc không
  familyName?: string; // Có thể có hoặc không
  email: string;
  name: string;
  id: string;
}
type AuthContextType = {
  isAuthenticated: boolean;
  selectionComplete: boolean;
  isLoadingAuthState: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  markSelectionComplete: () => Promise<void>;
  handleLoginGoole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [isLoadingAuthState, setIsLoadingAuthState] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  useEffect(() => {
    const WEB_CLIENT_ID =
      '103578990825-bhgslc4ps9g5pfksvbnk274vb2uce3ok.apps.googleusercontent.com';

    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
    checkCurrentUser();
  }, []);

  useEffect(() => {
    const loadAuthStateFromStorage = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        const storedSelectionFlag = await AsyncStorage.getItem(
          'hasCompletedSelection',
        );

        if (token) {
          setIsAuthenticated(true);
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
  const checkCurrentUser = async () => {
    if (isSigningIn) return; // Tránh chạy nếu đang có thao tác đăng nhập khác
    setIsSigningIn(true); // Cho biết đang kiểm tra
    try {
      // Sử dụng kiểu SignInSilentlyResponse từ thư viện
      const response: SignInSilentlyResponse =
        await GoogleSignin.signInSilently();

      console.log('===== PHẢN HỒI TỪ signInSilently (checkCurrentUser) =====');
      console.log(JSON.stringify(response, null, 2));
      console.log('=========================================================');

      if (response.type === 'success') {
        // Lúc này, TypeScript nên hiểu response là kiểu ActualSuccessResponse (hoặc tương đương từ thư viện)
        handleSuccessfulSignIn(response as ActualSuccessResponse); // Ép kiểu nếu TS chưa tự hiểu
      } else if (response.type === 'noSavedCredentialFound') {
        console.log('Silent sign in: No saved credential found.');
        // setUserInfo(null);
      } else {
        console.log(
          'Silent sign in: Response type not handled or not success.',
          response,
        );
        // setUserInfo(null);
      }
    } catch (err: any) {
      // statusCodes.SIGN_IN_REQUIRED thường được ném ra khi signInSilently không tìm thấy user
      if (err.code === statusCodes.SIGN_IN_REQUIRED) {
        console.log(
          'Silent sign in: User not signed in or session expired (SIGN_IN_REQUIRED).',
        );
      } else {
        console.error('Error during silent sign in:', err);
      }
      // setUserInfo(null);
    } finally {
      setIsSigningIn(false);
    }
  };
  const login = async (email: string, password: string) => {
    setIsLoadingAuthState(true); // Bắt đầu quá trình xử lý, có thể hiển thị loading
    try {
      const response = await axios.post('http://10.0.2.2:8080/api/auth/login', {
        email,
        password: password,
      });

      console.log('API response:', response);
      const token = response.data.accessToken;

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
        'ROLE_USER';

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', String(roleFromToken));
      console.log('Decode', decodedToken);

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
  function decodeJwtManually(tokenString: any) {
    if (!tokenString) {
      console.error('Token không được cung cấp.');
      return null;
    }

    try {
      const [headerBase64Url, payloadBase64Url] = tokenString.split('.');

      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return atob(base64);
      };

      const decodedHeader = JSON.parse(base64UrlDecode(headerBase64Url));
      const decodedPayload = JSON.parse(base64UrlDecode(payloadBase64Url));

      return {header: decodedHeader, payload: decodedPayload};
    } catch (error) {
      console.error('Lỗi khi giải mã token thủ công:', error);
      return null;
    }
  }

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

        if (backendUser) {
          // Lưu thông tin người dùng và đặt trạng thái là đã xác thực
          setIsAuthenticated(true);
          console.log('logdsfasdfsadfasdfasdf', backendUser);
          // Lưu token vào AsyncStorage nếu có
          if (backendUser.accessToken) {
            await AsyncStorage.setItem('token', backendUser.accessToken);

            const payloadBase64Url = backendUser.accessToken;
            const decodedPayloadString = decodeJwtManually(payloadBase64Url);
            console.log(decodedPayloadString);

            // Lưu role nếu có
            if (decodedPayloadString?.payload.roles) {
              await AsyncStorage.setItem(
                'role',
                decodedPayloadString?.payload.roles,
              );
            }

            if (decodedPayloadString?.payload.level) {
              await AsyncStorage.setItem(
                'level',
                decodedPayloadString?.payload.level,
              );
            }

            if (backendUser.userId) {
              await AsyncStorage.setItem('userID', backendUser.userId);
            }
            // ---- BẮT ĐẦU PHẦN LOG ASYNCSTORAGE ----
            console.log(
              '\n--- Checking AsyncStorage Content Immediately After Google Login Set ---',
            );
            try {
              const keys = await AsyncStorage.getAllKeys();
              if (keys.length > 0) {
                const items = await AsyncStorage.multiGet(keys);
                items.forEach(([key, value]) => {
                  console.log(`[AsyncStorage - Google] ${key}: ${value}`);
                });
              } else {
                console.log('[AsyncStorage - Google] is empty.');
              }
            } catch (e) {
              console.error(
                'Error reading AsyncStorage for logging (Google):',
                e,
              );
            }
            console.log('--- End of AsyncStorage Check (Google) ---\n');
            // ---- KẾT THÚC PHẦN LOG ASYNCSTORAGE ----
          }

          Alert.alert(
            'Xác thực thành công!',
            `Xin chào ${googleData.user.name}`,
          );
        } else {
          // Trường hợp backend không trả về dữ liệu user mong đợi
          console.error(
            '[AuthContext] Phản hồi từ backend không hợp lệ:',
            backendUser,
          );
          Alert.alert(
            'Lỗi từ Server',
            backendUser || 'Không nhận được thông tin người dùng hợp lệ.',
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
