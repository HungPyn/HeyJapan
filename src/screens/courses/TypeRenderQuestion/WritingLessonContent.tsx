// src/screens/HandwritingScreen.tsx
import React, {useRef, useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  SafeAreaView,
  Platform,
  TextStyle,
  TouchableOpacity, // Import TouchableOpacity để dùng cho nút Bỏ qua
} from 'react-native';
import {Svg, Path} from 'react-native-svg';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from 'react-native-gesture-handler';
import {
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
  MD3Theme,
} from 'react-native-paper';
import {runOnJS} from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Vẫn có thể xóa nếu không dùng trực tiếp và App.tsx đã có

const {width: screenWidth} = Dimensions.get('window');
const CANVAS_HEIGHT = 300;
const DEFAULT_STROKE_WIDTH = 5;
const DEFAULT_STROKE_COLOR = '#000000';
const CORRECT_COLOR = '#4CAF50';
const INCORRECT_COLOR = '#F44336';

// Thêm interface cho props của HandwritingScreen
interface HandwritingScreenProps {
  onSkip: () => void;
  onAttempt: (isCorrect: boolean) => void;
  // item: MappedContentItem; // Nếu màn hình này cũng cần item để hiển thị chữ cái mục tiêu từ API
}

interface SampleCharacter {
  /* ... */ char: string;
  name: string;
  strokeOrderHint: string;
}
interface RecognitionResult {
  /* ... */ char: string;
  accuracy: number;
  error?: string;
}
const sampleCharacters: SampleCharacter[] = [
  /* ... */ {
    char: 'あ',
    name: 'Hiragana A',
    strokeOrderHint: 'Ngang, dọc cong, móc',
  },
  {char: 'い', name: 'Hiragana I', strokeOrderHint: 'Nét trên, nét dưới'},
  {char: 'う', name: 'Hiragana U', strokeOrderHint: 'Nét chấm, nét cong'},
  {
    char: 'え',
    name: 'Hiragana E',
    strokeOrderHint: 'Nét chấm, nét chữ Z cách điệu',
  },
  {
    char: 'お',
    name: 'Hiragana O',
    strokeOrderHint: 'Ngang, dọc xuống, cong tròn, chấm',
  },
  {char: 'カ', name: 'Katakana Ka', strokeOrderHint: 'Ngang cong, phẩy'},
  {
    char: '火',
    name: 'Kanji Hi (Lửa)',
    strokeOrderHint: 'Phẩy trái, phẩy phải, phẩy giữa, chấm',
  },
];
const japaneseFont =
  Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'NotoSansJP-Regular';

