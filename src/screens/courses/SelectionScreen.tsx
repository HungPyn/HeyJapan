// src/screens/courses/SelectionScreen.tsx
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  SafeAreaView,
  ActivityIndicator, // Thêm để hiển thị loading cho nút Tiếp tục
} from 'react-native';
import {useNavigation} from '@react-navigation/native'; // Import useNavigation
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation'; // Import RootStackParamList để định kiểu navigation

import {COLORS, FONTS, SIZES} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import {useAuth} from '../auth/AuthContext';
import {showMessage} from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Level {
  id: string; // API của bạn cho get levels trả về id là string hay number? Hiện tại đang là string
  name: string;
}

// Định kiểu cho navigation prop
type SelectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Selection' // Tên của route hiện tại trong RootStackParamList
>;

const SelectionScreen: React.FC = () => {
  const {markSelectionComplete} = useAuth();
  const navigation = useNavigation<SelectionScreenNavigationProp>(); // Sử dụng hook navigation

  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State cho nút "Tiếp tục"

  useEffect(() => {
    const fetchLevels = async () => {
      setIsLoadingLevels(true);
      try {
        const authToken = await AsyncStorage.getItem('token');
        if (!authToken) {
          showMessage({
            message: 'Lỗi xác thực. Vui lòng đăng nhập lại.',
            type: 'danger',
          });
          setIsLoadingLevels(false);
          return;
        }
        const config = {
          headers: {Authorization: `Bearer ${authToken}`},
        };
        // API lấy danh sách levels (GET)
        const response = await axios.get<Level[]>(
          'http://10.0.2.2:8080/api/public/level', // Endpoint GET levels
          config,
        );

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setLevels(response.data);
          // Tự động chọn level đầu tiên nếu danh sách không rỗng và chưa có level nào được chọn
          if (!selectedLevelId && response.data[0]?.id) {
            setSelectedLevelId(response.data[0].id);
          }
        } else {
          setLevels([]);
          showMessage({
            message: 'Không tìm thấy danh sách trình độ.',
            type: 'warning',
          });
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách trình độ:', error);
        showMessage({
          message: 'Lỗi tải danh sách trình độ. Vui lòng thử lại!',
          type: 'danger',
        });
        setLevels([]);
      } finally {
        setIsLoadingLevels(false);
      }
    };

    fetchLevels();
  }, []); // Chỉ chạy một lần khi component mount

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
  };

  const handleContinue = async () => {
    if (!selectedLevelId) {
      showMessage({message: 'Vui lòng chọn một trình độ.', type: 'warning'});
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('UserId');
      const authToken = await AsyncStorage.getItem('token');

      if (!userId || !authToken) {
        showMessage({
          message:
            'Không tìm thấy thông tin người dùng hoặc token. Vui lòng đăng nhập lại.',
          type: 'danger',
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        id: userId,
        levelId: selectedLevelId,
      };

      // 1. Gọi API cập nhật level lên server
      await axios.post('http://10.0.2.2:8080/api/public/level', payload, {
        headers: {Authorization: `Bearer ${authToken}`},
      });

      // 2. LƯU selectedLevelId vào AsyncStorage với key 'userLevel'
      //    Điều này QUAN TRỌNG để RootNavigator có thể đọc được khi nó re-render.
      await AsyncStorage.setItem('userLevel', String(selectedLevelId));
      console.log(
        'SelectionScreen: Đã lưu userLevel vào AsyncStorage:',
        selectedLevelId,
      );

      // 3. Đánh dấu đã hoàn thành lựa chọn -> sẽ trigger useEffect trong RootNavigator
      await markSelectionComplete();

      // 4. <<<< BỎ LỆNH navigation.replace(...) Ở ĐÂY >>>>
      // RootNavigator sẽ tự động chuyển màn hình dựa trên thay đổi của selectionComplete và userLevel.
    } catch (error: any) {
      console.error('Lỗi khi xử lý chọn trình độ:', error);
      let errorMessage = 'Không thể cập nhật trình độ. Vui lòng thử lại.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Lỗi server: ${error.response.status} - ${
          error.response.data?.message || 'Không rõ lỗi'
        }`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showMessage({message: errorMessage, type: 'danger'});
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingLevels) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách trình độ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ImageBackground style={styles.backgroundImage} resizeMode="cover">
        <SafeAreaView style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appSlogan}>
              Chọn trình độ tiếng Nhật hiện tại của bạn
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {levels.length > 0 ? (
              levels.map(level => (
                <CustomButton
                  key={level.id}
                  title={level.name}
                  onPress={() => handleLevelSelect(level.id)}
                  type={selectedLevelId === level.id ? 'primary' : 'outline'}
                  size="large"
                  style={styles.selectionButton}
                  titleStyle={{
                    color:
                      selectedLevelId === level.id
                        ? COLORS.white
                        : COLORS.black,
                  }}
                />
              ))
            ) : (
              <Text style={styles.noLevelsText}>
                Không có trình độ nào để chọn.
              </Text>
            )}

            <CustomButton
              title="Tiếp tục"
              onPress={handleContinue}
              type="primary"
              size="large"
              style={styles.continueButton}
              disabled={!selectedLevelId || isSubmitting} // Vô hiệu hóa khi đang submit hoặc chưa chọn
            />
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
    justifyContent: 'space-around',
    paddingTop: (StatusBar.currentHeight || 0) + SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SIZES.padding * 2,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appSlogan: {
    ...FONTS.bold,
    color: COLORS.black,
    fontSize: SIZES.xLarge,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding * 3,
    marginBottom: SIZES.padding * 1,
  },
  buttonContainer: {
    width: '100%',
  },
  selectionButton: {
    marginBottom: SIZES.margin,
    borderRadius: SIZES.radius * 100,
  },
  continueButton: {
    marginTop: SIZES.padding * 2,
    borderRadius: SIZES.radius * 100,
    // marginBottom: 150, // Có thể không cần nếu dùng justifyContent: 'space-around' ở content
  },
  loadingContainer: {
    // Style cho màn hình loading ban đầu
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white, // Hoặc màu nền bạn muốn
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  noLevelsText: {
    textAlign: 'center',
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
});

export default SelectionScreen;
