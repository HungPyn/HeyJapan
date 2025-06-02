// src/components/lesson_types/SelectImageLessonContent.tsx
import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme'; // Đảm bảo đường dẫn đúng
import {MappedContentItem, Option} from '../ContentsScreen'; // Sử dụng đường dẫn import như bạn đã cung cấp cho AudioChoice

interface SelectImageLessonContentProps {
  item: MappedContentItem;
  userSelectedOptionId: string | null;
  showAnswerFeedback: boolean | null;
  isInteractionDisabled: boolean;
  onPlaySound?: (audioUrl: string | null) => void; // Cho audio của câu hỏi
  onOptionSelect: (optionId: string) => void;
}

const SelectImageLessonContent: React.FC<SelectImageLessonContentProps> = ({
  item,
  userSelectedOptionId,
  showAnswerFeedback,
  isInteractionDisabled,
  onPlaySound,
  onOptionSelect,
}) => {
  const optionsToDisplay: Option[] = item.options || [];

  // Xây dựng đề bài, giữ nguyên logic từ ContentsScreen gốc
  const questionTitlePart =
    (item.title ? item.title + ': ' : '') || 'Chọn hình ảnh đúng';
  const fullQuestionText = questionTitlePart + (item.content_detail || '');

  return (
    <View style={styles.contentCard}>
      <View style={styles.contentCardQuestion}>
        <View style={styles.questionSelectContainer}>
          <Text style={styles.contentDetailSelect}>{fullQuestionText}</Text>
        </View>
      </View>

      <View style={styles.imageOptionsContainer}>
        {optionsToDisplay.map((option: Option) => {
          const isSelected = userSelectedOptionId === option.id;
          const isCorrectOption = item.correct_answer === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.imageOptionButton,
                isSelected &&
                  showAnswerFeedback === null &&
                  styles.selectedImageOption,
                showAnswerFeedback === true &&
                  isCorrectOption &&
                  styles.correctImageOption,
                showAnswerFeedback === false &&
                  isSelected &&
                  styles.incorrectImageOption,
                showAnswerFeedback === false &&
                  isCorrectOption &&
                  styles.correctImageOption,
              ]}
              onPress={() => {
                onOptionSelect(option.id);
                // Loại này thường không có audio cho từng option hình ảnh,
                // nhưng nếu có (option.audioUrl) thì có thể gọi onPlaySound ở đây
                if (option.audioUrl && onPlaySound) {
                  onPlaySound(option.audioUrl);
                }
              }}
              disabled={isInteractionDisabled}>
              {option.imageUrl && (
                <Image
                  source={{uri: option.imageUrl}}
                  style={styles.optionImage}
                  resizeMode="cover" // Giữ "cover" như style gốc
                />
              )}
              {/* Hiển thị text dưới ảnh (nếu có) */}
              {/* Logic này lấy từ ContentsScreen gốc, option.text đã bao gồm cả romaji nếu có */}
              {(option.text && option.text.trim() !== '') ||
              (option.textRomaji && option.textRomaji.trim() !== '') ? (
                <View style={styles.optionImageTextContainer_NEW}>
                  {option.text && option.text.trim() !== '' && (
                    <Text style={styles.optionImageTextForeign_NEW}>
                      {option.text}
                      {/* option.text đã được map để có thể chứa cả romaji, 
                          ví dụ: "Text <new_line> (Romaji)". 
                          Nếu bạn muốn hiển thị romaji riêng với style khác, cần điều chỉnh logic map dữ liệu và JSX ở đây.
                          Hiện tại, nó sẽ hiển thị toàn bộ option.text với style optionImageTextForeign_NEW.
                      */}
                    </Text>
                  )}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Styles được copy nguyên từ ContentsScreen.tsx cho phần 'select_image'
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
  imageOptionsContainer: {
    marginTop: 40,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
  }, // Chú ý: paddingHorizontal ở đây có thể gây lệch nếu contentCard cũng có padding. Xem xét lại nếu cần.
  imageOptionButton: {
    width: 140,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base * 2,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    overflow: 'hidden' /* Thêm để bo tròn ảnh con */,
  },
  selectedImageOption: {
    borderColor: COLORS.primary,
    borderWidth: 3,
    backgroundColor: COLORS.lightPrimary,
  },
  correctImageOption: {
    borderColor: COLORS.green,
    borderWidth: 3,
    backgroundColor: COLORS.lightGreen,
  },
  incorrectImageOption: {
    borderColor: COLORS.red,
    borderWidth: 3,
    backgroundColor: COLORS.lightRed,
  },
  optionImage: {
    width: '75%',
    height: '75%',
    marginBottom: SIZES.base,
    borderRadius: SIZES.radius / 2 /* Điều chỉnh bo tròn cho ảnh */,
  }, // Giảm marginBottom nếu text nằm dưới
  optionImageTextContainer_NEW: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    alignItems: 'center',
    paddingVertical: SIZES.base / 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: SIZES.radius / 2,
  }, // Nền tối hơn để chữ dễ đọc
  optionImageTextForeign_NEW: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '500',
  }, // Chữ trắng
  // optionImageTextRomaji_NEW: // Style này có trong ContentsScreen gốc nhưng không được dùng trực tiếp trong JSX gốc cho select_image. Nếu cần, bạn thêm vào.
});

export default SelectImageLessonContent;
