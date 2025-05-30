// src/components/lesson_types/WritingLessonContent.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../../constants/theme'; // Giữ nguyên đường dẫn này nếu đúng

// --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
// 1. XÓA BỎ bất kỳ định nghĩa interface MappedContentItem và Option nào ở đây.
// 2. IMPORT MappedContentItem từ ContentsScreen.tsx
import {MappedContentItem} from '../ContentsScreen';
// (Đảm bảo đường dẫn '../../screens/lessons/ContentsScreen' là chính xác)
// --- KẾT THÚC THAY ĐỔI QUAN TRỌNG ---

interface WritingLessonContentProps {
  item: MappedContentItem; // Bây giờ sẽ sử dụng MappedContentItem được import
  isInteractionDisabled: boolean;
  onTextChange: (text: string) => void;
  initialText?: string;
}

const WritingLessonContent: React.FC<WritingLessonContentProps> = ({
  item, // Dòng 43 bạn đề cập, giờ sẽ có kiểu đúng
  isInteractionDisabled,
  onTextChange,
  initialText = '',
}) => {
  const [writtenText, setWrittenText] = useState(initialText);

  useEffect(() => {
    setWrittenText(initialText);
  }, [initialText]);

  const handleTextChange = (text: string) => {
    setWrittenText(text);
    onTextChange(text);
  };

  const promptText = item.title || 'Viết câu trả lời của bạn:';
  const detailText = item.content_detail;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>{promptText}</Text>
        {detailText && <Text style={styles.detailText}>{detailText}</Text>}
        <TextInput
          style={[
            styles.textInput,
            isInteractionDisabled && styles.disabledInput,
          ]}
          placeholder="Nhập ở đây..."
          value={writtenText}
          onChangeText={handleTextChange}
          editable={!isInteractionDisabled}
          multiline={true}
          numberOfLines={4}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles giữ nguyên như bạn đã có hoặc đã điều chỉnh
const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold?.fontFamily,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  detailText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular?.fontFamily,
    color: COLORS.darkGray,
    marginBottom: SIZES.padding,
    lineHeight: SIZES.medium * 1.5,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    fontSize: SIZES.font,
    fontFamily: FONTS.regular?.fontFamily,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SIZES.padding,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray2,
    color: COLORS.gray,
  },
});

export default WritingLessonContent;
