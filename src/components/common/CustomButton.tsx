import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {COLORS, FONTS, SIZES} from '../../constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  titleStyle?: TextStyle; // Thêm titleStyle vào đây
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  titleStyle, // Thêm titleStyle vào đây
  icon,
  iconPosition = 'left',
}) => {
  // Xác định styles dựa trên props
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};

    // Button type style
    switch (type) {
      case 'primary':
        buttonStyle = styles.primaryButton;
        break;
      case 'secondary':
        buttonStyle = styles.secondaryButton;
        break;
      case 'outline':
        buttonStyle = styles.outlineButton;
        break;
      case 'text':
        buttonStyle = styles.textButton;
        break;
    }

    // Button size style
    switch (size) {
      case 'small':
        buttonStyle = {...buttonStyle, ...styles.smallButton};
        break;
      case 'medium':
        buttonStyle = {...buttonStyle, ...styles.mediumButton};
        break;
      case 'large':
        buttonStyle = {...buttonStyle, ...styles.largeButton};
        break;
    }

    // Disabled style
    if (disabled) {
      buttonStyle = {...buttonStyle, ...styles.disabledButton};
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyle: TextStyle = styles.buttonText;

    switch (type) {
      case 'primary':
        textStyle = {...textStyle, ...styles.primaryText};
        break;
      case 'secondary':
        textStyle = {...textStyle, ...styles.secondaryText};
        break;
      case 'outline':
        textStyle = {...textStyle, ...styles.outlineText};
        break;
      case 'text':
        textStyle = {...textStyle, ...styles.textButtonText};
        break;
    }

    switch (size) {
      case 'small':
        textStyle = {...textStyle, ...styles.smallText};
        break;
      case 'medium':
        textStyle = {...textStyle, ...styles.mediumText};
        break;
      case 'large':
        textStyle = {...textStyle, ...styles.largeText};
        break;
    }

    if (disabled) {
      textStyle = {...textStyle, ...styles.disabledText};
    }

    return textStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            type === 'outline' || type === 'text'
              ? COLORS.primary
              : COLORS.white
          }
        />
      );
    }

    const buttonText = (
      <Text style={[getTextStyle(), textStyle, titleStyle]}>{title}</Text> // Thêm titleStyle ở đây
    );

    if (icon) {
      return (
        <View style={styles.rowContainer}>
          {iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          {buttonText}
          {iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      );
    }

    return buttonText;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    backgroundColor: COLORS.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  buttonText: {
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
    ...FONTS.medium,
  },
  secondaryText: {
    color: COLORS.white,
    ...FONTS.medium,
  },
  outlineText: {
    color: COLORS.primary,
    ...FONTS.medium,
  },
  textButtonText: {
    color: COLORS.primary,
    ...FONTS.medium,
  },
  smallText: {
    fontSize: SIZES.small,
  },
  mediumText: {
    fontSize: SIZES.medium,
  },
  largeText: {
    fontSize: SIZES.large,
  },
  disabledText: {
    color: COLORS.textLight,
  },
});

export default CustomButton;
