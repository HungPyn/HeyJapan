// src/components/lessons/LessonItem.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {Lesson} from '../../types';

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  onPress: (lesson: Lesson) => void;
}

const LessonItem: React.FC<LessonItemProps> = ({lesson, index, onPress}) => {
  const getStatusColor = () => {
    switch (lesson.status) {
      case 'completed':
        return COLORS.success;
      case 'in_progress':
        return COLORS.warning;
      case 'not_started':
      default:
        return COLORS.textLight;
    }
  };

  const getStatusText = () => {
    switch (lesson.status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in_progress':
        return 'Đang học';
      case 'not_started':
      default:
        return 'Chưa bắt đầu';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(lesson)}
      activeOpacity={0.7}>
      <View style={styles.numberContainer}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {lesson.title}
        </Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.status, {color: getStatusColor()}]}>
            {getStatusText()}
          </Text>
        </View>

        {lesson.progress !== undefined && lesson.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBar, {width: `${lesson.progress}%`}]}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: COLORS.white,
    ...FONTS.bold,
    fontSize: SIZES.medium,
  },
  typeIconContainer: {
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.textLight,
  },
  status: {
    ...FONTS.medium,
    fontSize: SIZES.xSmall,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  chevronContainer: {
    marginLeft: 5,
  },
  chevron: {
    color: COLORS.textLight,
    fontSize: SIZES.xxLarge,
  },
});

export default LessonItem;
