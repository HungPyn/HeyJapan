// src/screens/lessons/ContentsLyThuyetScreen.tsx (Ví dụ đường dẫn)
import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
  // Alert, // Bỏ Alert nếu không dùng
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

// Giả sử màn hình này được gọi từ CourseDetailScreen, và cả hai thuộc CoursesStackParamList
// Hoặc bạn có thể tạo một LessonStackParamList riêng
import {CoursesStackParamList, RootStackParamList} from '../../navigation';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Image} from 'react-native'; // Import Image đã có sẵn
// import SoundPlayer from 'react-native-sound-player'; // Ví dụ thư viện âm thanh

// --- BEGIN DATA (Như đã định nghĩa ở Bước 1) ---
interface LessonContentItem {
  content_code: number;
  content_type: 'Từ vựng' | 'Ngữ pháp';
  title: string | null;
  content_detail: string;
  audio_url: string | null;
  image_url: string | null;
  display_order: number;
  lesson_code: number;
  skill_code: number;
}

const allLessonContents: LessonContentItem[] = [
  // ... (Dán toàn bộ mảng dữ liệu bạn cung cấp vào đây)
  {
    content_code: 1,
    content_type: 'Từ vựng',
    title: 'こんにちは',
    content_detail: 'Xin chào (Konnichiwa)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: 'https://example.com/images/konnichiwa.png',
    display_order: 1,
    lesson_code: 2,
    skill_code: 1,
  },
  {
    content_code: 2,
    content_type: 'Từ vựng',
    title: 'さようなら',
    content_detail: 'Tạm biệt (Sayounara)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: 'https://example.com/images/sayounara.png',
    display_order: 2,
    lesson_code: 2,
    skill_code: 1,
  },
  {
    content_code: 3,
    content_type: 'Ngữ pháp',
    title: 'Cách dùng こんにちは',
    content_detail:
      'こんにちは dùng để chào hỏi vào buổi chiều hoặc ban ngày.\nNó thể hiện sự lịch sự cơ bản và có thể dùng trong nhiều tình huống khác nhau.\nKhông nên dùng với người rất thân thiết vào buổi sáng sớm (khi đó dùng Ohayou).',
    audio_url: null,
    image_url: null,
    display_order: 3,
    lesson_code: 2,
    skill_code: 1,
  },
  {
    content_code: 4,
    content_type: 'Ngữ pháp',
    title: 'Mẫu câu ～です',
    content_detail:
      "～です (desu) dùng để kết thúc câu một cách lịch sự, khẳng định một điều gì đó. Tương đương với 'là' trong tiếng Việt.\nVí dụ: わたしは学生です。(Watashi wa gakusei desu) - Tôi là học sinh.\nこれは本です。(Kore wa hon desu) - Đây là quyển sách.",
    audio_url: null,
    image_url: null,
    display_order: 4,
    lesson_code: 2,
    skill_code: 1,
  },
  {
    content_code: 5,
    content_type: 'Từ vựng',
    title: 'ありがとう',
    content_detail: 'Cảm ơn (Arigatou)',
    audio_url:
      'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    image_url: 'https://example.com/images/arigatou.png',
    display_order: 5,
    lesson_code: 2,
    skill_code: 1,
  },
  {
    content_code: 6,
    content_type: 'Ngữ pháp',
    title: 'Cách dùng ありがとう',
    content_detail:
      'ありがとう dùng để cảm ơn người khác. ありがとうございます (arigatou gozaimasu) là cách nói lịch sự hơn, thường dùng với người lớn tuổi hơn hoặc người không thân quen.',
    audio_url: null,
    image_url: null,
    display_order: 6,
    lesson_code: 2,
    skill_code: 1,
  },
];
// --- END DATA ---

// Type cho route params khi điều hướng đến màn hình này
// Giả sử màn hình này tên là 'LessonContentDetails' trong navigator
// và nhận lessonId và lessonTitle
// Type cho route params của màn hình này
type ContentsLyThuyetScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'ContentsLyThuyetScreen' // Tên route của màn hình này như đã đăng ký trong Navigator
>;

// Để đơn giản, nếu bạn navigate từ LessonScreen trong CoursesStackParamList:
// type ContentsLyThuyetScreenRouteProp = RouteProp<CoursesStackParamList, 'Lesson'>;

