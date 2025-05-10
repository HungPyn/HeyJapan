// src/screens/theo_doi/FollowScreen.tsx (Hoặc đường dẫn bạn chọn)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image, // Image component đã có sẵn
  ImageBackground,
  StatusBar,
  FlatList, // Sử dụng FlatList cho hiệu năng
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme'; // Đảm bảo đường dẫn đúng

// Định nghĩa Type cho Course
interface Course {
  topic_code: string;
  title: string;
  imageUrl: string;
  levelCode: string;
  quantityLesson: number;
}

// Dữ liệu mockCourses bạn cung cấp
export const mockCourses: Course[] = [
  {
    topic_code: '1',
    title: 'Cơ bản 1',
    imageUrl: 'https://i.imgur.com/na3U2uk.png',
    levelCode: 'Cơ bản',
    quantityLesson: 10,
  },
  {
    topic_code: '2',
    title: 'Cơ bản 2',
    imageUrl: 'https://i.imgur.com/na3U2uk.png',
    levelCode: 'Cơ bản',
    quantityLesson: 8,
  },
  {
    topic_code: '3',
    title: 'Ngữ pháp',
    imageUrl: 'https://i.imgur.com/R8WeIEv.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '4',
    title: 'Trường học',
    imageUrl: 'https://i.imgur.com/BI2iGmn.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 15,
  },
  {
    topic_code: '5',
    title: 'Cây cối',
    imageUrl: 'https://i.imgur.com/4NYSRPT.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 20,
  },
  {
    topic_code: '6',
    title: 'Công việc',
    imageUrl: 'https://i.imgur.com/Q7zBfOg.jpeg',
    levelCode: 'Sơ cấp',
    quantityLesson: 12,
  },
  {
    topic_code: '7',
    title: 'Món ăn',
    imageUrl: 'https://i.imgur.com/loLlsoi.png',
    levelCode: 'Trung cấp',
    quantityLesson: 15,
  },
  {
    topic_code: '8',
    title: 'Động vật',
    imageUrl: 'https://i.imgur.com/CJQ8ooS.jpeg',
    levelCode: 'Trung cấp',
    quantityLesson: 20,
  },
  {
    topic_code: '0',
    title: 'Bảng chữ cái',
    imageUrl: 'https://i.imgur.com/oVacZ4F.png', // Ví dụ một URL ảnh khác
    levelCode: 'Sơ cấp',
    quantityLesson: 5,
  },
];

// << THAY ĐỔIỞ ĐÂY: Component để hiển thị hình ảnh từ imageUrl >>
const CourseItemImage = ({imageUrl}: {imageUrl: string}) => (
  <Image
    source={{uri: imageUrl}}
    style={styles.itemImage}
    resizeMode="cover" // Hoặc "contain" tùy theo ảnh của bạn và style bạn muốn
  />
);

const FollowScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const handleItemPress = (course: Course) => {
    console.log(`Đã chọn khóa học: ${course.title}, ID: ${course.topic_code}`);
    // Ví dụ điều hướng:
    // navigation.navigate('CourseDetailScreen', { courseId: course.topic_code });
  };

  const handleMenuPress = () => {
    console.log('Menu button pressed');
    // if (navigation && navigation.openDrawer) navigation.openDrawer();
  };

  const renderCourseItem = ({item}: {item: Course}) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleItemPress(item)}>
      {/* << THAY ĐỔI Ở ĐÂY: Sử dụng CourseItemImage và truyền imageUrl >> */}
      <CourseItemImage imageUrl={item.imageUrl} />
      <Text style={styles.trackItemText}>{item.title}</Text>
      {/* Bạn có thể thêm thông tin khác như số bài học hoặc cấp độ ở đây nếu muốn */}
      {/* <Text style={styles.itemDetails}>{item.levelCode} - {item.quantityLesson} bài</Text> */}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.3}}
        resizeMode="cover">
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.avatar}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Tiếng Nhật mới bắt đầu</Text>
            </View>
            <TouchableOpacity
              onPress={handleMenuPress}
              style={[
                styles.menuButton,
                {
                  backgroundColor: COLORS.primary,
                  borderRadius: 50, // hoặc 50 nếu muốn tròn nhưng không quá to
                  padding: 10,
                  paddingTop: 3, // thêm padding để icon không bị dính mép
                  paddingBottom: 3,
                },
              ]}>
              <Text style={{fontSize: 24, color: 'white'}}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Course Items Section */}
          <FlatList // Sử dụng FlatList thay cho ScrollView + map để tối ưu hiệu năng
            data={mockCourses} // Sử dụng dữ liệu mockCourses
            renderItem={renderCourseItem}
            keyExtractor={item => item.topic_code} // Sử dụng topic_code làm key
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.75,
    marginTop: StatusBar.currentHeight || 20,
  },
  avatar: {
    width: 36,
    height: 36,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.primary, // Màu xanh lá
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius * 3,
    marginHorizontal: SIZES.padding,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large, // Điều chỉnh kích thước cho phù hợp
    fontWeight: 'bold',
    color: COLORS.white,
  },
  menuButton: {
    padding: SIZES.padding * 0.5,
  },
  scrollView: {
    // Style này giờ áp dụng cho FlatList
    flex: 1,
  },
  scrollViewContent: {
    // Style này cho contentContainer của FlatList
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 0.2, // Điều chỉnh padding cho item
    borderRadius: SIZES.radius * 1.5,

    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SIZES.margin,

    // Thêm shadow nếu muốn
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.18,
    // shadowRadius: 1.00,
    // elevation: 1,
  },
  // << THÊM MỚI: Style cho Image của mỗi item >>
  itemImage: {
    width: 48, // Kích thước ảnh (điều chỉnh cho giống "manTheoDoi.png")
    height: 48,
    borderRadius: 10, // Bo tròn nếu ảnh của bạn là vuông và muốn nó tròn
    marginRight: SIZES.padding * 1.5,
    backgroundColor: COLORS.gray, // Màu nền tạm thời khi ảnh đang tải
  },
  // itemIconText style cũ có thể không cần nữa nếu bạn luôn dùng ảnh
  // itemIconText: {
  //   fontSize: SIZES.h1,
  //   marginRight: SIZES.padding * 1.5,
  // },
  trackItemText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium * 1.15, // Tăng kích thước chữ một chút
    color: COLORS.black,
    flex: 1, // Cho phép text co giãn
  },
  // itemDetails: { // Nếu bạn muốn hiển thị thêm thông tin như level, số bài học
  //   fontSize: SIZES.small,
  //   color: COLORS.gray,
  //   marginTop: 2,
  // }
});

export default FollowScreen;
