// src/screens/lessons/TypeRenderQuestion/WordOrderLessonContent.tsx
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme';
import {MappedContentItem, Option} from '../ContentsScreen';

interface WordOrderLessonContentProps {
  item: MappedContentItem;
  showAnswerFeedback: boolean | null;
  isInteractionDisabled: boolean;
  onPlaySound?: (audioUrl: string | null) => void;
  onArrangementChange?: (count: number) => void; // PROP MỚI: Thông báo số lượng từ đã sắp xếp
}

export interface WordOrderLessonContentRef {
  getUserAnswerString: () => string;
  getArrangedWordsCount: () => number; // Vẫn giữ lại để có thể gọi trực tiếp nếu cần
}

const WordOrderLessonContent = forwardRef<
  WordOrderLessonContentRef,
  WordOrderLessonContentProps
>(
  (
    {
      item,
      showAnswerFeedback,
      isInteractionDisabled,
      onPlaySound,
      onArrangementChange,
    }, // Nhận prop mới
    ref,
  ) => {
    const [arrangedWords, setArrangedWords] = useState<Option[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<Option[]>([]);

    useEffect(() => {
      const newOptions = item.options
        ? [...item.options].sort(() => Math.random() - 0.5)
        : [];
      setShuffledOptions(newOptions);
      setArrangedWords([]);
      if (onArrangementChange) {
        // Thông báo khi reset
        onArrangementChange(0);
      }
    }, [item.options, item.content_code]); // Giữ nguyên dependencies

    useImperativeHandle(ref, () => ({
      getUserAnswerString: () => arrangedWords.map(word => word.text).join(' '),
      getArrangedWordsCount: () => arrangedWords.length,
    }));

    const handleWordBankPressInternal = (wordOption: Option) => {
      if (isInteractionDisabled) return;
      if (!arrangedWords.find(w => w.id === wordOption.id)) {
        const newArrangement = [...arrangedWords, wordOption];
        setArrangedWords(newArrangement);
        if (onArrangementChange) {
          // Gọi callback
          onArrangementChange(newArrangement.length);
        }
        if (wordOption.audioUrl && onPlaySound) {
          onPlaySound(wordOption.audioUrl);
        }
      }
    };

    const handleArrangedWordPressInternal = (wordOptionToRemove: Option) => {
      if (isInteractionDisabled) return;
      const newArrangement = arrangedWords.filter(
        word => word.id !== wordOptionToRemove.id,
      );
      setArrangedWords(newArrangement);
      if (onArrangementChange) {
        // Gọi callback
        onArrangementChange(newArrangement.length);
      }
    };

    return (
      // JSX giữ nguyên như phiên bản trước bạn gửi, không thay đổi gì ở đây
      <View style={styles.contentCard}>
        <View style={styles.contentCardQuestion}>
          <View style={styles.originalSentenceContainer}>
            {item.audio_url && onPlaySound && (
              <TouchableOpacity
                onPress={() => onPlaySound(item.audio_url)}
                style={styles.questionAudioButton}>
                <Image
                  source={require('../../../assets/images/audioInconten.png')}
                  style={styles.audioIconSmall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {showAnswerFeedback !== null && item.correct_answer_foreign ? (
              <Text style={styles.contentDetailXapXep_Answered}>
                {item.correct_answer_foreign}
                {item.correct_answer_romaji
                  ? ` (${item.correct_answer_romaji})`
                  : ''}
              </Text>
            ) : (
              <Text style={styles.contentDetailXapXep}>
                {'Sắp xếp các khối từ bên dưới thành câu có nghĩa'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.wordArrangeDropArea}>
          {arrangedWords.length > 0 ? (
            arrangedWords.map((word, index) => {
              let wordStyle = {};
              if (showAnswerFeedback === true) {
                wordStyle = styles.correctWordBackground;
              } else if (showAnswerFeedback === false) {
                wordStyle = styles.incorrectWordBackground;
              }
              return (
                <TouchableOpacity
                  key={`${word.id}_arranged_${index}`}
                  style={[
                    styles.wordBankItem,
                    styles.arrangedWordItem,
                    wordStyle,
                  ]}
                  onPress={() => handleArrangedWordPressInternal(word)}
                  disabled={isInteractionDisabled}>
                  <Text style={[styles.wordBankText, styles.arrangedWordText]}>
                    {word.text}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.arrangedTextPlaceholder}>
              ______________________________
            </Text>
          )}
        </View>

        <View style={styles.wordBankContainer}>
          {shuffledOptions.map(wordOption => {
            const isWordAlreadyArranged = arrangedWords.find(
              w => w.id === wordOption.id,
            );
            return (
              <TouchableOpacity
                key={wordOption.id}
                style={[
                  styles.wordBankItem,
                  isWordAlreadyArranged
                    ? styles.wordBankItemSelectedAndUsed
                    : {},
                  isInteractionDisabled ? styles.disabledWordBankItem : {},
                ]}
                onPress={() => handleWordBankPressInternal(wordOption)}
                disabled={!!isWordAlreadyArranged || isInteractionDisabled}>
                <Text style={styles.wordBankText}>{wordOption.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  },
);
// Styles giữ nguyên
const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  contentCardQuestion: {
    backgroundColor: COLORS.nenItem || COLORS.white,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
  },
  contentTitleSelect: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  originalSentenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  questionAudioButton: {marginRight: SIZES.base},
  audioIconSmall: {width: 30, height: 30},
  contentDetailXapXep_Answered: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font * 1.1,
    color: COLORS.black,
    flex: 1,
    lineHeight: SIZES.font * 1.5,
    fontWeight: '500',
  },
  contentDetailXapXep: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font * 1.1,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: SIZES.font * 1.5,
  },
  wordArrangeDropArea: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'flex-start',
  },
  correctWordBackground: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.darkGreen,
  },
  incorrectWordBackground: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.darkRed,
  },
  wordBankItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding * 0.8,
    paddingVertical: SIZES.padding * 0.6,
    borderRadius: SIZES.radius,
    margin: SIZES.base * 0.4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  arrangedWordItem: {backgroundColor: COLORS.primary},
  wordBankText: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  arrangedWordText: {color: COLORS.white, fontWeight: '500'},
  arrangedTextPlaceholder: {
    fontFamily: FONTS.regular?.fontFamily,
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    flex: 1,
    textAlign: 'center',
    lineHeight: 50,
  },
  wordBankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SIZES.padding * 0.5,
    minHeight: 60,
  },
  wordBankItemSelectedAndUsed: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.gray,
    opacity: 0.3,
  },
  disabledWordBankItem: {opacity: 0.3},
});

export default React.memo(WordOrderLessonContent); // Bọc React.memo ở đây