// Sửa lại type cho navigation prop
type ContentsLyThuyetScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const ContentsLyThuyetScreen: React.FC = () => {
  const route = useRoute<ContentsLyThuyetScreenRouteProp>();
  const navigation = useNavigation<ContentsLyThuyetScreenNavigationProp>();

  // Lấy lessonId và lessonTitle từ route.params
  // Đảm bảo rằng khi navigate đến màn hình này, bạn truyền đúng các params này
  const lessonCodeFromParam = route.params?.lessonCode;
  const lessonNameFromParam = route.params?.lessonName;

  const currentLessonId = parseInt(lessonCodeFromParam || '0', 10);

  const [activeContentType, setActiveContentType] = useState<
    'Từ vựng' | 'Ngữ pháp'
  >('Từ vựng');

  const lessonContents = useMemo(() => {
    return allLessonContents.filter(
      content => content.lesson_code === currentLessonId,
    );
  }, [currentLessonId]);

  const vocabularyItems = useMemo(() => {
    return lessonContents.filter(content => content.content_type === 'Từ vựng');
  }, [lessonContents]);

  const grammarContent = useMemo(() => {
    return lessonContents
      .filter(content => content.content_type === 'Ngữ pháp')
      .map(content => {
        let text = '';
        if (content.title) {
          // Thêm tiêu đề ngữ pháp nếu có
          text += `## ${content.title}\n\n`;
        }
        text += content.content_detail;
        return text;
      })
      .join('\n\n'); // Gộp các đoạn content_detail, phân cách bằng đường kẻ
  }, [lessonContents]);

  const playSound = (audioUrl: string | null) => {
    if (audioUrl) {
      console.log('Playing sound:', audioUrl);
      // Tạm thời dùng Alert, bạn sẽ thay bằng thư viện phát âm thanh
      // Alert.alert('Phát âm thanh', audioUrl);
      // Ví dụ với react-native-sound (cần cài đặt và link)
      // try {
      //   const sound = new SoundPlayer.Sound(audioUrl, SoundPlayer.Sound.MAIN_BUNDLE, (error) => {
      //     if (error) {
      //       console.log('failed to load the sound', error);
      //       Alert.alert('Lỗi', 'Không thể phát âm thanh.');
      //       return;
      //     }
      //     sound.play((success) => {
      //       if (success) {
      //         console.log('successfully finished playing');
      //       } else {
      //         console.log('playback failed due to audio decoding errors');
      //       }
      //       sound.release();
      //     });
      //   });
      // } catch (e) {
      //    console.log('cannot play sound', e)
      // }
      Alert.alert(`Đang phát: ${audioUrl}`); // Placeholder
    } else {
      Alert.alert('Không có âm thanh cho mục này.');
    }
  };

  const renderVocabularyItem = ({item}: {item: LessonContentItem}) => (
    <View style={styles.vocabItemContainer}>
      <View style={styles.vocabTextContainer}>
        <Text style={styles.vocabJapanese}>{item.title}</Text>
        <Text style={styles.vocabMeaning}>{item.content_detail}</Text>
      </View>
      {item.audio_url && ( // Chỉ hiển thị nút loa nếu có audio_url
        <TouchableOpacity onPress={() => playSound(item.audio_url)}>
          <Image
            source={require('../../assets/images/phatAmThanh.png')} // Đường dẫn icon hoàn thành của bạn
            style={styles.lessonStatusImage} // Style riêng cho ảnh icon
          />
        </TouchableOpacity>
      )}
    </View>
  );

  // Lấy tiêu đề cho header, ưu tiên từ param truyền vào, nếu không có thì lấy từ tên bài học đầu tiên (nếu có)
  const headerDisplayTitle =
    lessonNameFromParam || lessonContents[0]?.title || 'Nội dung bài học';

  if (!lessonNameFromParam) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Không có thông tin bài học.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonError}>
          <Text style={styles.backButtonTextError}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ImageBackground
        source={require('../../assets/images/nen3.jpg')} // Thay bằng ảnh nền của bạn
        style={StyleSheet.absoluteFillObject}
        imageStyle={{opacity: 0.1}}
        resizeMode="cover">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerDisplayTitle}
              </Text>
            </View>
            <View style={styles.segmentControlContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeContentType === 'Từ vựng' && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveContentType('Từ vựng')}>
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeContentType === 'Từ vựng' &&
                      styles.segmentButtonTextActive,
                  ]}>
                  Từ vựng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  activeContentType === 'Ngữ pháp' &&
                    styles.segmentButtonActive,
                ]}
                onPress={() => setActiveContentType('Ngữ pháp')}>
                <Text
                  style={[
                    styles.segmentButtonText,
                    activeContentType === 'Ngữ pháp' &&
                      styles.segmentButtonTextActive,
                  ]}>
                  Ngữ pháp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeContentType === 'Từ vựng' ? (
            vocabularyItems.length > 0 ? (
              <FlatList
                data={vocabularyItems}
                renderItem={renderVocabularyItem}
                keyExtractor={item => item.content_code.toString()}
                style={styles.contentList}
                contentContainerStyle={styles.contentListContent}
              />
            ) : (
              <View style={styles.emptyContentContainer}>
                <Text style={styles.emptyContentText}>
                  Chưa có từ vựng cho bài học này.
                </Text>
              </View>
            )
          ) : grammarContent ? ( // Kiểm tra grammarContent có nội dung không
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.grammarContentContainer}>
              {/* Để hiển thị Markdown, bạn cần một thư viện như react-native-markdown-display */}
              {/* Tạm thời hiển thị Text thường, đã loại bỏ ký tự Markdown cơ bản */}
              <Text style={styles.grammarText}>
                {grammarContent.replace(/## |---|(\*\*)|(\*)/g, '')}
              </Text>
            </ScrollView>
          ) : (
            <View style={styles.emptyContentContainer}>
              <Text style={styles.emptyContentText}>
                Chưa có nội dung ngữ pháp cho bài học này.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles được tham khảo và điều chỉnh từ CourseDetailScreen và FollowScreen
// Bạn cần đảm bảo các hằng số COLORS, FONTS, SIZES đã được định nghĩa
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.5,
    marginTop: StatusBar.currentHeight || 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  backButton: {
    paddingRight: SIZES.padding,
    paddingLeft: SIZES.padding * 0.5,
    paddingVertical: SIZES.padding * 0.5,
  },
  backButtonText: {
    fontSize: SIZES.xLarge * 2,
    color: COLORS.black,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.medium,
  },
  headerTitle: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.h2 * 1.1,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  segmentControlContainer: {
    // Style giống CourseDetailScreen
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  segmentButton: {
    paddingHorizontal: SIZES.padding * 1.2,
    paddingVertical: SIZES.padding * 0.6,
    backgroundColor: COLORS.white,
    // borderRadius: 5, // Bo góc bên trong segment, có thể không cần nếu container đã bo
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primary,
    // shadow có thể giữ nếu muốn
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2.0,
    elevation: 2,
  },
  segmentButtonText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  segmentButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  contentList: {
    flex: 1,
  },
  contentListContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 1.5,
    paddingBottom: SIZES.padding * 2,
  },
  contentScroll: {
    flex: 1,
  },
  grammarContentContainer: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
    backgroundColor: COLORS.nenItem, // Nền kem cho ngữ pháp
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  vocabItemContainer: {
    // Style cho mỗi item từ vựng
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.nenItem,
    padding: SIZES.padding * 1.2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  vocabTextContainer: {
    flex: 1,
    marginRight: SIZES.medium,
  },
  vocabFurigana: {
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.small * 0.9, // Chữ furigana nhỏ hơn
    color: COLORS.gray,
    marginBottom: 1,
  },
  vocabJapanese: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    fontSize: SIZES.medium * 1.3, // Chữ Nhật to vừa
    color: COLORS.black,
    marginBottom: 3,
    fontWeight: '900',
  },
  vocabMeaning: {
    // content_detail của Từ vựng sẽ là nghĩa tiếng Việt
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font * 0.9,
    color: COLORS.black,
  },
  audioIcon: {
    fontSize: SIZES.large * 0.8,
    color: COLORS.primary, // Màu icon loa
  },
  grammarText: {
    // Style cho nội dung ngữ pháp gộp lại
    fontFamily: FONTS.regular?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.black,
    lineHeight: SIZES.font * 1.2, // Giãn dòng cho dễ đọc
    textAlign: 'justify',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  emptyContentText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  lessonStatusImage: {
    width: 25, // Tùy kích thước bạn muốn
    height: 25,
    resizeMode: 'contain', // Đảm bảo không bị crop
    marginLeft: 8, // Tạo khoảng cách với text
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontFamily: FONTS.medium?.fontFamily || 'System',
    fontSize: SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  backButtonError: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  backButtonTextError: {
    fontFamily: FONTS.bold?.fontFamily || 'System',
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
});

export default ContentsLyThuyetScreen;
