// Đổi tên file này thành src/screens/courses/SelectionScreen.tsx (hoặc nơi bạn đã quyết định lưu)
// Và cập nhật import trong navigation/index.tsx cho phù hợp.

import React, {useState} from 'react'; // Thêm useState
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
// Bỏ useNavigation và StackNavigationProp nếu màn hình này không tự điều hướng theo cách cũ
// import {useNavigation} from '@react-navigation/native';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {AuthStackParamList} from '../../navigation'; // Không cần thiết nữa cho màn hình này

import {COLORS, FONTS, SIZES} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import {useAuth} from '../auth/AuthContext'; // Import useAuth để gọi markSelectionComplete

// Bỏ type WelcomeScreenNavigationProp vì chúng ta không dùng navigation kiểu cũ ở đây nữa
// type WelcomeScreenNavigationProp = StackNavigationProp<
//   AuthStackParamList,
//   'Welcome'
// >;

// Định nghĩa các lựa chọn trình độ
const LEVELS = [
  {id: 'beginner', title: 'Tiếng Nhật mới bắt đầu'},
  {id: 'intermediate', title: 'Tiếng Nhật cơ bản'},
  {id: 'advanced', title: 'Tiếng Nhật nâng cao'},
];

const SelectionScreen: React.FC = () => {
  // Đổi tên component
  const {markSelectionComplete} = useAuth(); // Lấy hàm từ AuthContext

  // State để lưu trữ lựa chọn hiện tại, mặc định là lựa chọn đầu tiên
  const [selectedLevelId, setSelectedLevelId] = useState<string>(LEVELS[0].id);

  // Hàm xử lý khi người dùng chọn một trình độ
  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
  };

  // Hàm xử lý khi người dùng nhấn nút "Tiếp tục"
  const handleContinue = async () => {
    console.log('Trình độ đã được người dùng chọn:', selectedLevelId);
    // TODO: Tại đây, bạn có thể thêm logic để gửi `selectedLevelId` lên backend nếu cần.
    // Ví dụ: await api.saveUserLevelPreference(selectedLevelId);

    // Sau khi xử lý (ví dụ: lưu lên backend), gọi markSelectionComplete.
    // AuthContext sẽ cập nhật trạng thái, và RootNavigator sẽ tự động chuyển sang MainNavigator.
    await markSelectionComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ImageBackground
        // Bạn có thể thay đổi hoặc bỏ ImageBackground nếu muốn màn hình này có nền đơn giản hơn
        source={{uri: 'https://example.com/background.jpg'}} // Giữ lại hoặc thay đổi
        style={styles.backgroundImage}
        resizeMode="cover">
        <SafeAreaView style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo.png')} // Giữ lại hoặc thay đổi
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appSlogan}>
              Chọn trình độ tiếng Nhật hiện tại của bạn
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {LEVELS.map(level => (
              <CustomButton
                key={level.id}
                title={level.title}
                onPress={() => handleLevelSelect(level.id)}
                // 'primary' là nền xanh, 'outline' là nền mặc định (ví dụ: trắng viền)
                type={selectedLevelId === level.id ? 'primary' : 'outline'}
                size="large"
                style={styles.selectionButton} // Sử dụng style mới hoặc điều chỉnh style cũ
                titleStyle={{
                  // Chữ trắng khi nền primary (xanh), chữ đen khi nền outline
                  color:
                    selectedLevelId === level.id ? COLORS.white : COLORS.black,
                }}
              />
            ))}

            <CustomButton
              title="Tiếp tục"
              onPress={handleContinue}
              type="primary" // Giả sử primary là nền xanh bạn muốn
              size="large"
              style={styles.continueButton} // Sử dụng style mới hoặc điều chỉnh style cũ
              // disabled={!selectedLevelId} // Bạn có thể vô hiệu hóa nút này nếu muốn người dùng phải chọn
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Lớp phủ mờ cho background image
    justifyContent: 'space-around', // Thay đổi justifyContent để phù hợp hơn
    paddingTop: (StatusBar.currentHeight || 0) + SIZES.padding,
    paddingHorizontal: SIZES.padding * 2, // Thêm padding ngang
    paddingBottom: SIZES.padding * 2, // Thêm padding dưới
  },
  logoContainer: {
    alignItems: 'center',
    // justifyContent: 'center', // Không cần thiết nếu content đã có justifyContent
    // paddingTop: 60, // Điều chỉnh nếu cần
    marginTop: SIZES.padding * 2, // Thêm khoảng cách trên
  },
  logo: {
    width: 120, // Có thể điều chỉnh kích thước logo
    height: 120,
    marginBottom: 20,
  },
  appSlogan: {
    ...FONTS.bold, // Có thể dùng h2 hoặc h3 tùy theo kích thước mong muốn
    // fontSize: SIZES.large, // Hoặc giữ nguyên
    color: COLORS.black,
    fontSize: SIZES.xLarge,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding * 3, // Điều chỉnh padding

    paddingTop: 50, // Bỏ nếu không cần thiết
    marginBottom: SIZES.padding * 1, // Thêm khoảng cách dưới slogan
  },
  buttonContainer: {
    width: '100%', // Đảm bảo các nút chiếm toàn bộ chiều rộng nếu cần
    // padding: SIZES.padding * 3, // Bỏ nếu đã có padding ở content
    // marginBottom: 150, // Bỏ hoặc điều chỉnh vì content đã có justifyContent: 'space-around'
  },
  selectionButton: {
    // Style chung cho các nút lựa chọn trình độ
    marginBottom: SIZES.margin, // Khoảng cách giữa các nút lựa chọn
    borderRadius: SIZES.radius * 100, // Bo góc lớn hơn cho mềm mại
    // Thêm các style khác nếu CustomButton của bạn không tự xử lý nền/viền cho type 'outline'
  },
  continueButton: {
    // Style cho nút Tiếp tục
    marginTop: SIZES.padding * 2, // Khoảng cách với các nút lựa chọn ở trên
    borderRadius: SIZES.radius * 100,
    marginBottom: 150,
  },
  // Bỏ các style không cần thiết như appName, termsText, termsLink nếu chúng không dùng ở màn này
});

export default SelectionScreen; // Đổi tên export
