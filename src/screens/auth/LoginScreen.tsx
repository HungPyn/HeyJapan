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
import {Image} from 'react-native';
import {showMessage} from 'react-native-flash-message';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({email: '', password: ''});
  const {login, handleLoginGoole} = useAuth();

  //dăng nhapnhap

  const handleLogin = async () => {
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
      const loginSuccess = await login(email, password);

      if (!loginSuccess) {
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
      <Image
        source={require('../../assets/images/Logo.png')} // chỉnh đường dẫn nếu cần
        style={{
          width: 130,
          height: 130,
          alignSelf: 'center',
          justifyContent: 'flex-end',
          marginTop: 150,
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
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              // style={{
              //   borderColor: '#888',
              //   borderRadius: 30,
              //   borderWidth: 1,
              // }}
            />

            <CustomTextInput
              placeholder="Mật khẩu"
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

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Bạn có tài khoản chưa? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Đăng ký</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialButtonsContainer}>
              <CustomButton
                title="Đăng nhập bằng Google"
                onPress={handleLoginGoole}
                type="outline"
                style={{
                  ...styles.socialButton, // Kết hợp style từ socialButton
                  borderColor: COLORS.gray,
                  height: 50,
                  // Thêm borderColor mới
                }}
                titleStyle={{color: 'black'}}
                icon={
                  <Image
                    source={require('../../assets/images/googleLogo.jpg')}
                    style={{width: 20, height: 20}}
                  />
                }
              />
            </View>
          </View>

          {/* Thêm gợi ý tài khoản test */}
          <View style={styles.testAccountContainer}>
            <Text style={styles.testAccountText}></Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1, // Đặt độ dày viền
    borderRadius: 50, // Bo góc input
    paddingLeft: 10, // Thêm padding bên trái
    borderColor: '#A7E57D', // Màu viền mặc định (xanh dương)
  },
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
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  forgotPasswordText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.error,
  },
  loginButton: {
    marginBottom: 30,
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
    borderRadius: 50,
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
    color: COLORS.black,
  },
  signUpLink: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.error,
    fontWeight: 'bold',
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
