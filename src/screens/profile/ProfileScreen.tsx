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
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';
import {useAuth} from '../auth/AuthContext';

const ProfileScreen: React.FC = () => {
  const {logout} = useAuth(); // Lấy hàm logout từ AuthContext

  // Dữ liệu người dùng mẫu
  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    level: 'Sơ cấp',
    streakDays: 7,
    totalPoints: 1250,
    completedLessons: 18,
    totalHoursStudied: 15.5,
    profilePic: 'https://example.com/profile.jpg', // Sẽ thay bằng ảnh local
  };

  const stats = [
    {label: 'Số ngày liên tiếp', value: user.streakDays, icon: '🔥'},
    {label: 'Tổng điểm', value: user.totalPoints, icon: '⭐'},
    {label: 'Bài học hoàn thành', value: user.completedLessons, icon: '✅'},
    {
      label: 'Giờ học tích lũy',
      value: `${user.totalHoursStudied}h`,
      icon: '⏱️',
    },
  ];

  const menuItems = [
    {
      title: 'Cài đặt tài khoản',
      icon: '⚙️',
      action: () => console.log('Account settings'),
    },
    {
      title: 'Nhắc nhở học tập',
      icon: '🔔',
      action: () => console.log('Reminders'),
    },
    {
      title: 'Thành tích đạt được',
      icon: '🏆',
      action: () => console.log('Achievements'),
    },
    {title: 'Trợ giúp & Hỗ trợ', icon: '❓', action: () => console.log('Help')},
    {
      title: 'Điều khoản sử dụng',
      icon: '📜',
      action: () => console.log('Terms'),
    },
    {title: 'Về ứng dụng', icon: 'ℹ️', action: () => console.log('About')},
  ];

  // Hàm đăng xuất
  // Hàm đăng xuất với confirm
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
            await logout(); // Gọi hàm logout từ AuthContext để đăng xuất
            // Có thể điều hướng về màn hình đăng nhập sau khi đăng xuất (nếu sử dụng react-navigation)
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{uri: user.profilePic}}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{user.level}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Thống kê học tập</Text>
          <View style={styles.statsGrid}>
            {stats.map((item, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuCard}>
          <Text style={styles.cardTitle}>Cài đặt</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 ? styles.lastMenuItem : null,
              ]}
              onPress={item.action}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title="Đăng xuất"
          onPress={handleLogout}
          type="outline"
          size="large"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 5,
  },
  userEmail: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  levelText: {
    ...FONTS.medium,
    fontSize: SIZES.xSmall,
    color: COLORS.white,
  },
  editProfileButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editProfileText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statValue: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  menuArrow: {
    ...FONTS.regular,
    fontSize: SIZES.xxLarge,
    color: COLORS.textLight,
  },
  logoutButton: {
    marginBottom: 30,
  },
});

export default ProfileScreen;
