import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import React, {createContext, useState, useContext, ReactNode} from 'react';
import {Alert} from 'react-native';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://10.0.2.2:8080/api/auth/login', {
        email,
        userPassword: password,
      });
      try {
        // In ra response để kiểm tra
        console.log('API response:', response);

        const token = response.data;
        if (!token) {
          console.error('Không có token trong phản hồi từ API');
          return false;
        }

        // ✅ Giải mã token để lấy role
        const decoded: any = jwtDecode(token);
        const userRole = decoded.role || decoded.roles || decoded.authorities;

        // ✅ Lưu token và role vào AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('role', userRole);

        // ✅ Log ra từ AsyncStorage để kiểm tra
        const savedToken = await AsyncStorage.getItem('token');
        const savedRole = await AsyncStorage.getItem('role');

        console.log('da luu token:', savedToken);
        console.log('da luu role:', savedRole);

        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('loi khi lay token:', error);
        return false;
      }
    } catch (error: any) {
      console.error('Login error occurred!');
      console.log('Full error object:', error);
      if (error.message) {
        console.error('Error message:', error.message);
      }
      if (error.stack) {
        console.error('Error stack trace:', error.stack);
      }
      if (error.response) {
        console.error('Response status:', error.response.status);
        Alert.alert(
          'Lỗi',
          error.response.data.error || 'Đã xảy ra lỗi không xác định',
          [
            {
              text: 'OK',
              onPress: () => console.log('User acknowledged the error'),
            },
          ],
        );

        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request details:', error.request);
      } else {
        console.error('Unknown error details');
      }
      return false;
    }
  };
  const logout = async () => {
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{isAuthenticated, login, logout}}>
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
