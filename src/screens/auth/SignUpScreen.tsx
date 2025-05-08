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
          Alert.alert('Thành công', 'Đăng ký thành công!');
          navigation.navigate('Login');
        } else {
          // Nếu có lỗi, xử lý tại đây
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
        }
      } catch (error: any) {
        console.error('Lỗi đăng ký:', error);
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
      }
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Đăng ký" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitleText}>
            Hãy bắt đầu hành trình học tiếng Nhật của bạn
          </Text>

          <View style={styles.formContainer}>
            <CustomTextInput
              label="Họ tên"
              placeholder="Nhập họ tên của bạn"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />

            <CustomTextInput
              label="Email"
              placeholder="Nhập địa chỉ email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <CustomTextInput
              label="Mật khẩu"
              placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
              secureTextEntry
              showTogglePassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <CustomTextInput
              label="Xác nhận mật khẩu"
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

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng ký với</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <CustomButton
                title="Google"
                onPress={() => console.log('Google sign up pressed')}
                type="outline"
                style={styles.socialButton}
              />
            </View>
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
    marginBottom: 20,
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
    paddingTop: 20,
  },
  loginText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  loginLink: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
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
