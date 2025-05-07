// src/screens/tools/FlashcardsScreen.tsx
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import CustomButton from '../../components/common/CustomButton';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Mock data cho thẻ ghi nhớ
const mockFlashcards = [
  {
    id: '1',
    japanese: '日本語',
    furigana: 'にほんご',
    vietnamese: 'Tiếng Nhật',
    example: '日本語を勉強しています。',
    exampleTranslation: 'Tôi đang học tiếng Nhật.',
  },
  {
    id: '2',
    japanese: '勉強する',
    furigana: 'べんきょうする',
    vietnamese: 'Học tập',
    example: '毎日勉強しています。',
    exampleTranslation: 'Tôi học tập mỗi ngày.',
  },
  {
    id: '3',
    japanese: '先生',
    furigana: 'せんせい',
    vietnamese: 'Giáo viên',
    example: '彼は日本語の先生です。',
    exampleTranslation: 'Anh ấy là giáo viên tiếng Nhật.',
  },
  {
    id: '4',
    japanese: '学生',
    furigana: 'がくせい',
    vietnamese: 'Học sinh, sinh viên',
    example: '私は大学の学生です。',
    exampleTranslation: 'Tôi là sinh viên đại học.',
  },
  {
    id: '5',
    japanese: '友達',
    furigana: 'ともだち',
    vietnamese: 'Bạn bè',
    example: '彼は私の友達です。',
    exampleTranslation: 'Anh ấy là bạn của tôi.',
  },
];

// Tạo mock học phần
const mockSets = [
  {id: '1', title: 'Các từ cơ bản', count: 20, progress: 65},
  {id: '2', title: 'Học phần N5 - Bài 1', count: 15, progress: 30},
  {id: '3', title: 'Từ vựng về gia đình', count: 12, progress: 100},
  {id: '4', title: 'Động từ thông dụng', count: 25, progress: 0},
];

const FlashcardsScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'sets' | 'cards'>('sets');
  const [selectedSet, setSelectedSet] = useState<null | string>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < mockFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      // Reset card to front side when changing cards
      if (isFlipped) {
        handleFlip();
      }
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      // Reset card to front side when changing cards
      if (isFlipped) {
        handleFlip();
      }
    }
  };

  const startSet = (setId: string) => {
    setSelectedSet(setId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    setViewMode('cards');
  };

  const backToSets = () => {
    setViewMode('sets');
    setSelectedSet(null);
  };

  // Front and back transforms
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Create card styling with transforms
  const frontAnimatedStyle = {
    transform: [{rotateY: frontInterpolate}],
  };

  const backAnimatedStyle = {
    transform: [{rotateY: backInterpolate}],
  };

  const renderSetsView = () => (
    <ScrollView contentContainerStyle={styles.setsContainer}>
      <Text style={styles.setsHeader}>Học phần của bạn</Text>

      {mockSets.map(set => (
        <TouchableOpacity
          key={set.id}
          style={styles.setCard}
          onPress={() => startSet(set.id)}>
          <View style={styles.setCardContent}>
            <Text style={styles.setTitle}>{set.title}</Text>
            <View style={styles.setInfo}>
              <Text style={styles.setCount}>{set.count} từ</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[styles.progressBar, {width: `${set.progress}%`}]}
                  />
                </View>
                <Text style={styles.progressText}>{set.progress}%</Text>
              </View>
            </View>
          </View>
          <Text style={styles.setArrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addSetButton}>
        <Text style={styles.addSetButtonIcon}>+</Text>
        <Text style={styles.addSetButtonText}>Thêm học phần mới</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCardsView = () => {
    if (mockFlashcards.length === 0) {
      return (
        <View style={styles.noCardsContainer}>
          <Text style={styles.noCardsText}>Chưa có thẻ ghi nhớ nào</Text>
          <CustomButton
            title="Quay lại"
            onPress={backToSets}
            type="primary"
            style={{marginTop: 20}}
          />
        </View>
      );
    }

    const currentCard = mockFlashcards[currentCardIndex];

    return (
      <View style={styles.cardsContainer}>
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={backToSets} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'‹ Quay lại'}</Text>
          </TouchableOpacity>
          <Text style={styles.cardCounter}>
            {currentCardIndex + 1} / {mockFlashcards.length}
          </Text>
        </View>

        <View style={styles.flashcardContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleFlip}>
            {/* Front of the card */}
            <Animated.View
              style={[
                styles.card,
                frontAnimatedStyle,
                {zIndex: isFlipped ? 0 : 1, opacity: isFlipped ? 0 : 1},
              ]}>
              <Text style={styles.cardInstructionText}>Nhấn để lật thẻ</Text>
              <Text style={styles.cardJapanese}>{currentCard.japanese}</Text>
              <Text style={styles.cardFurigana}>{currentCard.furigana}</Text>
            </Animated.View>

            {/* Back of the card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                backAnimatedStyle,
                {zIndex: isFlipped ? 1 : 0, opacity: isFlipped ? 1 : 0},
              ]}>
              <Text style={styles.cardInstructionText}>Nhấn để lật thẻ</Text>
              <Text style={styles.cardVietnamese}>
                {currentCard.vietnamese}
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Ví dụ:</Text>
                <Text style={styles.exampleJapanese}>
                  {currentCard.example}
                </Text>
                <Text style={styles.exampleVietnamese}>
                  {currentCard.exampleTranslation}
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              currentCardIndex === 0 && styles.disabledButton,
            ]}
            onPress={handlePrevCard}
            disabled={currentCardIndex === 0}>
            <Text style={styles.controlButtonText}>‹ Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              currentCardIndex === mockFlashcards.length - 1 &&
                styles.disabledButton,
            ]}
            onPress={handleNextCard}
            disabled={currentCardIndex === mockFlashcards.length - 1}>
            <Text style={styles.controlButtonText}>Tiếp ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.difficultyButton, styles.hardButton]}>
            <Text style={styles.difficultyButtonText}>Khó</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, styles.mediumButton]}>
            <Text style={styles.difficultyButtonText}>Trung bình</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyButton, styles.easyButton]}>
            <Text style={styles.difficultyButtonText}>Dễ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thẻ ghi nhớ</Text>
      </View>

      {viewMode === 'sets' ? renderSetsView() : renderCardsView()}
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
  // Sets View Styles
  setsContainer: {
    padding: SIZES.padding,
  },
  setsHeader: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 20,
  },
  setCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  setCardContent: {
    flex: 1,
  },
  setTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 10,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setCount: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    width: 100,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.medium,
    fontSize: SIZES.xSmall,
    color: COLORS.primary,
  },
  setArrow: {
    ...FONTS.regular,
    fontSize: SIZES.xxxLarge,
    color: COLORS.textLight,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginTop: 10,
  },
  addSetButtonIcon: {
    fontSize: 20,
    color: COLORS.primary,
    marginRight: 8,
  },
  addSetButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  // Cards View Styles
  noCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  noCardsText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  cardCounter: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  flashcardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 320,
  },
  card: {
    width: CARD_WIDTH,
    height: 300,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    ...SHADOWS.medium,
    position: 'absolute',
  },
  cardBack: {
    backgroundColor: COLORS.white,
  },
  cardInstructionText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  cardJapanese: {
    ...FONTS.bold,
    fontSize: 40,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  cardFurigana: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  cardVietnamese: {
    ...FONTS.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.primary,
    marginBottom: 25,
    textAlign: 'center',
  },
  exampleContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
  },
  exampleTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  exampleJapanese: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 5,
  },
  exampleVietnamese: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius,
    marginHorizontal: 5,
  },
  hardButton: {
    backgroundColor: COLORS.error,
  },
  mediumButton: {
    backgroundColor: COLORS.warning,
  },
  easyButton: {
    backgroundColor: COLORS.success,
  },
  difficultyButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
});

export default FlashcardsScreen;
