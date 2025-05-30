// src/components/lesson_types/SelectLessonContent.tsx
import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme'; // Giữ nguyên đường dẫn này
// Sử dụng đường dẫn import giống như AudioChoiceLessonContent.tsx bạn cung cấp
import {MappedContentItem, Option} from '../ContentsScreen';

interface SelectLessonContentProps {
  item: MappedContentItem;
  userSelectedOptionId: string | null;
  showAnswerFeedback: boolean | null;
  isInteractionDisabled: boolean;
  onPlaySound?: (audioUrl: string | null) => void;
  onOptionSelect: (optionId: string) => void;
}

const SelectLessonContent: React.FC<SelectLessonContentProps> = ({
  item,
  userSelectedOptionId,
  showAnswerFeedback,
  isInteractionDisabled,
  onPlaySound,
  onOptionSelect,
}) => {
  // optionsToDisplay sẽ là Option[] nếu item.options tồn tại, hoặc [] nếu không.
  // TypeScript nên tự suy luận kiểu cho 'option' trong .map() nếu Option được import đúng.
  const optionsToDisplay = item.options || [];

  // Xây dựng đề bài cho loại 'select'
  let questionDisplay = item.title || 'Chọn đáp án đúng';
  // Logic nối thêm content_detail cho loại 'select' nếu có và khác title
  if (item.content_detail && item.content_detail !== item.title) {
    questionDisplay += `: "${item.content_detail}"`;
  }

  return (
    <View style={styles.contentCard}>
      <View style={styles.contentCardQuestion}>
        <View style={styles.questionSelectContainer}>
          {/* MULTIPLE_CHOICE_TEXT_ONLY thường không có item.audio_url cho câu hỏi,
              nhưng nếu có thì vẫn hiển thị */}
          {item.audio_url && onPlaySound && (
            <TouchableOpacity
              onPress={() => onPlaySound(item.audio_url)}
              style={styles.questionAudioButtonSelect}>
              <Image
                source={require('../../../assets/images/audioInconten.png')} // Đảm bảo đường dẫn đúng
                style={styles.audioIconSmall}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <Text style={styles.contentDetailSelect}>{questionDisplay}</Text>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {optionsToDisplay.map(option => {
          // TypeScript sẽ tự suy luận 'option' là kiểu Option
          const isSelected = userSelectedOptionId === option.id;
          const isCorrectOption = item.correct_answer === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                // ---- SAO CHÉP LOGIC STYLE TỪ AudioChoiceLessonContent ----
                isSelected &&
                  showAnswerFeedback === null &&
                  styles.selectedOption,
                showAnswerFeedback === true &&
                  isCorrectOption &&
                  styles.correctOption,
                showAnswerFeedback === false &&
                  isSelected &&
                  styles.incorrectOption,
                showAnswerFeedback === false &&
                  isCorrectOption &&
                  styles.correctOption,
                // ---- KẾT THÚC SAO CHÉP ----
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
                    // ---- SAO CHÉP LOGIC STYLE TỪ AudioChoiceLessonContent ----
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
                    // ---- KẾT THÚC SAO CHÉP ----
                  ]}>
                  {option.text}
                </Text>
                {option.textRomaji && (
                  <Text
                    style={[
                      styles.optionTextRomaji,
                      // ---- SAO CHÉP LOGIC STYLE TỪ AudioChoiceLessonContent ----
                      showAnswerFeedback !== null && isCorrectOption
                        ? styles.correctOptionText
                        : {},
                      showAnswerFeedback !== null &&
                      isSelected &&
                      !isCorrectOption
                        ? styles.incorrectOptionText
                        : {},
                      // ---- KẾT THÚC SAO CHÉP ----
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

// Styles giống hệt như AudioChoiceLessonContent.tsx
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

export default SelectLessonContent;
