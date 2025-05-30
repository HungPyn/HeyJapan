// src/components/lesson_types/AudioChoiceLessonContent.tsx
import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme';
import {MappedContentItem, Option} from '../ContentsScreen';

interface AudioChoiceLessonContentProps {
  item: MappedContentItem;
  userSelectedOptionId: string | null;
  showAnswerFeedback: boolean | null;
  isInteractionDisabled: boolean;
  onPlaySound: (audioUrl: string | null) => void;
  onOptionSelect: (optionId: string) => void;
}

const AudioChoiceLessonContent: React.FC<AudioChoiceLessonContentProps> = ({
  item,
  userSelectedOptionId,
  showAnswerFeedback,
  isInteractionDisabled,
  onPlaySound,
  onOptionSelect,
}) => {
  const optionsToDisplay: Option[] = item.options || [];
  const questionTitle = item.title || 'Nghe và chọn đáp án';

  return (
    <View style={styles.contentCard}>
      <View style={styles.contentCardQuestion}>
        <View style={styles.questionSelectContainer}>
          {item.audio_url && (
            <TouchableOpacity
              onPress={() => onPlaySound(item.audio_url)}
              style={styles.questionAudioButtonSelect}>
              <Image
                source={require('../../../assets/images/audioInconten.png')}
                style={styles.audioIconSmall}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <Text style={styles.contentDetailSelect}>{questionTitle}</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {optionsToDisplay.map(option => {
          const isSelected = userSelectedOptionId === option.id;
          const isCorrectOption = item.correct_answer === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                // Logic style giống hệt như trong ContentsScreen.tsx gốc
                isSelected &&
                  showAnswerFeedback === null &&
                  styles.selectedOption,
                showAnswerFeedback === true &&
                  isCorrectOption &&
                  styles.correctOption, // Khi câu trả lời của người dùng là ĐÚNG
                showAnswerFeedback === false &&
                  isSelected &&
                  styles.incorrectOption, // Lựa chọn SAI của người dùng
                showAnswerFeedback === false &&
                  isCorrectOption &&
                  styles.correctOption, // Hiển thị ĐÁP ÁN ĐÚNG (nếu người dùng chọn sai)
              ]}
              onPress={() => {
                onOptionSelect(option.id);
                if (option.audioUrl && onPlaySound) {
                  onPlaySound(option.audioUrl);
                }
              }}
              disabled={isInteractionDisabled}>
              <View style={{flexDirection: 'column', alignItems: 'center'}}>
                <Text
                  style={[
                    styles.optionText,
                    // Logic style cho text giống hệt như trong ContentsScreen.tsx gốc
                    showAnswerFeedback === true &&
                      isCorrectOption &&
                      styles.correctOptionText,
                    showAnswerFeedback === false &&
                      isSelected &&
                      !isCorrectOption &&
                      styles.incorrectOptionText,
                    showAnswerFeedback === false &&
                      isCorrectOption &&
                      styles.correctOptionText,
                  ]}>
                  {option.text}
                </Text>
                {option.textRomaji && (
                  <Text
                    style={[
                      styles.optionTextRomaji,
                      // Logic style cho romaji giống hệt như trong ContentsScreen.tsx gốc
                      showAnswerFeedback !== null && isCorrectOption
                        ? styles.correctOptionText
                        : {},
                      showAnswerFeedback !== null &&
                      isSelected &&
                      !isCorrectOption
                        ? styles.incorrectOptionText
                        : {},
                    ]}>
                    ({option.textRomaji})
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Styles giữ nguyên như đã cung cấp ở lần trước (đã copy từ ContentsScreen)
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
  questionSelectContainer: {flexDirection: 'row', alignItems: 'center'},
  questionAudioButtonSelect: {marginRight: SIZES.base},
  audioIconSmall: {width: 30, height: 30},
  contentDetailSelect: {
    fontFamily: FONTS.bold?.fontFamily,
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: 'left',
    flex: 1,
  },
  optionsContainer: {marginTop: SIZES.padding},
  optionButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.9,
    borderRadius: SIZES.radius,
    marginVertical: SIZES.base * 0.6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.lightPrimary || 'rgba(0,122,255,0.1)',
  },
  correctOption: {
    backgroundColor: COLORS.lightGreen || 'rgba(40,167,69,0.15)',
    borderColor: COLORS.green || '#28A745',
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: COLORS.lightRed || 'rgba(220,53,69,0.1)',
    borderColor: COLORS.red || '#DC3545',
    borderWidth: 2,
  },
  optionText: {
    fontFamily: FONTS.medium?.fontFamily,
    fontSize: SIZES.font,
    color: COLORS.text,
    textAlign: 'center',
    flexShrink: 1,
  },
  correctOptionText: {color: COLORS.darkGreen || '#155724', fontWeight: 'bold'},
  incorrectOptionText: {color: COLORS.darkRed || '#721C24', fontWeight: 'bold'},
  optionTextRomaji: {
    fontFamily: FONTS.regular?.fontFamily,
    fontSize: SIZES.font * 0.8,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default AudioChoiceLessonContent;
