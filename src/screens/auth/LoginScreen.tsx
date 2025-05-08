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
import {useAuth} from './AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({email: '', password: ''});
  const {login} = useAuth();

  const handleLogin = () => {
    // Reset errors
    setErrors({email: '', password: ''});

    // Kiểm tra dữ liệu đầu vào đơn giản
    let isValid = true;
    const newErrors = {email: '', password: ''};

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

    setErrors(newErrors);

    if (isValid) {
      // Gọi hàm login từ AuthContext
      const loginSuccess = login(email, password);

      if (!loginSuccess) {
        // Hiển thị thông báo lỗi đăng nhập nếu không thành công
        Alert.alert(
          'Đăng nhập thất bại',
          'Email hoặc mật khẩu không chính xác',
          [{text: 'OK'}],
        );
        setErrors({
          email: 'Email hoặc mật khẩu không chính xác',
          password: 'Email hoặc mật khẩu không chính xác',
        });
      } else {
        // Hiển thị thông báo thành công (tùy chọn)
        console.log('Đăng nhập thành công!');
        // Không cần navigation.reset vì RootNavigator sẽ tự động chuyển sang Main
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Đăng nhập" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
          <Text style={styles.subtitleText}>
            Vui lòng đăng nhập để tiếp tục
          </Text>

          <View style={styles.formContainer}>
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
              placeholder="Nhập mật khẩu của bạn"
              secureTextEntry
              showTogglePassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              type="primary"
              size="large"
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <CustomButton
                title="Google"
                onPress={() => console.log('Google login pressed')}
                type="outline"
                style={styles.socialButton}
              />
            </View>
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Thêm gợi ý tài khoản test */}
          <View style={styles.testAccountContainer}>
            <Text style={styles.testAccountText}>
              Tài khoản test: test@example.com / password123
            </Text>
          </View>
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
    marginTop: 20,
  },
  subtitleText: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.textLight,
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  loginButton: {
    marginBottom: 30,
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  signUpText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  signUpLink: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  testAccountContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  testAccountText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
