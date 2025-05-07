// src/screens/lessons/components/ListeningExerciseUI.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image, // Import từ react-native, không phải react-native-svg
} from 'react-native'; // Import từ react-native trực tiếp
import {COLORS, FONTS, SIZES, SHADOWS} from '../../../constants/theme';

interface ListeningExerciseProps {
  exercise: {
    id: string;
    audioUrl: string;
    transcript: string;
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

const ListeningExerciseUI: React.FC<ListeningExerciseProps> = ({exercise}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.contentTitle}>Bài tập nghe hiểu</Text>

      <View style={styles.audioPlayerContainer}>
        <Image
          source={{uri: 'https://example.com/audio_waveform.png'}}
          style={styles.audioWaveform}
          resizeMode="cover"
        />
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.audioButton}>
            <Text style={styles.audioButtonIcon}>⏪</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playButtonIcon}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioButton}>
            <Text style={styles.audioButtonIcon}>⏩</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.transcriptToggle}
        onPress={() => setShowTranscript(!showTranscript)}>
        <Text style={styles.transcriptToggleText}>
          {showTranscript ? 'Ẩn' : 'Hiện'} bản ghi
        </Text>
      </TouchableOpacity>

      {showTranscript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.japaneseText}>{exercise.transcript}</Text>
          <Text style={styles.vietnameseText}>{exercise.translation}</Text>
        </View>
      )}

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
                  selectedAnswer === option && styles.selectedAnswer,
                ]}
                onPress={() => setSelectedAnswer(option)}>
                <Text
                  style={[
                    styles.answerText,
                    selectedAnswer === option && styles.selectedAnswerText,
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
  audioPlayerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 15,
    marginBottom: 15,
  },
  audioWaveform: {
    width: '100%',
    height: 60,
    borderRadius: SIZES.radius,
    marginBottom: 15,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButton: {
    padding: 10,
  },
  audioButtonIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButtonIcon: {
    fontSize: 30,
    color: COLORS.white,
  },
  transcriptToggle: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  transcriptToggleText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  transcriptContainer: {
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

export default ListeningExerciseUI;
