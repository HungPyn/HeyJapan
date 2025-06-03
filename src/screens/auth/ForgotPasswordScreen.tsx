import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Button,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import Header from '../../components/common/Header';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isCodeSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCodeSent, countdown]);

  const handleResetPassword = () => {
    setError('');
    if (!email) {
      setError('Email không được để trống');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true); // Bắt đầu loading khi gửi yêu cầu

    // Gửi yêu cầu reset mật khẩu
    console.log('Gửi yêu cầu reset mật khẩu cho email: ', email);

    // Thực hiện gọi API gửi mã xác nhận
    fetch('http://10.0.2.2:8080/api/auth/send-code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false); // Dừng loading khi API trả về kết quả
        if (data.success) {
          setIsSent(true);
          setIsCodeSent(true);
        } else {
          setError(data.message || 'Có lỗi xảy ra');
        }
      })
      .catch(err => {
        setIsLoading(false); // Dừng loading khi có lỗi
        setError('Gửi mã xác nhận thất bại');
        console.error(err);
      });
  };

  const handleVerifyCode = () => {
    setError('');
    if (!code) {
      setError('Mã xác nhận không được để trống');
      return;
    }

    // Kiểm tra mã xác nhận
    fetch('http://10.0.2.2:8080/api/auth/verify-code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, code}),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setIsVerified(true);
        } else {
          setError(data.message || 'Mã xác nhận không hợp lệ');
        }
      })
      .catch(err => {
        setError('Xác thực mã thất bại');
        console.error(err);
      });
  };

  const handleChangePassword = () => {
    setError('');
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    } else if (newPassword !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    // Gửi yêu cầu đổi mật khẩu
    fetch('http://10.0.2.2:8080/api/auth/reset-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, code, newPassword}),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi');
          navigation.navigate('Login');
        } else {
          setError(data.message || 'Đổi mật khẩu thất bại');
        }
      })
      .catch(err => {
        setError('Đổi mật khẩu thất bại');
        console.error(err);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Quên mật khẩu" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {!isSent ? (
              <>
                <CustomTextInput
                  label="Email"
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                />
                <CustomButton
                  title="Gửi"
                  onPress={handleResetPassword}
                  type="primary"
                  size="large"
                  style={styles.resetButton}
                  loading={isLoading} // Hiển thị loading khi đang gửi yêu cầu
                />
              </>
            ) : !isVerified ? (
              <>
                <CustomTextInput
                  label="Mã xác nhận"
                  placeholder="Nhập mã xác nhận đã gửi"
                  value={code}
                  onChangeText={setCode}
                  error={error}
                />
                <CustomButton
                  title="Xác nhận mã"
                  onPress={handleVerifyCode}
                  type="primary"
                  size="large"
                  style={styles.resetButton}
                />
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Gửi lại mã trong {countdown}s
                  </Text>
                ) : (
                  <CustomButton
                    title="Gửi lại mã"
                    onPress={handleResetPassword}
                    type="text"
                    size="small"
                    style={styles.resendButton}
                  />
                )}
              </>
            ) : (
              <>
                <CustomTextInput
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  error={error}
                />
                <CustomTextInput
                  label="Xác nhận mật khẩu"
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={error}
                />
                <CustomButton
                  title="Đổi mật khẩu"
                  onPress={handleChangePassword}
                  type="primary"
                  size="large"
                  style={styles.resetButton}
                />
              </>
            )}

            <CustomButton
              title="Quay lại đăng nhập"
              onPress={() => navigation.navigate('Login')}
              type="text"
              size="large"
              style={styles.backButton}
            />
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
    marginTop: 30,
  },
  keyboardAvoidingView: {
    marginTop: 50,
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  formContainer: {
    marginTop: 120,
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 50,
  },
  backButton: {
    marginTop: 10,
  },
  countdownText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    textAlign: 'center',
    marginTop: 20,
  },
  resendButton: {
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;
