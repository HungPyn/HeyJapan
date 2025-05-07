// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import CustomTextInput from '../../components/common/CustomTextInput';
import Header from '../../components/common/Header';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = () => {
    // Reset error
    setError('');
    
    // Kiểm tra email
    if (!email) {
      setError('Email không được để trống');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    
    // Giả lập gửi email khôi phục mật khẩu
    console.log('Reset password requested for email: ', email);
    setIsSent(true);
    
    // Hiển thị thông báo
    Alert.alert(
      'Gửi thành công',
      'Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Quên mật khẩu" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titleText}>Khôi phục mật khẩu</Text>
          <Text style={styles.subtitleText}>
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi cho bạn hướng dẫn để đặt lại mật khẩu.
          </Text>
          
          <View style={styles.formContainer}>
            <CustomTextInput
              label="Email"
              placeholder="Nhập địa chỉ email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={error}
            />
            
            <CustomButton
              title="Gửi hướng dẫn khôi phục"
              onPress={handleResetPassword}
              type="primary"
              size="large"
              style={styles.resetButton}
              loading={isSent}
            />
            
            <CustomButton
              title="Quay lại đăng nhập"
              onPress={() => navigation.navigate('Login')}
              type="text"
              size="medium"
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  titleText: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 20,
  },
  subtitleText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: 30,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;