// src/screens/tien_do/TienDoScreen.tsx
import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
  FlatList,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {COLORS, FONTS, SIZES} from '../../constants/theme'; // Giả định theme đã có COLORS.nenItem
import {RootStackParamList} from '../../navigation';

// (Bỏ các hằng số màu cục bộ - sử dụng từ theme)
// const ACTIVE_GREEN = '#A0D995';
// const INACTIVE_TAB_BG = '#F0F0F0';
// const TAB_TEXT_COLOR = '#555555';
// const CARD_BEIGE_BG = '#FFF7E6';

type TienDoScreenRouteProp = RouteProp<RootStackParamList, 'TienDoScreen'>;
type TienDoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TienDoScreen' // Hoặc màn hình khác nếu bạn điều hướng từ đây
>;

interface ProgressItem {
  id: string;
  title: string;
  correctRatio?: string; // ví dụ: '11/15'
  completion?: number; // ví dụ: 73 (%)
  speed?: string; // ví dụ: '1:52 phút'
  type: 'lesson' | 'test';
}

// Dữ liệu mẫu (giữ nguyên)
const mockProgressData: {[topicId: string]: ProgressItem[]} = {
  '1': [
    {
      id: 'lesson_1_1',
      title: 'Bài 1: Chào hỏi',
      type: 'lesson',
      correctRatio: '11/15',
      completion: 73,
      speed: '1:52 phút',
    },
    {
      id: 'lesson_1_2',
      title: 'Bài 2: Giới thiệu bản thân',
      type: 'lesson',
      correctRatio: '10/15',
      completion: 60,
      speed: '2:10 phút',
    },
    {
      id: 'test_1_1',
      title: 'Bài 10: Kiểm tra cơ bản 1',
      type: 'test',
      correctRatio: '11/15',
      completion: 73,
      speed: '1:52 phút',
    },
  ],
  '2': [
    {
      id: 'lesson_2_1',
      title: 'Bài 1: Gia đình',
      type: 'lesson',
      correctRatio: '14/15',
      completion: 90,
      speed: '1:30 phút',
    },
    {
      id: 'test_2_1',
      title: 'Bài 8: Kiểm tra cơ bản 2',
      type: 'test',
      correctRatio: '12/15',
      completion: 80,
      speed: '1:45 phút',
    },
  ],
  // Thêm topic '3' để test trường hợp không có dữ liệu
  '3': [],
};

