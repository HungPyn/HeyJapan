// src/screens/theo_doi/FollowScreen.tsx
import React, {useState, useEffect} from 'react';
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
  ActivityIndicator,
  Modal, // Thêm Modal
} from 'react-native';
import axios from 'axios';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa Type cho Course (giữ nguyên)
interface Course {
  topic_code: string;
  title: string;
  imageUrl: string;
  levelCode: string;
  quantityLesson: number;
}

// Định nghĩa Type cho Topic từ API (giữ nguyên)
interface ApiTopic {
  id: number;
  levelId: number;
  name: string;
  avatarUrl: string;
  dayCreation: string;
}

// Định nghĩa Type cho Response của API lấy topics theo level (giữ nguyên)
interface TopicsApiResponse {
  id: number;
  name: string; // Tên của level hiện tại
  topics: ApiTopic[];
}

// Định nghĩa Type cho một Level trong danh sách chọn (mới)
interface LevelInfo {
  id: number;
  name: string;
}

// Định nghĩa Type cho Response của API lấy tất cả levels (mới)
// Giả sử API trả về một mảng các object, mỗi object có id, name và topics
// nhưng chúng ta chỉ cần id và name cho việc chọn level.
type AllLevelsApiResponse = Array<{
  id: number;
  name: string;
  topics?: ApiTopic[]; // topics ở đây có thể không cần thiết cho việc chọn level
}>;

// Component để hiển thị hình ảnh từ imageUrl (giữ nguyên)
const CourseItemImage = ({imageUrl}: {imageUrl: string}) => (
  <Image source={{uri: imageUrl}} style={styles.itemImage} resizeMode="cover" />
);

const FollowScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevelName, setCurrentLevelName] =
    useState<string>('Đang tải...'); // Tên của level hiện tại đang hiển thị
  const [currentLevelId, setCurrentLevelId] = useState<number>(1); // ID của level hiện tại, mặc định là 1

  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]); // State cho danh sách tất cả levels
  const [isLevelModalVisible, setIsLevelModalVisible] =
    useState<boolean>(false); // State cho modal chọn level

  // Hàm gọi API lấy danh sách topics theo levelId
  const fetchTopicsByLevel = async (levelId: number) => {
    setIsLoading(true);
    setError(null);
    setCoursesData([]); // Xóa dữ liệu cũ trước khi tải mới
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token');
      }
      const response = await axios.get<TopicsApiResponse>(
        `http://10.0.2.2:8080/api/user/topic/${levelId}/topics`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (response.data) {
        setCurrentLevelName(response.data.name || `Level ${levelId}`);
        if (response.data.topics && response.data.topics.length > 0) {
          const mappedCourses: Course[] = response.data.topics.map(
            (topic: ApiTopic) => ({
              topic_code: topic.id.toString(),
              title: topic.name,
              imageUrl: topic.avatarUrl,
              levelCode: response.data.name || `Level ${levelId}`,
              quantityLesson: 0,
            }),
          );
          setCoursesData(mappedCourses);
        } else {
          // Không có topics cho level này, nhưng level vẫn hợp lệ
          setCoursesData([]); // Đảm bảo coursesData rỗng
        }
      } else {
        setError(`Không tìm thấy dữ liệu cho Level ID: ${levelId}.`);
        setCurrentLevelName(`Level ${levelId}`); // Cập nhật tên level dự phòng
      }
    } catch (err: any) {
      console.error(`Lỗi khi gọi API cho level ${levelId}:`, err);
      let errorMessage = 'Đã xảy ra lỗi không xác định khi tải dữ liệu chủ đề.';
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = `Lỗi từ server: ${err.response.status} - ${
            err.response.data?.message || 'Không có thông báo lỗi cụ thể'
          }`;
        } else if (err.request) {
          errorMessage =
            'Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng và địa chỉ API.';
        } else {
          errorMessage = `Lỗi khi thiết lập request: ${err.message}`;
        }
      } else if (err.message === 'Không tìm thấy token') {
        errorMessage =
          'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
      }
      setError(errorMessage);
      setCurrentLevelName(`Lỗi tải Level ${levelId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gọi API lấy tất cả các levels
  const fetchAllLevelsData = async () => {
    // Không set isLoading ở đây để tránh xung đột với isLoading của fetchTopicsByLevel
    // Hoặc bạn có thể dùng một state isLoading khác cho việc này nếu cần
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Không ném lỗi ở đây để màn hình vẫn có thể cố gắng tải topics với level mặc định
        console.warn('Không tìm thấy token khi tải danh sách levels.');
        setAllLevels([]); // Không có level để chọn nếu không có token
        return;
      }
      // THAY THẾ URL NÀY BẰNG API THỰC TẾ ĐỂ LẤY DANH SÁCH LEVELS
      const response = await axios.get<AllLevelsApiResponse>(
        `http://10.0.2.2:8080/api/user/level`, // API Endpoint giả định
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      if (response.data && Array.isArray(response.data)) {
        const levels: LevelInfo[] = response.data.map(level => ({
          id: level.id,
          name: level.name,
        }));
        setAllLevels(levels);
      } else {
        console.warn('Dữ liệu levels không hợp lệ từ API');
        setAllLevels([]);
      }
    } catch (err) {
      console.error('Lỗi khi gọi API lấy danh sách levels:', err);
      setAllLevels([]); // Đặt lại danh sách levels nếu có lỗi
      // Có thể hiển thị thông báo lỗi cho người dùng nếu cần
    }
  };

  useEffect(() => {
    fetchAllLevelsData(); // Gọi API lấy tất cả levels khi component mount
    fetchTopicsByLevel(currentLevelId); // Gọi API lấy topics cho level hiện tại (mặc định ban đầu)
  }, [currentLevelId]); // Chạy lại khi currentLevelId thay đổi

  const handleItemPress = (course: Course) => {
    navigation.navigate('CourseDetail', {
      courseId: course.topic_code,
      title: course.title,
    });
  };

  const handleMenuPress = () => {
    if (allLevels.length > 0) {
      setIsLevelModalVisible(true); // Mở modal nếu có danh sách levels
    } else {
      // Có thể fetch lại allLevels ở đây hoặc thông báo không có level để chọn
      console.log('Không có danh sách level để hiển thị hoặc đang tải.');
      fetchAllLevelsData(); // Thử tải lại danh sách level
    }
  };

  const handleSelectLevel = (level: LevelInfo) => {
    setCurrentLevelId(level.id); // Cập nhật levelId hiện tại, useEffect sẽ tự động gọi fetchTopicsByLevel
    // setCurrentLevelName(level.name); // Tên sẽ được cập nhật từ response của fetchTopicsByLevel
    setIsLevelModalVisible(false);
  };

  const renderCourseItem = ({item}: {item: Course}) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleItemPress(item)}>
      <CourseItemImage imageUrl={item.imageUrl} />
      <Text style={styles.trackItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderLevelSelectItem = ({item}: {item: LevelInfo}) => (
    <TouchableOpacity
      style={styles.modalLevelItem}
      onPress={() => handleSelectLevel(item)}>
      <Text style={styles.modalLevelText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading && coursesData.length === 0) {
    // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu nào
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Không hiển thị lỗi toàn màn hình nếu đang tải lại level khác, chỉ khi có lỗi thực sự và không có data
  if (error && coursesData.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')}
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
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {currentLevelName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleMenuPress}
              style={[
                styles.menuButton,
                {
                  backgroundColor: COLORS.primary,
                  borderRadius: 50,
                  padding: 10,
                  paddingTop: 3,
                  paddingBottom: 3,
                },
              ]}>
              <Text style={{fontSize: 24, color: 'white'}}>☰</Text>
            </TouchableOpacity>
          </View>

          <Text style={{marginTop: 20}}></Text>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{marginBottom: 10}}
            />
          )}

          {coursesData.length > 0 ? (
            <FlatList
              data={coursesData}
              renderItem={renderCourseItem}
              keyExtractor={item => `${currentLevelId}-${item.topic_code}`} // Key nên unique hơn khi data thay đổi
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            />
          ) : !isLoading ? ( // Chỉ hiển thị "không có chủ đề" khi không loading và không có lỗi
            <View style={styles.centeredMessageContainer}>
              <Text style={styles.emptyDataText}>
                {error
                  ? `Lỗi: ${error}`
                  : 'Không có chủ đề nào cho cấp độ này.'}
              </Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>

      {/* Modal chọn Level */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLevelModalVisible}
        onRequestClose={() => {
          setIsLevelModalVisible(!isLevelModalVisible);
        }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsLevelModalVisible(false)} // Đóng modal khi chạm ra ngoài
        >
          <View
            style={styles.modalContentView}
            onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Chọn Cấp Độ</Text>
            {allLevels.length > 0 ? (
              <FlatList
                data={allLevels}
                renderItem={renderLevelSelectItem}
                keyExtractor={item => item.id.toString()}
              />
            ) : (
              <Text style={styles.modalNoLevelsText}>
                Không có cấp độ nào để chọn.
              </Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsLevelModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding * 0.5,
    borderRadius: SIZES.radius * 3,
    marginHorizontal: SIZES.padding,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  menuButton: {
    padding: SIZES.padding * 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 0.4,
    borderRadius: SIZES.radius * 1.5,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SIZES.margin,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: SIZES.padding * 1.5,
    backgroundColor: COLORS.gray,
  },
  trackItemText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium * 1.15,
    color: COLORS.black,
    flex: 1,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.text || '#000000', // Fallback color
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.red || '#FF0000', // Fallback color
    textAlign: 'center',
  },
  emptyDataText: {
    fontSize: SIZES.medium,
    color: COLORS.gray || '#808080', // Fallback color
    textAlign: 'center',
  },
  // Styles cho Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentView: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 2,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontWeight: 'bold',
    marginBottom: SIZES.padding * 1.5,
    textAlign: 'center',
    color: COLORS.text || '#000000',
  },
  modalLevelItem: {
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#DDDDDD', // Fallback color
  },
  modalLevelText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular?.fontFamily || 'System',
    textAlign: 'center',
    color: COLORS.text || '#000000',
  },
  modalNoLevelsText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular?.fontFamily || 'System',
    textAlign: 'center',
    color: COLORS.gray || '#808080',
    paddingVertical: SIZES.padding,
  },
  modalCloseButton: {
    marginTop: SIZES.padding * 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
    fontWeight: '600',
  },
});

export default FollowScreen;
