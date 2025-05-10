// src/screens/auth/SignUpScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import Header from '../../components/common/Header';
import axios from 'axios';
import {Image} from 'react-native';
import {showMessage} from 'react-native-flash-message';

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignUp = async () => {
    // Reset errors
    setErrors({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    // Kiểm tra dữ liệu đầu vào
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!fullName) {
      newErrors.fullName = 'Họ tên không được để trống';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        // Gọi API để đăng ký
        const response = await axios.post(
          'http://10.0.2.2:8080/api/auth/register',
          {
            userName: fullName,
            email,
            userPassword: password,
          },
        );

        if (response.status === 200) {
          console.log('Đăng ký thành công', response.data);
          // Điều hướng về màn hình đăng nhập sau khi đăng ký thành công
          showMessage({
            message: 'Đăng ký thành công',
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
          navigation.navigate('Login');
        } else {
          // Nếu có lỗi, xử lý tại đây
          showMessage({
            message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.',
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
        }
      } catch (error: any) {
        showMessage({
          message: error.response.data.error || 'Đã xảy ra lỗi không xác định',
          type: 'danger', // 'danger' thường được dùng cho các lỗi
          duration: 3000,
          position: 'center',
          style: {
            backgroundColor: 'rgba(128, 128, 128, 0.6)', // Màu nền trắng
          },
          textStyle: {
            fontSize: 16,
          },
        });
      }
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/images/Logo.png')} // chỉnh đường dẫn nếu cần
        style={{
          width: 110,
          height: 110,
          alignSelf: 'center',
          justifyContent: 'flex-end',
          marginTop: 100,
        }}
        resizeMode="contain"
      />
      <View style={{height: 30}} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <CustomTextInput
              placeholder="Tên người dùng"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />

            <CustomTextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <CustomTextInput
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              secureTextEntry
              showTogglePassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <CustomTextInput
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              showTogglePassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <CustomButton
              title="Đăng ký"
              onPress={handleSignUp}
              type="primary"
              size="large"
              style={styles.signUpButton}
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            Bằng cách đăng ký, bạn đồng ý với các{' '}
            <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
            <Text style={styles.termsLink}>Chính sách bảo mật</Text> của chúng
            tôi.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  welcomeText: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },
  subtitleText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 10,
  },
  signUpButton: {
    marginTop: 10,
    borderRadius: 50,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    paddingHorizontal: 10,
  },
  socialButtonsContainer: {
    justifyContent: 'center',
  },
  socialButton: {
    flex: 0.48,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 0,
  },
  loginText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.black,
  },
  loginLink: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  termsText: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  termsLink: {
    ...FONTS.medium,
    color: COLORS.primary,
  },
});

export default SignUpScreen;
