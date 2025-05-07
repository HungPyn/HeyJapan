// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Image, 
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <ImageBackground
        source={{ uri: 'https://example.com/background.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://example.com/logo.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Sakura Nihongo</Text>
            <Text style={styles.appSlogan}>
              Học tiếng Nhật hiệu quả cùng với Sakura Nihongo
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              type="primary"
              size="large"
              style={styles.loginButton}
            />
            
            <CustomButton
              title="Đăng ký"
              onPress={handleSignUp}
              type="outline"
              size="large"
              style={styles.signUpButton}
            />
            
            <Text style={styles.termsText}>
              Bằng cách tiếp tục, bạn đồng ý với các{' '}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text> của chúng tôi.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight || 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    ...FONTS.bold,
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: 10,
  },
  appSlogan: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  buttonContainer: {
    padding: SIZES.padding * 2,
  },
  loginButton: {
    marginBottom: 12,
  },
  signUpButton: {
    marginBottom: 20,
  },
  termsText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  termsLink: {
    ...FONTS.medium,
    color: COLORS.primary,
  },
});

export default WelcomeScreen;