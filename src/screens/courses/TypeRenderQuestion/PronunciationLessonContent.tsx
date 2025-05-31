// src/components/lesson_types/PronunciationLessonContent.tsx
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme';
import {MappedContentItem} from '../ContentsScreen'; // Đảm bảo đường dẫn đúng
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  // SpeechPartialResultsEvent, // Dùng SpeechResultsEvent
} from '@react-native-voice/voice';

const calculateSimilarity = (text1: string, text2: string): number => {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  const set1 = new Set(normalize(text1));
  const set2 = new Set(normalize(text2));
  if (set1.size === 0 && set2.size === 0) return 1;
  if (set1.size === 0 || set2.size === 0) return 0;
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

interface PronunciationLessonContentProps {
  item: MappedContentItem;
  onPlaySound?: (audioUrl: string | null) => void;
  onSkip: () => void;
  onAttempt: (isCorrect: boolean) => void;
}

const PronunciationLessonContent: React.FC<PronunciationLessonContentProps> = ({
  item,
  onPlaySound,
  onSkip,
  onAttempt,
}) => {
  // NỘI DUNG CẦN PHÁT ÂM VÀ ĐỂ SO SÁNH:
  // Sử dụng item.content_detail (targetWordNative từ API) hoặc fallback.
  const textToPronounceAndCompare =
    item.content_detail || 'Nói lại câu dưới đây ';

  // Âm thanh mẫu (nếu có, có thể là của câu gốc item.correct_answer_foreign hoặc của item.audio_url)
  const promptAudioUrl = item.audio_url; // Giả sử có thể có item.correct_answer_foreign_audio_url

  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [partialRecognizedText, setPartialRecognizedText] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);

  const requestMicrophonePermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền truy cập Micro',
            message:
              'Ứng dụng cần quyền truy cập micro để bạn có thể luyện phát âm.',
            buttonNeutral: 'Để sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Lỗi xin quyền micro:', err);
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    Voice.isAvailable()
      .then(isAvailableResult => {
        setIsVoiceAvailable(!!isAvailableResult);
        if (!isAvailableResult) console.warn('Dịch vụ Voice không khả dụng');
      })
      .catch(e => {
        console.error('Lỗi kiểm tra Voice.isAvailable:', e);
        setIsVoiceAvailable(false);
      });

    const onSpeechStart = (e: SpeechStartEvent) => {
      console.log('onSpeechStart: ', e);
      setIsListening(true);
      setRecognizedText('');
      setPartialRecognizedText('');
      setVoiceError('');
    };
    const onSpeechEnd = (e: SpeechEndEvent) => {
      console.log('onSpeechEnd: ', e);
      setIsListening(false);
    };
    const onSpeechResults = (e: SpeechResultsEvent) => {
      console.log('onSpeechResults: ', e);
      setIsListening(false);
      if (e.value && e.value.length > 0) {
        const spokenText = e.value[0];
        setRecognizedText(spokenText);
        setPartialRecognizedText('');
        // SO SÁNH VỚI textToPronounceAndCompare (chính là displayInstruction theo yêu cầu mới)
        const similarity = calculateSimilarity(
          spokenText,
          textToPronounceAndCompare,
        );
        console.log(
          `Similarity: ${similarity} (Comparing "${spokenText}" with "${textToPronounceAndCompare}")`,
        );
        const isCorrect = similarity >= 0.5;
        onAttempt(isCorrect);
      } else {
        onAttempt(false);
      }
    };
    const onSpeechError = (e: SpeechErrorEvent) => {
      /* ... giữ nguyên như trước ... */ console.log('onSpeechError: ', e);
      let errorMessage = 'Lỗi không xác định từ bộ nhận dạng giọng nói.';
      if (e.error) {
        const errorCodeString = String(e.error.code);
        errorMessage = `${errorCodeString}/${e.error.message}`;
        if (e.error.message?.includes('No match') || errorCodeString === '7') {
          errorMessage = 'Không nhận diện được giọng nói. Vui lòng thử lại.';
        } else if (
          e.error.message?.includes('Speech recognition engine error') ||
          errorCodeString === '5'
        ) {
          errorMessage = 'Vui lòng đảm bảo bạn đã nói rõ ràng.';
        } else if (e.error.message?.includes('Audio recording error')) {
          errorMessage = 'Lỗi ghi âm. Vui lòng kiểm tra micro.';
        } else if (errorCodeString === '6') {
          errorMessage = 'Hết thời gian chờ. Bạn có nói gì không?';
        }
      }
      setVoiceError(errorMessage);
      setIsListening(false);
      onAttempt(false);
    };
    const onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setPartialRecognizedText(e.value[0]);
      }
    };
    const onSpeechRecognized = (e: any) => {
      console.log('onSpeechRecognized: ', e);
    };

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    return () => {
      Voice.destroy()
        .then(Voice.removeAllListeners)
        .catch(e => console.error('Lỗi hủy Voice recognizer:', e));
    };
  }, [textToPronounceAndCompare, onAttempt, requestMicrophonePermission]);

  const startListening = async () => {
    if (isListening) {
      try {
        await Voice.stop();
      } catch (e) {
        console.error('Lỗi dừng Voice:', e);
      }
      return;
    }
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert('Quyền Micro', 'Ứng dụng cần quyền micro để ghi âm.');
      return;
    }
    if (!isVoiceAvailable) {
      Alert.alert('Lỗi', 'Dịch vụ nhận dạng giọng nói không khả dụng.');
      return;
    }

    setRecognizedText('');
    setPartialRecognizedText('');
    setVoiceError('');
    try {
      // Locale nên khớp với ngôn ngữ của textToPronounceAndCompare (tức là item.content_detail)
      // item.targetLanguageCode nên phản ánh ngôn ngữ của item.content_detail
      let locale = 'ja-JP'; // Mặc định
      const langCode = item.targetLanguageCode?.toLowerCase(); // targetLanguageCode là mã ngôn ngữ của content_detail

      console.log(
        `Bắt đầu lắng nghe với locale: ${locale} cho câu (để so sánh): "${textToPronounceAndCompare}"`,
      );
      await Voice.start(locale);
    } catch (e: any) {
      console.error('Lỗi bắt đầu Voice:', e);
      setVoiceError(e.message || String(e));
      setIsListening(false);
    }
  };

  const handlePlayPromptAudio = () => {
    if (promptAudioUrl && onPlaySound) {
      onPlaySound(promptAudioUrl);
    } else {
      Alert.alert('Thông báo', 'Không có âm thanh mẫu.');
    }
  };

  return (
    <View style={styles.contentCard}>
      {/* TIÊU ĐỀ CỐ ĐỊNH */}
      <Text style={styles.lessonTitle}>{'Nói theo từ (Câu) dưới đây:'}</Text>

      {/* NỘI DUNG CẦN PHÁT ÂM (LẤY TỪ displayInstruction / item.content_detail) */}
      <Text style={styles.textToPronounceStyle}>
        {textToPronounceAndCompare}
      </Text>

      <View style={styles.controlsGroup}>
        {promptAudioUrl && (
          <TouchableOpacity
            onPress={handlePlayPromptAudio}
            style={styles.audioButtonContainer}>
            <Image
              source={require('../../../assets/images/iconAmThanh.png')}
              style={styles.audioIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.recordButtonContainer,
            isListening && styles.recordingActive,
          ]}
          onPress={startListening}>
          {isListening && !voiceError ? (
            <ActivityIndicator size="large" color={COLORS.white} />
          ) : (
            <Image
              source={require('../../../assets/images/micro.png')}
              style={styles.recordIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackTextContainer}>
        {isListening && !partialRecognizedText && !voiceError && (
          <Text style={styles.statusText}>Đang nghe...</Text>
        )}
        {partialRecognizedText !== '' && (
          <Text style={styles.recognizedTextPreview}>
            Đang nhận diện: {partialRecognizedText}
          </Text>
        )}
        {recognizedText !== '' && !isListening && !voiceError && (
          <Text style={styles.recognizedText}>
            Bạn đã nói: {recognizedText}
          </Text>
        )}
        {voiceError !== '' && (
          <Text style={styles.errorText}>{voiceError}</Text>
        )}
      </View>

      <TouchableOpacity onPress={onSkip} style={styles.skipTextTouchable}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles giữ nguyên như phiên bản bạn đã chỉnh sửa gần nhất
const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: SIZES.radius,
    minHeight: 300,
    shadowColor: '#000',
  },
  lessonTitle: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding * 0.5,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: SIZES.base,
  },
  textToPronounceStyle: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.h2,
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SIZES.padding * 0.5,
    lineHeight: SIZES.h2 * 1.3,
    paddingHorizontal: SIZES.base,
  },
  controlsGroup: {
    marginVertical: SIZES.base,
    alignItems: 'center',
    width: '100%',
  },
  audioButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    padding: SIZES.base,
    marginBottom: 100,
  }, // Giữ nguyên marginTop 80 nếu bạn muốn
  audioIcon: {width: 150, height: 150},
  recordButtonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SIZES.padding,
    width: 80,
    height: 80,
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray2,
    borderRadius: 40,

    borderColor: COLORS.gray,
  }, // Giữ nguyên marginTop 80 nếu bạn muốn
  recordingActive: {backgroundColor: COLORS.red, borderColor: COLORS.red},
  recordIcon: {width: 40, height: 40},
  skipTextTouchable: {marginTop: 0},
  skipText: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  feedbackTextContainer: {
    minHeight: SIZES.padding * 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
  },
  statusText: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  recognizedTextPreview: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recognizedText: {
    fontSize: SIZES.medium,
    color: COLORS.black,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.medium,
    color: COLORS.red,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default React.memo(PronunciationLessonContent);
