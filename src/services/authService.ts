// src/services/authService.ts
import axios from 'axios';
import {Platform} from 'react-native';

// Địa chỉ backend Spring Boot của bạn
const LOCAL_API_URL = 'http://localhost:8080/api/auth'; // Dùng cho iOS simulator hoặc khi có cách khác để trỏ localhost

// Kiểu dữ liệu cho phản hồi từ backend mà chúng ta mong đợi
// (Khớp với AuthResponse.java trong Spring Boot)
type BackendUserResponse = {
  accessToken: string;
  email: string;
  role?: string;
  name?: string;
  message?: string;
  userId?: string;
};
const verifyGoogleToken = async (
  idToken: string,
): Promise<BackendUserResponse> => {
  try {
    // Khi dùng máy ảo Android, localhost của máy tính sẽ là 10.0.2.2 từ máy ảo
    // Nếu test trên thiết bị thật cùng mạng Wi-Fi, bạn cần dùng IP LAN của máy tính
    // ví dụ: http://192.168.1.XXX:8080/api/auth
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
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      console.error(
        '[authService] Lỗi API Backend:',
        errorData || error.message,
      );
      // Ném lỗi với message từ backend nếu có, hoặc message của axios
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
