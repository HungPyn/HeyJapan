// src/components/lesson_types/PronunciationLessonContent.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme'; // Giữ nguyên đường dẫn này

// Import MappedContentItem từ ContentsScreen.tsx
// Đảm bảo rằng bạn đã export MappedContentItem từ file đó.
import {MappedContentItem} from '../ContentsScreen';
// Nếu Option được định nghĩa riêng và MappedContentItem dùng đến, bạn cũng cần export và import nó.
// Tuy nhiên, nếu Option chỉ được dùng trong định nghĩa của MappedContentItem và không dùng trực tiếp ở đây,
// thì chỉ cần import MappedContentItem là đủ.

interface PronunciationLessonContentProps {
  item: MappedContentItem;
  onPlaySound?: (audioUrl: string | null) => void;
}

const PronunciationLessonContent: React.FC<PronunciationLessonContentProps> = ({
  item,
  onPlaySound,
}) => {
  const textToPronounce =
    item.correct_answer_foreign || item.content_detail || 'Nội dung phát âm...';
  const promptAudioUrl = item.audio_url;

  const handlePlayPromptAudio = () => {
    if (promptAudioUrl && onPlaySound) {
      onPlaySound(promptAudioUrl);
    } else {
      Alert.alert('Thông báo', 'Không có âm thanh mẫu.');
    }
  };

  const handleRecord = () => {
    Alert.alert('Ghi âm', 'Chức năng ghi âm (chưa triển khai).');
  };

  return (
    <View style={styles.contentCard}>
      <Text style={styles.lessonTitle}>
        {item.title || 'Nói lại từ (câu) dưới đây:'}
      </Text>

      {textToPronounce && (
        <Text style={styles.textToPronounceStyle}>{textToPronounce}</Text>
      )}

      {promptAudioUrl && (
        <TouchableOpacity
          onPress={handlePlayPromptAudio}
          style={styles.audioButtonContainer}>
          <Image
            source={require('../../../assets/images/iconAmThanh.png')} // Đường dẫn đến ảnh
            style={styles.audioIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.recordButtonContainer}
        onPress={handleRecord}>
        <Image
          source={require('../../../assets/images/micro.png')} // Đường dẫn đến ảnh
          style={styles.recordIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {item.content_detail &&
        item.content_detail !== textToPronounce &&
        item.content_detail !== item.title && (
          <Text style={styles.additionalDetailStyle}>
            Nghĩa: {item.content_detail}
          </Text>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  lessonTitle: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textToPronounceStyle: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.h3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.padding,
    lineHeight: SIZES.h3 * 1.4,
  },
  audioButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    padding: SIZES.base,
    marginBottom: SIZES.base,
  },
  audioIcon: {
    width: 100,
    height: 100,
    tintColor: COLORS.primary,
  },
  recordButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SIZES.base,
    padding: SIZES.padding * 0.75,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 60,
    width: 70,
    height: 70,
    justifyContent: 'center',
  },
  recordIcon: {
    width: 35,
    height: 35,
    tintColor: COLORS.red,
  },
  additionalDetailStyle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular?.fontFamily,
    color: COLORS.darkGray,
    marginTop: SIZES.padding,
    textAlign: 'center',
  },
});

export default PronunciationLessonContent;
