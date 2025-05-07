// src/components/courses/CourseCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';
import {Course} from '../../types';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({course, onPress}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return COLORS.success;
      case 'intermediate':
        return COLORS.warning;
      case 'advanced':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Sơ cấp';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Cao cấp';
      default:
        return 'Không xác định';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(course)}
      activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: course.imageUrl}}
          style={styles.image}
          resizeMode="cover"
        />
        <View
          style={[
            styles.levelBadge,
            {backgroundColor: getLevelColor(course.level)},
          ]}>
          <Text style={styles.levelText}>{getLevelText(course.level)}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bài học</Text>
            <Text style={styles.infoValue}>{course.lessonsCount}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Thời gian</Text>
            <Text style={styles.infoValue}>{course.duration}</Text>
          </View>
        </View>

        {course.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBar, {width: `${course.progress}%`}]}
              />
            </View>
            <Text style={styles.progressText}>
              {course.progress}% hoàn thành
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    marginBottom: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
  },
  levelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radius * 2,
  },
  levelText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.small,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 3,
  },
  infoValue: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 5,
  },
});

export default CourseCard;
