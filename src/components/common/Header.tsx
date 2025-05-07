// src/components/common/Header.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../constants/theme';
import {useNavigation} from '@react-navigation/native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightComponent,
  onBackPress,
  backgroundColor = COLORS.white,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={
          backgroundColor === COLORS.white ? 'dark-content' : 'light-content'
        }
      />
      <View style={[styles.container, {backgroundColor}]}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}>
              {/* Vì không thể sử dụng Vector Icons, sử dụng Text thay thế */}
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightContainer}>{rightComponent}</View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  backButton: {
    paddingVertical: 5,
    paddingRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
});

export default Header;
