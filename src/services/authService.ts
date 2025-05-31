import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

const LOCAL_API_URL = 'http://localhost:8080/api/auth';

type BackendUserResponse = {
  accessToken: string;
  email: string;
  role?: string;
  name?: string;
  message?: string;
  userId?: string;
  level?: number | null; // Thêm level vào interface
};

const verifyGoogleToken = async (
  idToken: string,
): Promise<BackendUserResponse> => {
  try {
    const backendBaseUrl =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8080'
        : 'http://localhost:8080';
    const verifyUrl = `${backendBaseUrl}/api/auth/google/token`;

    console.log(`[authService] Đang gửi ID token đến backend: ${verifyUrl}`);
    const response = await axios.post<BackendUserResponse>(verifyUrl, {
      idToken,
    });

    console.log('[authService] Phản hồi từ backend:', response.data);

    const {accessToken, userId} = response.data;
    if (!accessToken) {
      throw new Error('Không nhận được accessToken từ backend.');
    }

    // Giải mã token bằng jwt-decode
    const decoded: any = jwtDecode(accessToken);
    const rolesFromPayload =
      decoded.roles || decoded.role || decoded.authorities || 'ROLE_USER';
    const levelFromPayload = decoded.level ?? null;

    // Lưu vào AsyncStorage
    try {
      await AsyncStorage.multiSet([
        ['token', accessToken],
        ['role', String(rolesFromPayload)],
        ['UserId', userId || ''],
        [
          'userLevel',
          levelFromPayload !== null ? String(levelFromPayload) : 'null',
        ],
        [
          'hasCompletedSelection',
          levelFromPayload !== null && levelFromPayload !== 'null'
            ? 'true'
            : 'false',
        ],
      ]);

      if (levelFromPayload === null || levelFromPayload === undefined) {
        await AsyncStorage.removeItem('userLevel');
      }

      // Kiểm tra nội dung AsyncStorage (tùy chọn, để debug)
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length === 0) {
        console.log('[authService] AsyncStorage is empty.');
      } else {
        const items = await AsyncStorage.multiGet(keys);
        console.log('[authService] Nội dung AsyncStorage:');
        items.forEach(([key, value]) => {
          console.log(`Key: ${key}, Value: ${value}`);
        });
      }
    } catch (storageError) {
      console.error(
        '[authService] Lỗi khi lưu vào AsyncStorage:',
        storageError,
      );
      throw new Error('Lỗi khi lưu thông tin xác thực vào AsyncStorage.');
    }

    // Trả về BackendUserResponse với level
    return {
      ...response.data,
      level: levelFromPayload,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      console.error(
        '[authService] Lỗi API Backend:',
        errorData || error.message,
      );
      throw new Error(
        errorData?.message ||
          error.message ||
          'Lỗi kết nối hoặc xác thực với server.',
      );
    } else {
      console.error('[authService] Lỗi không xác định:', error);
      throw new Error('Lỗi không xác định khi kết nối backend.');
    }
  }
};

export default {
  verifyGoogleToken,
};
