// src/screens/tools/DictionaryScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';

// Định nghĩa type cho từ điển
interface DictionaryItem {
  id: string;
  japanese: string;
  furigana: string;
  vietnamese: string;
  partOfSpeech: string;
  examples: {
    japanese: string;
    furigana: string;
    vietnamese: string;
  }[];
}

// Mock data cho từ điển
const mockDictionaryResults: DictionaryItem[] = [
  {
    id: '1',
    japanese: '日本語',
    furigana: 'にほんご',
    vietnamese: 'Tiếng Nhật',
    partOfSpeech: 'Danh từ',
    examples: [
      {
        japanese: '私は日本語を勉強しています。',
        furigana: 'わたしはにほんごをべんきょうしています。',
        vietnamese: 'Tôi đang học tiếng Nhật.',
      },
    ],
  },
  {
    id: '2',
    japanese: '勉強する',
    furigana: 'べんきょうする',
    vietnamese: 'Học tập',
    partOfSpeech: 'Động từ',
    examples: [
      {
        japanese: '毎日勉強しています。',
        furigana: 'まいにちべんきょうしています。',
        vietnamese: 'Tôi học tập mỗi ngày.',
      },
    ],
  },
  {
    id: '3',
    japanese: '先生',
    furigana: 'せんせい',
    vietnamese: 'Giáo viên',
    partOfSpeech: 'Danh từ',
    examples: [
      {
        japanese: '彼は日本語の先生です。',
        furigana: 'かれはにほんごのせんせいです。',
        vietnamese: 'Anh ấy là giáo viên tiếng Nhật.',
      },
    ],
  },
];

const DictionaryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryItem[]>(
    mockDictionaryResults,
  );
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);

  const handleSearch = () => {
    // Mô phỏng tìm kiếm từ điển
    if (searchQuery.trim() === '') {
      setSearchResults(mockDictionaryResults);
    } else {
      const filteredResults = mockDictionaryResults.filter(
        item =>
          item.japanese.includes(searchQuery) ||
          item.furigana.includes(searchQuery) ||
          item.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setSearchResults(filteredResults);
    }
    setSelectedItem(null);
  };

  const handleSelectItem = (item: DictionaryItem) => {
    setSelectedItem(item);
  };

  const renderDictionaryItem = ({item}: {item: DictionaryItem}) => (
    <TouchableOpacity
      style={[
        styles.dictionaryItem,
        selectedItem?.id === item.id && styles.selectedDictionaryItem,
      ]}
      onPress={() => handleSelectItem(item)}>
      <View style={styles.dictionaryItemHeader}>
        <Text style={styles.japaneseText}>{item.japanese}</Text>
        <Text style={styles.partOfSpeech}>{item.partOfSpeech}</Text>
      </View>
      <Text style={styles.furiganaText}>{item.furigana}</Text>
      <Text style={styles.vietnameseText}>{item.vietnamese}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Từ điển Nhật-Việt</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm từ tiếng Nhật hoặc tiếng Việt"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderDictionaryItem}
              keyExtractor={item => item.id}
              style={[
                styles.resultsList,
                {
                  flex: selectedItem ? 0.4 : 1,
                  marginBottom: selectedItem ? 10 : 0,
                },
              ]}
            />

            {selectedItem && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsJapanese}>
                    {selectedItem.japanese}
                  </Text>
                  <Text style={styles.detailsFurigana}>
                    {selectedItem.furigana}
                  </Text>
                  <Text style={styles.detailsVietnamese}>
                    {selectedItem.vietnamese}
                  </Text>
                  <Text style={styles.detailsPartOfSpeech}>
                    {selectedItem.partOfSpeech}
                  </Text>
                </View>

                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Ví dụ:</Text>
                  {selectedItem.examples.map((example, index) => (
                    <View key={index} style={styles.exampleItem}>
                      <Text style={styles.exampleJapanese}>
                        {example.japanese}
                      </Text>
                      <Text style={styles.exampleFurigana}>
                        {example.furigana}
                      </Text>
                      <Text style={styles.exampleVietnamese}>
                        {example.vietnamese}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>Không tìm thấy kết quả nào</Text>
            <Text style={styles.noResultsSubText}>
              Hãy thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
  },
  searchContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    ...FONTS.regular,
    fontSize: SIZES.medium,
  },
  searchButton: {
    padding: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  contentContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  resultsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  resultsList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  dictionaryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedDictionaryItem: {
    backgroundColor: COLORS.card,
  },
  dictionaryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  japaneseText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  partOfSpeech: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.textLight,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  furiganaText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  vietnameseText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  detailsContainer: {
    flex: 0.6,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  detailsHeader: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailsJapanese: {
    ...FONTS.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.text,
    marginBottom: 5,
  },
  detailsFurigana: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  detailsVietnamese: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: 5,
  },
  detailsPartOfSpeech: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  examplesContainer: {
    flex: 1,
  },
  examplesTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 10,
  },
  exampleItem: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 10,
    marginBottom: 10,
  },
  exampleJapanese: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 5,
  },
  exampleFurigana: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  exampleVietnamese: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  noResultsSubText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
});

export default DictionaryScreen;
