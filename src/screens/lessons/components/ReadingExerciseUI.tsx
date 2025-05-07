// src/screens/lessons/components/ReadingExerciseUI.tsx
import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'; // Import từ react-native trực tiếp
import {COLORS, FONTS, SIZES, SHADOWS} from '../../../constants/theme';

interface ReadingExerciseProps {
  exercise: {
    id: string;
    text: string;
    translation: string;
    questions: {
      id: string;
      text: string;
      type: string;
      options?: string[];
      correctAnswer: string | string[];
    }[];
  };
}

const ReadingExerciseUI: React.FC<ReadingExerciseProps> = ({exercise}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.contentTitle}>Bài tập đọc hiểu</Text>

      <View style={styles.readingContainer}>
        <Text style={styles.japaneseText}>{exercise.text}</Text>

        <TouchableOpacity
          style={styles.translationToggle}
          onPress={() => setShowTranslation(!showTranslation)}>
          <Text style={styles.translationToggleText}>
            {showTranslation ? 'Ẩn' : 'Hiện'} bản dịch
          </Text>
        </TouchableOpacity>

        {showTranslation && (
          <Text style={styles.vietnameseText}>{exercise.translation}</Text>
        )}
      </View>

      <View style={styles.questionsContainer}>
        <Text style={styles.questionSectionTitle}>Câu hỏi</Text>

        {exercise.questions.map((question, index) => (
          <View key={question.id} style={styles.questionItem}>
            <Text style={styles.questionText}>
              {index + 1}. {question.text}
            </Text>

            {question.options?.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.answerOption,
                  selectedAnswers[question.id] === option &&
                    styles.selectedAnswer,
                ]}
                onPress={() => handleSelectAnswer(question.id, option)}>
                <Text
                  style={[
                    styles.answerText,
                    selectedAnswers[question.id] === option &&
                      styles.selectedAnswerText,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

// Thêm StyleSheet cho component
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
  readingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 20,
  },
  japaneseText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  translationToggle: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
    padding: 5,
  },
  translationToggleText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  vietnameseText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  questionsContainer: {
    marginTop: 10,
  },
  questionSectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 15,
  },
  questionItem: {
    marginBottom: 20,
  },
  questionText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  answerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    marginBottom: 8,
  },
  selectedAnswer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  selectedAnswerText: {
    color: COLORS.white,
  },
});

export default ReadingExerciseUI;
