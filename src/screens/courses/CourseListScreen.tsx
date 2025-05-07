// src/screens/courses/CourseListScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList } from '../../navigation';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import CourseCard from '../../components/courses/CourseCard';
import { mockCourses } from '../../mocks/courseData';
import { Course } from '../../types';

type CourseListScreenNavigationProp = StackNavigationProp<CoursesStackParamList, 'CourseList'>;

const LEVELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'beginner', label: 'Sơ cấp' },
  { id: 'intermediate', label: 'Trung cấp' },
  { id: 'advanced', label: 'Cao cấp' },
];

const CourseListScreen: React.FC = () => {
  const navigation = useNavigation<CourseListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderLevelFilter = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.filterItem,
              selectedLevel === level.id && styles.selectedFilter
            ]}
            onPress={() => setSelectedLevel(level.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedLevel === level.id && styles.selectedFilterText
              ]}
            >
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khóa học</Text>
        <TouchableOpacity onPress={() => console.log('Notifications')}>
          <Text style={styles.iconPlaceholder}>🔔</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {renderLevelFilter()}
      
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.coursesList}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={handleCoursePress} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? `Không tìm thấy khóa học cho "${searchQuery}"`
                : 'Chưa có khóa học nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding / 2,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
  },
  iconPlaceholder: {
    fontSize: 24,
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: COLORS.textLight,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: COLORS.text,
    ...FONTS.regular,
    fontSize: SIZES.medium,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textLight,
    padding: 5,
  },
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 15,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  selectedFilterText: {
    color: COLORS.white,
  },
  coursesList: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default CourseListScreen;