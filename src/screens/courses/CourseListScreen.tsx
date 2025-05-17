// src/screens/theo_doi/FollowScreen.tsx
import React, {useState, useEffect, useCallback} from 'react';

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
} from 'react-native';
import axios from 'axios';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation';
import {showMessage} from 'react-native-flash-message'; // Import showMessage

// Interfaces (giữ nguyên như trước)
interface Course {
  topic_code: string;
  title: string;
  imageUrl: string;
  levelCode: string;
  quantityLesson: number;
}
interface ApiTopic {
  id: number;
  levelId: number;
  name: string;
  avatarUrl: string;
  dayCreation: string;
}
interface TopicsApiResponse {
  id: number;
  name: string;
  topics: ApiTopic[];
}
interface LevelInfo {
  id: number;
  name: string;
}
type AllLevelsApiResponse = Array<{
  id: number;
  name: string;
  topics?: ApiTopic[];
}>;

type FollowScreenRouteProp = RouteProp<RootStackParamList, 'CourseListScreen'>;
type FollowScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CourseListScreen'
>;

const CourseItemImage = ({imageUrl}: {imageUrl: string}) => (
  <Image source={{uri: imageUrl}} style={styles.itemImage} resizeMode="cover" />
);

const FollowScreen: React.FC = () => {
  const navigation = useNavigation<FollowScreenNavigationProp>();
  const route = useRoute<FollowScreenRouteProp>();

  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLevelName, setCurrentLevelName] =
    useState<string>('Đang tải...');
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);

  const [allLevels, setAllLevels] = useState<LevelInfo[]>([]);
  const [isLevelModalVisible, setIsLevelModalVisible] =
    useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const fetchTopicsByLevel = useCallback(async (levelId: number) => {
    if (isNaN(levelId)) {
      console.warn('fetchTopicsByLevel: levelId không hợp lệ.');
      setError('ID cấp độ không hợp lệ.');
      setIsLoadingTopics(false);
      return;
    }
    setIsLoadingTopics(true);
    setError(null);
    setCoursesData([]);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token');

      const response = await axios.get<TopicsApiResponse>(
        `http://10.0.2.2:8080/api/user/topic/${levelId}/topics`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      if (response.data) {
        setCurrentLevelName(response.data.name || `Cấp độ ${levelId}`);
        if (response.data.topics && response.data.topics.length > 0) {
          const mappedCourses: Course[] = response.data.topics.map(
            (topic: ApiTopic) => ({
              topic_code: topic.id.toString(),
              title: topic.name,
              imageUrl: topic.avatarUrl,
              levelCode: response.data.name || `Cấp độ ${levelId}`,
              quantityLesson: 0,
            }),
          );
          setCoursesData(mappedCourses);
        } else {
          setCoursesData([]);
        }
      } else {
        setError(`Không tìm thấy dữ liệu cho Cấp độ ID: ${levelId}.`);
        setCurrentLevelName(`Cấp độ ${levelId}`);
      }
    } catch (err: any) {
      console.error(`Lỗi khi gọi API topics cho level ${levelId}:`, err);
      let errorMessage = 'Lỗi tải danh sách chủ đề.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = `Lỗi server (${err.response.status}): ${
          err.response.data?.message || 'Không rõ lỗi'
        }`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setCurrentLevelName(`Lỗi tải Cấp độ ${levelId}`);
    } finally {
      setIsLoadingTopics(false);
    }
  }, []);

  const fetchAllLevelsData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('Không tìm thấy token khi tải danh sách levels.');
        setAllLevels([]);
        return;
      }
      const response = await axios.get<AllLevelsApiResponse>(
        `http://10.0.2.2:8080/api/public/level`,
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (response.data && Array.isArray(response.data)) {
        const levels: LevelInfo[] = response.data.map(level => ({
          id: Number(level.id),
          name: level.name,
        }));
        setAllLevels(levels);
      } else {
        console.warn('Dữ liệu levels không hợp lệ từ API');
        setAllLevels([]);
      }
    } catch (err) {
      console.error('Lỗi khi gọi API lấy danh sách levels:', err);
      setAllLevels([]);
    }
  }, []);

  useEffect(() => {
    const initializeScreen = async () => {
      setIsInitialLoading(true);
      let levelToLoad: number;
      const levelIdFromParams = route.params?.levelId;

      if (levelIdFromParams !== undefined && !isNaN(levelIdFromParams)) {
        levelToLoad = levelIdFromParams;
      } else {
        const storedLevelString = await AsyncStorage.getItem('userLevel');
        if (storedLevelString !== null) {
          const storedLevelId = parseInt(storedLevelString, 10);
          levelToLoad = !isNaN(storedLevelId) ? storedLevelId : 1;
        } else {
          levelToLoad = 1;
        }
      }

      setCurrentLevelId(levelToLoad);
      try {
        await AsyncStorage.setItem('userLevel', String(levelToLoad));
      } catch (e) {
        console.error('FollowScreen: Lỗi khi lưu userLevel ban đầu:', e);
      }

      setIsInitialLoading(false);
    };

    initializeScreen();
    fetchAllLevelsData();
  }, [route.params?.levelId, fetchAllLevelsData]);

  useEffect(() => {
    if (currentLevelId !== null && !isInitialLoading) {
      fetchTopicsByLevel(currentLevelId);
    }
  }, [currentLevelId, isInitialLoading, fetchTopicsByLevel]);

  const handleItemPress = (course: Course) => {
    navigation.navigate('CourseDetail', {
      courseId: course.topic_code,
      title: course.title,
    });
  };

  const handleMenuPress = () => {
    if (allLevels.length > 0) {
      setIsLevelModalVisible(true);
    } else {
      fetchAllLevelsData();
    }
  };

  // <<<<< SỬA ĐỔI CHÍNH Ở ĐÂY >>>>>
  const handleSelectLevel = async (level: LevelInfo) => {
    setIsLevelModalVisible(false);
    if (currentLevelId !== level.id) {
      const newLevelId = level.id;
      const newLevelName = level.name; // Lấy tên level để hiển thị thông báo

      // Cập nhật UI ngay để người dùng thấy thay đổi
      setCurrentLevelId(newLevelId);
      // Tên level (currentLevelName) sẽ được cập nhật sau khi fetchTopicsByLevel thành công

      try {
        const userId = await AsyncStorage.getItem('UserId');
        const authToken = await AsyncStorage.getItem('token');

        if (!userId || !authToken) {
          showMessage({
            message:
              'Lỗi xác thực. Không thể đồng bộ lựa chọn level lên server.',
            type: 'warning',
            duration: 3000,
          });
          // Vẫn cho phép xem local, nhưng không lưu vào AsyncStorage nếu không xác thực được
          // Hoặc có thể quyết định không cho setCurrentLevelId nếu không có auth. Tùy logic bạn muốn.
          return;
        }

        const payload = {
          id: userId, // idUser từ AsyncStorage
          levelId: String(newLevelId), // idLevel mới được chọn (chuyển thành string nếu API yêu cầu)
        };

        console.log(
          `FollowScreen: Đang cập nhật level lên server: ${JSON.stringify(
            payload,
          )}`,
        );
        // Gọi API để cập nhật level của user trên server
        // Sử dụng POST như trong SelectionScreen (hoặc PUT nếu backend của bạn dùng PUT)
        await axios.post('http://10.0.2.2:8080/api/public/level', payload, {
          headers: {Authorization: `Bearer ${authToken}`},
        });

        // Nếu API thành công, LƯU level mới này vào AsyncStorage
        await AsyncStorage.setItem('userLevel', String(newLevelId));
        // Không cần showMessage ở đây nữa vì fetchTopicsByLevel sẽ cập nhật tên Level
        // và người dùng sẽ thấy danh sách topics mới.
        // showMessage({ message: `Đã chuyển sang xem ${newLevelName} và đồng bộ lựa chọn.`, type: 'success' });
        console.log(
          `FollowScreen: Đã cập nhật userLevel mới: ${newLevelId} lên server và AsyncStorage.`,
        );
      } catch (error: any) {
        console.error(
          `FollowScreen: Lỗi khi cập nhật level ${newLevelId} (${newLevelName}) lên server:`,
          error,
        );
        let errorMessage = `Không thể đồng bộ lựa chọn "${newLevelName}" lên server. Bạn vẫn có thể xem nội dung của cấp độ này cho phiên hiện tại.`;
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = `Lỗi server (${
            error.response.status
          }) khi đồng bộ "${newLevelName}": ${
            error.response.data?.message || 'Không rõ lỗi'
          }`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showMessage({message: errorMessage, type: 'danger', duration: 4000});
        // Lưu ý: currentLevelId đã được set, người dùng vẫn xem được level mới localy.
        // AsyncStorage không được cập nhật 'userLevel' với newLevelId nếu API lỗi,
        // nên lần sau mở app sẽ là level cũ (đã được đồng bộ thành công trước đó).
      }
    }
  };
  // <<<<< KẾT THÚC SỬA ĐỔI CHÍNH >>>>>

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

  // Các phần return và styles giữ nguyên như trước
  // ... (Phần return JSX và styles đầy đủ như bạn đã có) ...
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang khởi tạo dữ liệu...</Text>
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
                {isLoadingTopics ? 'Đang tải...' : currentLevelName}
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
          {isLoadingTopics && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{marginBottom: 10}}
            />
          )}

          {!isLoadingTopics && error && coursesData.length === 0 && (
            <View style={styles.centeredMessageContainer}>
              <Text style={styles.errorText}>Lỗi: {error}</Text>
            </View>
          )}

          {!isLoadingTopics && !error && coursesData.length === 0 && (
            <View style={styles.centeredMessageContainer}>
              <Text style={styles.emptyDataText}>
                Không có chủ đề nào cho cấp độ này.
              </Text>
            </View>
          )}

          {coursesData.length > 0 && (
            <FlatList
              data={coursesData}
              renderItem={renderCourseItem}
              keyExtractor={item => `${currentLevelId}-${item.topic_code}`}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ImageBackground>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isLevelModalVisible}
        onRequestClose={() => setIsLevelModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsLevelModalVisible(false)}>
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
    color: COLORS.text || '#000000',
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.red || '#FF0000',
    textAlign: 'center',
  },
  emptyDataText: {
    fontSize: SIZES.medium,
    color: COLORS.gray || '#808080',
    textAlign: 'center',
  },
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
    borderBottomColor: COLORS.lightGray || '#DDDDDD',
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
