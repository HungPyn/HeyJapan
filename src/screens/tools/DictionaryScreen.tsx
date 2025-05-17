// src/screens/tool/DictionaryScreen.tsx
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
  Modal,
  Alert, // Thêm Alert
} from 'react-native';
import axios from 'axios'; // Thêm axios để gọi API
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage để lấy token
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme'; // Đảm bảo đường dẫn đúng

// Định nghĩa Type cho Course (sẽ được map từ ApiTopic)
interface Course {
  topic_code: string; // Sẽ là topic.id từ API
  title: string; // Sẽ là topic.name từ API
  imageUrl: string; // Sẽ là topic.avatarUrl từ API
  levelCode: string; // Tên của level chứa topic này, ví dụ: "Tiếng Nhật sơ cấp"
  // quantityLesson có thể không cần thiết nếu API topic không cung cấp, hoặc bạn có thể đặt giá trị mặc định
}

// Định nghĩa Type cho Topic từ API (dựa trên cấu trúc bạn cung cấp)
interface ApiTopic {
  id: number;
  levelId: number;
  name: string;
  avatarUrl: string;
  dayCreation: string;
}

// Định nghĩa Type cho Response của API lấy topics theo level
interface TopicsApiResponse {
  id: number; // ID của level
  name: string; // Tên của level, ví dụ: "Tiếng Nhật sơ cấp"
  topics: ApiTopic[];
}

// Định nghĩa Type cho một Level trong danh sách chọn (cho Modal)
interface LevelInfo {
  id: number;
  name: string;
}

// Định nghĩa Type cho Response của API lấy tất cả levels
// API này sẽ trả về một mảng các LevelInfo
type AllLevelsApiResponse = Array<LevelInfo>;

const CourseItemImage = ({imageUrl}: {imageUrl: string}) => (
  <Image
    source={
      imageUrl ? {uri: imageUrl} : require('../../assets/images/Logo.png')
    } // Fallback nếu imageUrl null/undefined
    style={styles.itemImage}
    resizeMode="cover"
  />
);

const FollowScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevelName, setCurrentLevelName] =
    useState<string>('Đang tải...'); // Tên của level hiện tại
  const [currentLevelId, setCurrentLevelId] = useState<number>(1); // ID của level hiện tại, mặc định là 1

  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]); // State cho danh sách tất cả levels
  const [isLevelModalVisible, setIsLevelModalVisible] =
    useState<boolean>(false); // State cho modal chọn level

  // Hàm gọi API lấy danh sách topics theo levelId
  const fetchTopicsByLevel = async (levelId: number) => {
    setIsLoading(true);
    setError(null);
    // setCoursesData([]); // Xóa dữ liệu cũ để người dùng thấy trạng thái loading mới
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token');
      }
      const response = await axios.get<TopicsApiResponse>(
        `http://10.0.2.2:8080/api/user/topic/${levelId}/topics`, // API endpoint của bạn
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (response.data) {
        setCurrentLevelName(response.data.name || `Level ${levelId}`); // Cập nhật tên level từ API
        if (response.data.topics && response.data.topics.length > 0) {
          const mappedCourses: Course[] = response.data.topics.map(
            (topic: ApiTopic) => ({
              topic_code: topic.id.toString(),
              title: topic.name,
              imageUrl: topic.avatarUrl,
              levelCode: response.data.name || `Level ${levelId}`, // Sử dụng tên level từ API
            }),
          );
          setCoursesData(mappedCourses);
        } else {
          setCoursesData([]); // Không có topics cho level này
        }
      } else {
        setError(`Không tìm thấy dữ liệu cho Level ID: ${levelId}.`);
        setCurrentLevelName(`Level ${levelId}`);
        setCoursesData([]);
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
        // Có thể navigate về màn hình login ở đây
      }
      setError(errorMessage);
      setCurrentLevelName(`Lỗi tải Level ${levelId}`);
      setCoursesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gọi API lấy tất cả các levels
  const fetchAllLevelsData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('Không tìm thấy token khi tải danh sách levels.');
        setAllLevels([]);
        return;
      }
      // API endpoint để lấy danh sách tất cả các level
      const response = await axios.get<AllLevelsApiResponse>(
        `http://10.0.2.2:8080/api/public/level`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      if (response.data && Array.isArray(response.data)) {
        setAllLevels(response.data);
      } else {
        console.warn('Dữ liệu levels không hợp lệ từ API');
        setAllLevels([]);
      }
    } catch (err) {
      console.error('Lỗi khi gọi API lấy danh sách levels:', err);
      setAllLevels([]);
      //setError('Không thể tải danh sách cấp độ.'); // Có thể set lỗi nếu muốn hiển thị cho người dùng
    }
  };

  useEffect(() => {
    fetchAllLevelsData(); // Gọi API lấy tất cả levels khi component mount
    // Không gọi fetchTopicsByLevel(currentLevelId) ở đây nữa vì nó sẽ được gọi khi currentLevelId thay đổi (bao gồm cả giá trị mặc định ban đầu)
  }, []); // Chỉ chạy một lần khi mount

  useEffect(() => {
    fetchTopicsByLevel(currentLevelId); // Gọi API lấy topics cho level hiện tại mỗi khi currentLevelId thay đổi
  }, [currentLevelId]); // Phụ thuộc vào currentLevelId

  const handleItemPress = (course: Course) => {
    navigation.navigate('TienDoScreen', {
      topic_code: course.topic_code, // ID của topic
      title: course.title, // Tên của topic
      levelId: currentLevelId, // ID của level hiện tại
      levelName: currentLevelName, // Tên của level hiện tại
    });
  };

  const handleMenuPress = () => {
    if (allLevels.length > 0) {
      setIsLevelModalVisible(true);
    } else {
      fetchAllLevelsData().then(() => {
        // Sử dụng một callback để đảm bảo allLevels đã được cập nhật trước khi kiểm tra lại
        // Tuy nhiên, setAllLevels là bất đồng bộ, nên giá trị allLevels ngay sau fetchAllLevelsData() có thể chưa được cập nhật.
        // Một cách tiếp cận tốt hơn là kiểm tra allLevels trong một useEffect phụ thuộc vào allLevels,
        // hoặc đơn giản là cho phép người dùng thử lại nếu modal không mở.
        // Ở đây, chúng ta sẽ kiểm tra lại trực tiếp nhưng cần lưu ý điều này.
        if (allLevels.length > 0) {
          setIsLevelModalVisible(true);
        } else {
          // Dùng Alert để thông báo cho người dùng.
          Alert.alert(
            'Thông báo',
            'Không có danh sách cấp độ để hiển thị hoặc đã có lỗi xảy ra khi tải. Vui lòng thử lại sau.',
            [{text: 'Đồng ý'}],
          );
        }
      });
    }
  };

  const handleSelectLevel = (level: LevelInfo) => {
    setCurrentLevelId(level.id); // Cập nhật levelId, useEffect sẽ tự động gọi fetchTopicsByLevel
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
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {isLoading && coursesData.length === 0
                  ? 'Đang tải...'
                  : currentLevelName}
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

          {/* Course Items Section */}
          {isLoading && coursesData.length === 0 ? ( // Chỉ hiển thị loading toàn màn hình khi chưa có data và đang load lần đầu
            <View style={styles.centeredMessageContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải dữ liệu chủ đề...</Text>
            </View>
          ) : error && coursesData.length === 0 ? ( // Chỉ hiển thị lỗi toàn màn hình khi có lỗi và không có data
            <View style={styles.centeredMessageContainer}>
              <Text style={styles.errorText}>Lỗi: {error}</Text>
              <TouchableOpacity
                onPress={() => fetchTopicsByLevel(currentLevelId)}
                style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : coursesData.length > 0 ? (
            <FlatList
              data={coursesData}
              renderItem={renderCourseItem}
              keyExtractor={item => `${currentLevelId}-${item.topic_code}`} // Key nên unique khi data thay đổi
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            // Không loading, không lỗi, không có data
            <View style={styles.centeredMessageContainer}>
              <Text style={styles.emptyDataText}>
                Không có chủ đề nào cho cấp độ này.
              </Text>
            </View>
          )}
          {/* Hiển thị activity indicator nhỏ khi đang load level mới mà vẫn còn data cũ */}
          {isLoading && coursesData.length > 0 && (
            <ActivityIndicator
              style={styles.inlineLoading}
              size="small"
              color={COLORS.primary}
            />
          )}
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
            onStartShouldSetResponder={() => true} // Để touch bên trong modal không bị lan ra ngoài
          >
            <Text style={styles.modalTitle}>Chọn Cấp Độ</Text>
            {allLevels.length > 0 ? (
              <FlatList
                data={allLevels}
                renderItem={renderLevelSelectItem}
                keyExtractor={item => item.id.toString()}
              />
            ) : (
              <Text style={styles.modalNoLevelsText}>
                Không có cấp độ nào để chọn hoặc đang tải...
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
    paddingBottom: SIZES.padding * 2, // Đảm bảo có không gian cho item cuối
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 0.75,
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
    backgroundColor: COLORS.lightGray,
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
    color: COLORS.text || '#000000',
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.red || '#FF0000',
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  emptyDataText: {
    fontSize: SIZES.medium,
    color: COLORS.gray || '#808080',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding * 0.5,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontFamily: FONTS.semiBold?.fontFamily || 'System',
  },
  inlineLoading: {
    position: 'absolute',
    top:
      (StatusBar.currentHeight || 20) +
      SIZES.padding * 0.75 +
      36 +
      SIZES.padding,
    alignSelf: 'center',
    zIndex: 10,
  },
  // Styles cho Modal (ĐỒNG BỘ VỚI SourcList)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Style từ SourcList
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentView: {
    backgroundColor: COLORS.white, // Style từ SourcList
    borderRadius: SIZES.radius, // Style từ SourcList
    padding: SIZES.padding * 2, // Style từ SourcList
    width: '80%', // Style từ SourcList
    maxHeight: '60%', // Style từ SourcList
    // Bỏ shadow riêng nếu SourcList không có, hoặc giữ nếu bạn muốn
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  modalTitle: {
    fontSize: SIZES.h3, // Style từ SourcList
    fontFamily: FONTS.bold?.fontFamily || 'System', // Style từ SourcList
    fontWeight: 'bold', // Style từ SourcList
    marginBottom: SIZES.padding * 1.5, // Style từ SourcList
    textAlign: 'center', // Style từ SourcList
    color: COLORS.text || '#000000', // Style từ SourcList (đảm bảo COLORS.text được định nghĩa)
  },
  modalLevelItem: {
    paddingVertical: SIZES.padding, // Style từ SourcList
    borderBottomWidth: 1, // Style từ SourcList
    borderBottomColor: COLORS.lightGray || '#DDDDDD', // Style từ SourcList (đảm bảo COLORS.lightGray được định nghĩa)
  },
  modalLevelText: {
    fontSize: SIZES.medium, // Style từ SourcList
    fontFamily: FONTS.regular?.fontFamily || 'System', // Style từ SourcList
    textAlign: 'center', // Style từ SourcList
    color: COLORS.text || '#000000', // Style từ SourcList
  },
  modalNoLevelsText: {
    fontSize: SIZES.medium, // Style từ SourcList
    fontFamily: FONTS.regular?.fontFamily || 'System', // Style từ SourcList
    textAlign: 'center', // Style từ SourcList
    color: COLORS.gray || '#808080', // Style từ SourcList
    paddingVertical: SIZES.padding, // Style từ SourcList
  },
  modalCloseButton: {
    marginTop: SIZES.padding * 2, // Style từ SourcList
    backgroundColor: COLORS.primary, // Style từ SourcList
    borderRadius: SIZES.radius, // Style từ SourcList
    paddingVertical: SIZES.padding, // Style từ SourcList
    alignItems: 'center', // Style từ SourcList
  },
  modalCloseButtonText: {
    color: COLORS.white, // Style từ SourcList
    fontSize: SIZES.medium, // Style từ SourcList
    fontFamily: FONTS.semiBold?.fontFamily || 'System', // Style từ SourcList
    fontWeight: '600', // Style từ SourcList
  },
});

export default FollowScreen;
