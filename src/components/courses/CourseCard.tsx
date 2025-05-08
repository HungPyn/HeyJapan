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
const CARD_WIDTH = width * 0.25;

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({course, onPress}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Cơ bản':
        return COLORS.success;
      case 'Sơ cấp':
        return COLORS.warning;
      case 'Trung cấp':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'Cơ bản':
        return 'Cơ bản';
      case 'Sơ cấp':
        return 'Sơ cấp';
      case 'Trung cấp':
        return 'Trung cấp';
      default:
        return 'Không xác định';
    }
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => onPress(course)}
      activeOpacity={0.9}>
      <View
        style={[
          styles.rowContainer,
          {
            flexDirection:
              parseInt(course.topic_code) % 2 === 0 ? 'row-reverse' : 'row',
          },
        ]}>
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: course.imageUrl}}
              style={styles.image}
              resizeMode="cover"
            />
            <View
              style={[
                styles.levelBadge,
                {backgroundColor: getLevelColor(course.levelCode)},
              ]}>
              <Text style={styles.levelText}>
                {getLevelText(course.levelCode)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.titleText}>{course.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row', // sẽ bị ghi đè bởi điều kiện ở trên
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2.5,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  titleText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginHorizontal: 10,
    width: 100, // hoặc tuỳ chỉnh
  },
  container: {
    width: CARD_WIDTH, // nhớ giảm CARD_WIDTH ở trên, ví dụ: width * 0.65
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    marginBottom: 15,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100, // giảm chiều cao hình ảnh
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  levelText: {
    ...FONTS.medium,
    color: COLORS.white,
    fontSize: SIZES.small,
  },
  contentContainer: {
    padding: SIZES.padding / 1.5, // giảm padding bên trong
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.medium, // giảm kích thước chữ
    color: COLORS.text,
    marginBottom: 6,
  },
  description: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2.5,
  },
  progressText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 4,
  },
});

export default CourseCard;
