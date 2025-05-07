// src/screens/lessons/components/WritingExerciseUI.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import CustomButton from '../../../components/common/CustomButton';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../../constants/theme';

interface WritingExerciseProps {
  exercise: {
    id: string;
    instruction: string;
    prompt: string;
    expectedAnswer?: string;
  };
}

const WritingExerciseUI: React.FC<WritingExerciseProps> = ({exercise}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.contentTitle}>Bài tập viết</Text>

      <View style={styles.writingInstructionContainer}>
        <Text style={styles.instructionText}>{exercise.instruction}</Text>
        <Text style={styles.promptText}>{exercise.prompt}</Text>
      </View>

      <View style={styles.writingInputContainer}>
        <TextInput
          style={styles.writingInput}
          placeholder="Viết câu trả lời của bạn bằng tiếng Nhật..."
          multiline
          numberOfLines={4}
          value={answer}
          onChangeText={setAnswer}
          editable={!isSubmitted}
        />

        {!isSubmitted ? (
          <CustomButton
            title="Gửi câu trả lời"
            onPress={handleSubmit}
            type="primary"
            size="medium"
            style={styles.submitButton}
          />
        ) : (
          <View style={styles.feedbackContainer}>
            <Text style={styles.correctAnswerLabel}>Đáp án mẫu:</Text>
            <Text style={styles.correctAnswerText}>
              {exercise.expectedAnswer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  contentTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 15,
  },
  writingInstructionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  instructionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  promptText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  writingInputContainer: {
    marginBottom: 20,
  },
  writingInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 15,
    minHeight: 120,
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    alignSelf: 'flex-end',
  },
  feedbackContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
  },
  correctAnswerLabel: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 5,
  },
  correctAnswerText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
});

export default WritingExerciseUI;