const TienDoScreen: React.FC = () => {
  const route = useRoute<TienDoScreenRouteProp>();
  const navigation = useNavigation<TienDoScreenNavigationProp>();

  const {topic_code = 'unknown', title: topicTitle = 'Tiến độ học tập'} =
    route.params || {};

  const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');

  // Sử dụng useMemo để lọc dữ liệu, tương tự CourseDetailScreen
  const progressItems = useMemo(() => {
    const allItemsForTopic = mockProgressData[topic_code] || [];
    if (activeTab === 'lessons') {
      return allItemsForTopic.filter(item => item.type === 'lesson');
    } else {
      return allItemsForTopic.filter(item => item.type === 'test');
    }
  }, [topic_code, activeTab]);

  // Hàm render một dòng thông tin tiến độ (thay thế renderProgressCard)
  const renderProgressDetail = (
    iconSource: any,
    label: string,
    value?: string | number,
    unit?: string,
  ) => {
    if (value === undefined || value === null) return null;
    return (
      <View style={styles.progressDetailRow}>
        <Image source={iconSource} style={styles.progressDetailIcon} />
        <Text style={styles.progressDetailText}>
          {label}:{' '}
          <Text style={styles.progressDetailValue}>
            {value}
            {unit || ''}
          </Text>
        </Text>
      </View>
    );
  };

  // Hàm render mỗi item trong FlatList (đã thiết kế lại)
  const renderItem = ({item}: {item: ProgressItem}) => (
    <View style={styles.progressItemContainer}>
      <Text style={styles.progressItemTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.progressDetailsContainer}>
        {renderProgressDetail(
          require('../../assets/images/tiLeDung.png'), // Thay icon phù hợp
          'Tỷ lệ đúng',
          item.correctRatio,
        )}
        {renderProgressDetail(
          require('../../assets/images/TiLeHoanThanh.png'), // Thay icon phù hợp
          'Hoàn thành',
          item.completion,
          '%',
        )}
        {renderProgressDetail(
          require('../../assets/images/tocDo.png'), // Thay icon phù hợp
          'Tốc độ',
          item.speed,
        )}
      </View>
      {/* Có thể thêm nút "Xem chi tiết" hoặc tương tự nếu cần */}
      {/* <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* StatusBar giống CourseDetailScreen */}
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')} // Giữ nền của bạn
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.15}} // Giữ opacity
        resizeMode="cover">
        <View style={styles.container}>
          {/* Header chuẩn hóa theo CourseDetailScreen */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {topicTitle}
              </Text>
            </View>
            {/* Placeholder để giữ title ở giữa, tương tự CourseDetailScreen */}
            <View style={{width: SIZES.padding * 4}} />
          </View>

          {/* Tabs được thiết kế lại giống Segment Control */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'lessons' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('lessons')}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'lessons' && styles.tabButtonTextActive,
                ]}>
                Bài học
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'tests' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('tests')}>
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'tests' && styles.tabButtonTextActive,
                ]}>
                Kiểm tra
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content List */}
          {progressItems.length > 0 ? (
            <FlatList
              data={progressItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list} // Đổi tên style cho nhất quán
              contentContainerStyle={styles.listContent} // Đổi tên style cho nhất quán
              showsVerticalScrollIndicator={false}
            />
          ) : (
            // Empty state giống CourseDetailScreen
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có dữ liệu tiến độ cho mục này.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Gộp tất cả style vào một StyleSheet, đổi tên và sử dụng theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white, // Màu nền mặc định
  },
  container: {
    flex: 1,
    // Bỏ paddingTop ở đây, header sẽ tự xử lý
  },
  // --- Header Styles (Lấy từ CourseDetailScreen) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: StatusBar.currentHeight || 20, // Đảm bảo không bị che bởi status bar
    backgroundColor: COLORS.white, // Nền trắng cho header
  },
  backButton: {
    paddingRight: SIZES.padding,
    paddingLeft: SIZES.padding * 0.5,
    paddingVertical: SIZES.padding * 0.5,
  },
  backButtonText: {
    fontSize: SIZES.xLarge * 2.5,
    color: COLORS.darkGray,
    fontWeight: '600',
    marginBottom: 10, // Căn chỉnh vị trí dấu '<'
  },
  headerTitleContainer: {
    flex: 1, // Cho phép tiêu đề chiếm không gian
    alignItems: 'flex-start', // Căn giữa tiêu đề
    marginHorizontal: SIZES.base, // Khoảng cách nhỏ với nút back/placeholder
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1, // Kích thước giống CourseDetailScreen
    fontWeight: 'bold',
    color: COLORS.text, // Màu text từ theme
  },
  // --- Tab Styles (Thiết kế lại giống Segment Control) ---
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.padding * 1.5, // Khoảng cách trên dưới cho tabs
    backgroundColor: 'transparent',
    borderRadius: 5, // Bo góc vừa phải
    borderWidth: 1, // Viền mỏng
    borderColor: COLORS.primary, // Màu viền
    overflow: 'hidden', // Đảm bảo bo góc áp dụng cho cả button bên trong
    width: '90%', // Chiếm 90% chiều rộng
    alignSelf: 'center', // Thêm dòng này để căn giữa theo chiều ngang
    marginTop: 0, // Khoảng cách từ header
    height: SIZES.padding * 3, // Chiều cao tab
  },
  tabButton: {
    flex: 1, // Chia đều không gian
    paddingVertical: SIZES.padding * 0.8, // Chiều cao nút tab
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Nền trong suốt cho nút inactive
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary, // Nền màu chính cho nút active
    // Có thể thêm shadow nhẹ nếu muốn
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2.0,
    // elevation: 2,
  },
  tabButtonText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.primary, // Màu chữ cho nút inactive
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.white, // Màu chữ trắng cho nút active
    fontWeight: 'bold',
    fontSize: SIZES.large, // Kích thước chữ lớn hơn cho nút active
  },
  // --- List Styles ---
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 3, // Tăng padding dưới
  },
  progressItemContainer: {
    // backgroundColor: COLORS.nenItem, // Giữ comment nếu muốn
    backgroundColor: COLORS.nenItem, // Giữ màu nền này
    borderRadius: SIZES.radius * 1.5, // Giữ bo góc này
    padding: SIZES.padding, // Giữ padding này
    marginBottom: SIZES.margin * 1.5, // Giữ margin này
    // Các dòng comment về border cũ có thể xóa đi cho gọn
    // elevation: 2, // <<== Xóa dòng này để bỏ bóng (Android)
    // shadowRadius: 2, // <<== Xóa dòng này và các dòng shadow khác nếu có (iOS)
    borderBottomWidth: 2, // <<== Chỉ giữ lại viền dưới
    borderBottomColor: COLORS.primary, // <<== Chỉ giữ lại màu viền dưới
  },
  progressItemTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h3, // Có thể chỉnh SIZES.large nếu muốn to hơn chút
    color: COLORS.black, // Màu đen cho tiêu đề "Bài X"
    marginBottom: SIZES.padding, // Tăng khoảng cách dưới tiêu đề
    fontWeight: 'bold', // Đảm bảo đậm
  },
  progressDetailsContainer: {
    // Container này không cần style đặc biệt nữa
  },
  progressDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white, // Nền trắng cho mỗi dòng chi tiết
    borderRadius: SIZES.radius, // Bo góc cho thẻ trắng
    paddingVertical: SIZES.padding * 0.75, // Padding dọc bên trong thẻ trắng
    paddingHorizontal: SIZES.padding, // Padding ngang bên trong thẻ trắng
    marginBottom: SIZES.padding * 0.75, // Khoảng cách giữa các thẻ trắng
    elevation: 1, // Độ nổi nhẹ cho thẻ trắng
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  // Loại bỏ margin bottom cho phần tử cuối cùng để không thừa khoảng trống
  // (Bạn có thể cần logic trong renderItem để áp dụng style này cho thẻ cuối)
  // progressDetailRowLast: {
  //   marginBottom: 0,
  // },
  progressDetailIcon: {
    width: 22, // Kích thước icon
    height: 22,
    marginRight: SIZES.padding, // Khoảng cách icon tới text
    // tintColor: COLORS.darkGray, // Bỏ dòng này để icon có màu gốc
  },
  progressDetailText: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font, // Cỡ chữ vừa phải
    color: COLORS.darkGray, // Màu chữ label (có thể dùng COLORS.text nếu muốn đen hơn)
    flex: 1,
  },
  progressDetailValue: {
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    color: COLORS.text, // Màu chữ value đậm hơn
    fontWeight: '600',
  },
  // --- Progress Item Styles (Thiết kế lại hoàn toàn) ---

  // (Optional) Style cho nút "Xem chi tiết" nếu bạn thêm vào
  // detailButton: {
  //   marginTop: SIZES.base,
  //   alignSelf: 'flex-end',
  //   paddingVertical: SIZES.base * 0.5,
  //   paddingHorizontal: SIZES.base,
  // },
  // detailButtonText: {
  //   fontFamily: FONTS.medium?.fontFamily || 'System',
  //   fontSize: SIZES.small,
  //   color: COLORS.primary,
  //   textDecorationLine: 'underline',
  // },
  // --- Empty State Styles (Lấy từ CourseDetailScreen) ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    marginTop: -SIZES.padding * 5, // Đẩy lên một chút để cân đối hơn khi có tab
  },
  emptyText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default TienDoScreen;
