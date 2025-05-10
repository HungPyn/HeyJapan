// src/screens/profile/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground, // Thêm ImageBackground
  StatusBar, // Thêm StatusBar
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
// import CustomButton from '../../components/common/CustomButton'; // Bạn đã bỏ CustomButton
import {useAuth} from '../auth/AuthContext'; // Giữ lại để dùng logout

// Component MenuIcon không được định nghĩa bên ngoài StyleSheet,
// nó nên được định nghĩa ở đây hoặc import từ file khác.
// Tôi sẽ định nghĩa nó lại ở đây cho rõ ràng.
const MenuIcon = ({icon}: {icon: any}) => (
  <Image source={icon} style={[styles.menuItem]} />
);
const menuItems = [
  {
    id: 'notifications',
    title: 'Thông báo nhắc nhở',
    icon: require('../../assets/images/notification.png'), // Đảm bảo đường dẫn đúng
    action: () => console.log('Navigate to Notification Settings Screen'),
  },
  // Bạn có thể thêm các mục menu khác ở đây
];

const ProfileScreen: React.FC = () => {
  const {logout} = useAuth();

  const menuItems = [
    {
      id: 'notifications',
      title: 'Thông báo nhắc nhở',
      icon: require('../../assets/images/notification.png'),
      action: () => console.log('Navigate to Notification Settings Screen'),
    },
    // Bạn có thể thêm các mục menu khác ở đây
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Đăng xuất bị hủy'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')} // Đảm bảo đường dẫn này chính xác
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.3}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.avatar}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Cài đặt</Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            {menuItems.map(
              (
                item, // Bỏ index nếu không dùng đến
              ) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.action}>
                  <Image
                    source={require('../../assets/images/notification.png')}
                    style={styles.menuIconText} // Đảm bảo ảnh có kích thước phù hợp
                    resizeMode="contain" // Điều chỉnh cách ảnh được chứa
                  />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ),
            )}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Image
                source={require('../../assets/images/logout.png')}
                style={styles.menuIconText}
                resizeMode="contain"
              />
              <Text style={styles.menuItemText}>Đăng xuất</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding,
    marginTop: StatusBar.currentHeight || 20,
  },
  avatar: {
    width: 36,
    height: 36,

    marginRight: SIZES.padding,
  },
  headerTitleContainer: {
    backgroundColor: COLORS.primary, // Màu này nên lấy từ COLORS nếu có
    paddingHorizontal: SIZES.padding * 7.5,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius * 10,
  },
  headerTitle: {
    // ...FONTS.medium, // Gây lỗi nếu FONTS.medium không phải là object style hợp lệ
    // Bạn cần đảm bảo FONTS.medium được định nghĩa đúng, ví dụ:
    // medium: { fontFamily: 'YourFont-Medium', fontSize: SIZES.mediumFontSize }
    // Nếu không, hãy chỉ định các thuộc tính font trực tiếp:
    fontFamily: FONTS.medium?.fontFamily || 'System', // Lấy fontFamily nếu có, nếu không dùng font hệ thống
    fontSize: SIZES.large, // Ví dụ, hoặc SIZES.large / SIZES.mediumFontSize
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SIZES.padding * 1.5,
    marginTop: 50,
  },
  menuItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,

    paddingHorizontal: SIZES.padding, // Cách trái/phải hợp lý
    paddingVertical: 8, // Không quá cao để tránh lấn chữ

    marginBottom: SIZES.margin,
    borderRadius: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  menuIconText: {
    // fontSize: SIZES.medium, // Nên là một giá trị số cụ thể hoặc SIZES.h2 như trong ảnh mẫu
    fontSize: SIZES.large || 24, // Ví dụ
    marginRight: SIZES.padding * 1.5,
  },
  menuItemText: {
    // ...FONTS.medium, // Tương tự như headerTitle, đảm bảo FONTS.medium hợp lệ
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large || 16, // Ví dụ, hoặc SIZES.mediumFontSize
    color: COLORS.black,
    flex: 1,
  },
  menuItemArrow: {
    // ...FONTS.medium, // Tương tự
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large || 24, // Cho mũi tên to hơn
    color: COLORS.gray,
  },
  logoutButton: {
    // Style riêng cho nút logout
  },
  logoutText: {},
});

export default ProfileScreen;