// Cập nhật FC để nhận props
const HandwritingScreen: React.FC<HandwritingScreenProps> = ({
  onSkip,
  onAttempt,
  // item, // Nếu có
}) => {
  const paperTheme = useTheme<MD3Theme>();
  const [paths, setPaths] = useState<string[]>([]);
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH);
  const [currentPathForSVG, setCurrentPathForSVG] = useState<string[]>([]);
  const activePathPoints = useRef<string[]>([]);

  const [charIndex, setCharIndex] = useState<number>(0);
  const currentTargetCharacter: SampleCharacter = sampleCharacters[charIndex];

  const [recognitionResult, setRecognitionResult] =
    useState<RecognitionResult | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackColor, setFeedbackColor] = useState<string>(
    paperTheme.colors.onSurface,
  );
  const [showStrokeOrder, setShowStrokeOrder] = useState<boolean>(false);

  // Định nghĩa hàm log ổn định
  const log = useCallback((label: string, ...args: any[]) => {
    console.log(`[HandwritingScreen] ${label}`, ...args);
  }, []);
  const stableSetCurrentPathForSVG = setCurrentPathForSVG;
  const stableSetFeedbackMessage = setFeedbackMessage;
  const stableSetRecognitionResult = setRecognitionResult;
  const stableSetPaths = setPaths;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onStart(
          (g: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
            'worklet';
            const newPathPart = `M${g.x.toFixed(0)},${g.y.toFixed(0)}`;
            activePathPoints.current = [newPathPart];
            runOnJS(stableSetCurrentPathForSVG)([...activePathPoints.current]);
            runOnJS(log)('onStart', 'Ref after set:', [
              ...activePathPoints.current,
            ]);
          },
        )
        .onUpdate((g: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
          'worklet';
          const currentLength = activePathPoints.current.length;
          runOnJS(log)('onUpdate', `Ref length: ${currentLength}`);

          if (currentLength > 0) {
            const newPathPart = `L${g.x.toFixed(0)},${g.y.toFixed(0)}`;
            activePathPoints.current.push(newPathPart);
            runOnJS(stableSetCurrentPathForSVG)([...activePathPoints.current]);
          } else {
            runOnJS(log)('onUpdate', 'Ref is unexpectedly EMPTY!');
          }
        })
        .onEnd(() => {
          'worklet';
          const currentLength = activePathPoints.current.length;
          runOnJS(log)('onEnd', `Ref length: ${currentLength}`);

          if (currentLength > 0) {
            const finalPath = activePathPoints.current.join(' ');
            runOnJS(stableSetPaths)(prev => [...prev, finalPath]);
            activePathPoints.current = [];
            runOnJS(stableSetCurrentPathForSVG)([]);
          } else {
            runOnJS(log)('onEnd', 'Ref was empty, no path added.');
          }
        })
        .minDistance(1),
    [
      log,
      stableSetCurrentPathForSVG,
      stableSetFeedbackMessage, // Giữ lại vì nó được dùng trong `handleCheck` gọi thông qua `runOnJS`
      stableSetRecognitionResult, // Giữ lại vì nó được dùng trong `handleCheck` gọi thông qua `runOnJS`
      stableSetPaths,
    ],
  );

  const handleClear = () => {
    log('handleClear', 'Clearing all paths and current drawing.');
    setPaths([]);
    setCurrentPathForSVG([]);
    activePathPoints.current = [];
    setRecognitionResult(null);
    setFeedbackMessage('');
  };

  const mockRecognizeHandwriting = async (
    drawnPaths: string[],
  ): Promise<RecognitionResult> => {
    log('mockRecognizeHandwriting', 'Paths received:', drawnPaths);
    if (drawnPaths.length === 0) {
      return {
        char: '',
        accuracy: 0,
        error: 'Vui lòng vẽ chữ trước khi kiểm tra.',
      };
    }
    await new Promise<void>(resolve => setTimeout(resolve, 700));
    const randomFactor = Math.random();
    if (randomFactor < 0.05) {
      return {
        char: '',
        accuracy: 0,
        error: 'Không thể kết nối máy chủ nhận diện.',
      };
    }
    if (randomFactor < 0.65) {
      return {
        char: currentTargetCharacter.char,
        accuracy: Math.random() * 0.2 + 0.8,
      };
    } else if (randomFactor < 0.9) {
      const otherChars = sampleCharacters.filter(
        c => c.char !== currentTargetCharacter.char,
      );
      const similarChar =
        otherChars.length > 0
          ? otherChars[Math.floor(Math.random() * otherChars.length)].char
          : 'X';
      return {char: similarChar, accuracy: Math.random() * 0.3 + 0.4};
    } else {
      return {char: '?', accuracy: Math.random() * 0.4};
    }
  };

  const handleCheck = async () => {
    log('handleCheck', 'Check button pressed.');
    if (paths.length === 0) {
      log('handleCheck', 'No completed paths to check.');
      setFeedbackMessage('Bạn chưa hoàn thành nét vẽ nào để kiểm tra!');
      setFeedbackColor(INCORRECT_COLOR);
      if (onAttempt) {
        // Gọi onAttempt nếu không có nét vẽ
        onAttempt(false);
      }
      return;
    }
    log('handleCheck', 'Paths to check:', paths);
    setFeedbackMessage('Đang kiểm tra...');
    setFeedbackColor(paperTheme.colors.onSurface);
    const result = await mockRecognizeHandwriting(paths);
    log('handleCheck', 'Recognition result:', result);

    setRecognitionResult(result);
    let isCorrectAttempt = false; // Biến để lưu trạng thái đúng/sai

    if (result.error) {
      setFeedbackMessage(result.error);
      setFeedbackColor(INCORRECT_COLOR);
      isCorrectAttempt = false; // Lỗi thì không đúng
    } else if (result.char === currentTargetCharacter.char) {
      setFeedbackMessage('Chính xác!');
      setFeedbackColor(CORRECT_COLOR);
      isCorrectAttempt = true; // Đúng
      setTimeout(() => {
        handleClear();
        setCharIndex(prevIndex => (prevIndex + 1) % sampleCharacters.length);
        setFeedbackMessage('');
      }, 1500);
    } else {
      setFeedbackMessage(
        `Sai, thử lại! (Nhận diện: ${result.char || 'Không rõ'})`,
      );
      setFeedbackColor(INCORRECT_COLOR);
      isCorrectAttempt = false; // Sai
    }

    // GỌI onAttempt SAU KHI XÁC ĐỊNH ĐƯỢC KẾT QUẢ
    if (onAttempt) {
      onAttempt(isCorrectAttempt);
    }
  };

  const toggleStrokeOrder = () => {
    log('toggleStrokeOrder', 'Toggling stroke order visibility.');
    setShowStrokeOrder(prev => !prev);
  };

  const textStyleWithJapaneseFont: TextStyle = {fontFamily: japaneseFont};
  const currentDrawingStrokeColor = DEFAULT_STROKE_COLOR;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {backgroundColor: paperTheme.colors.background},
      ]}>
      <Card style={[styles.card, {backgroundColor: paperTheme.colors.surface}]}>
        <Card.Content>
          <Title
            style={[
              styles.title,
              textStyleWithJapaneseFont,
              {color: paperTheme.colors.onSurface},
            ]}>
            Viết chữ: {currentTargetCharacter.char} (
            {currentTargetCharacter.name})
          </Title>
          {showStrokeOrder && (
            <Paragraph
              style={[
                styles.strokeOrderHint,
                textStyleWithJapaneseFont,
                {color: paperTheme.colors.onSurfaceVariant},
              ]}>
              Thứ tự nét: {currentTargetCharacter.strokeOrderHint}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      <GestureDetector gesture={pan}>
        <View style={styles.canvasContainer}>
          <Svg height="100%" width="100%">
            {paths.map((pathData, index) => (
              <Path
                key={`path-${index}`}
                d={pathData}
                stroke={currentDrawingStrokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPathForSVG.length > 0 && (
              <Path
                d={currentPathForSVG.join(' ')}
                stroke={currentDrawingStrokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </GestureDetector>

      <View style={styles.controls}>
        <Button
          icon="refresh"
          mode="outlined"
          onPress={handleClear}
          style={styles.button}>
          Xóa
        </Button>
        <Button
          icon="spellcheck"
          mode="contained"
          onPress={handleCheck}
          style={styles.button}>
          Kiểm tra
        </Button>
      </View>
      {/* View bao bọc nút Hiện/Ẩn gợi ý và nút Bỏ qua để chúng nằm ngang */}
      <View style={styles.controls}>
        {/* Sử dụng lại styles.controls để chúng nằm ngang */}
        <Button
          icon={showStrokeOrder ? 'eye-off-outline' : 'eye-outline'}
          mode="outlined"
          onPress={toggleStrokeOrder}
          style={styles.button}>
          {showStrokeOrder ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
        </Button>
        {/* Nút Bỏ qua */}
        <TouchableOpacity
          onPress={onSkip} // Gọi prop onSkip nhận được từ trên xuống
          style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {feedbackMessage ? (
        <Text
          style={[
            styles.feedbackText,
            {color: feedbackColor},
            textStyleWithJapaneseFont,
          ]}>
          {feedbackMessage}
        </Text>
      ) : null}
      {recognitionResult?.char && recognitionResult.char !== '?' && (
        <Text
          style={[
            styles.recognitionText,
            textStyleWithJapaneseFont,
            {color: paperTheme.colors.onSurfaceVariant},
          ]}>
          Nhận diện: {recognitionResult.char} (Độ chính xác:
          {(recognitionResult.accuracy * 100).toFixed(1)}%)
        </Text>
      )}
      <View style={styles.customizationSection}>
        <Text
          style={[
            textStyleWithJapaneseFont,
            {color: paperTheme.colors.onSurfaceVariant},
          ]}>
          Độ dày nét: {strokeWidth}px
        </Text>
        <View style={styles.sliderContainer}>
          <Button onPress={() => setStrokeWidth(prev => Math.max(1, prev - 1))}>
            -
          </Button>
          <Text
            style={{
              color: paperTheme.colors.onSurfaceVariant,
              marginHorizontal: 10,
            }}>
            {strokeWidth}
          </Text>
          <Button
            onPress={() => setStrokeWidth(prev => Math.min(20, prev + 1))}>
            +
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1},
  card: {margin: 10, elevation: 2},
  title: {
    textAlign: 'center',
    fontSize: 28,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  strokeOrderHint: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  canvasContainer: {
    height: CANVAS_HEIGHT,
    width: screenWidth - 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignSelf: 'center',
    marginVertical: 15,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  button: {marginHorizontal: 5, flex: 1},
  feedbackText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recognitionText: {textAlign: 'center', fontSize: 16, marginVertical: 5},
  customizationSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  // Thêm styles cho nút bỏ qua
  skipButton: {
    // Sử dụng flex: 1 để nó chia không gian ngang với nút "Hiện/Ẩn gợi ý"
    flex: 1,
    marginHorizontal: 5, // Khoảng cách với các nút khác
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Màu nền nhẹ (tương tự paperTheme.colors.surfaceVariant)
    justifyContent: 'center', // Căn giữa nội dung Text
    alignItems: 'center', // Căn giữa nội dung Text
  },
  skipButtonText: {
    // Để giữ nguyên phong cách như PronunciationLessonContent, có thể cần điều chỉnh font/size
    // theo COLORS, FONTS, SIZES nếu bạn muốn. Ở đây, tôi giữ style tối giản.
    fontSize: 14, // Slightly smaller than default button text, similar to original skipText
    color: '#666', // Màu xám đậm hơn một chút
    textDecorationLine: 'underline', // Gạch chân giống như PronunciationLessonContent
    fontFamily: japaneseFont, // Đảm bảo dùng đúng font
  },
});

export default HandwritingScreen;
