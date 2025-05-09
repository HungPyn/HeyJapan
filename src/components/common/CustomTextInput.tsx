// src/components/common/CustomTextInput.tsx
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleProp,
} from 'react-native';
import {COLORS, FONTS, SIZES, SHADOWS} from '../../constants/theme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: TextStyle;
  secureTextEntry?: boolean;
  showTogglePassword?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  secureTextEntry = false,
  showTogglePassword = false,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderTogglePasswordButton = () => {
    if (secureTextEntry && showTogglePassword) {
      return (
        <TouchableOpacity
          style={styles.togglePasswordButton}
          onPress={togglePasswordVisibility}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInputContainer,
          error && styles.errorInputContainer,
        ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            rightIcon || (secureTextEntry && showTogglePassword)
              ? styles.inputWithRightIcon
              : null,
            inputStyle,
          ]}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...restProps}
        />

        {renderTogglePasswordButton()}
        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.margin,
  },
  label: {
    ...FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
    fontSize: SIZES.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  focusedInputContainer: {
    borderColor: COLORS.primary,
  },
  errorInputContainer: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  rightIconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    ...FONTS.regular,
    fontSize: SIZES.medium,
    paddingHorizontal: 15,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  togglePasswordButton: {
    paddingHorizontal: 12,
  },
  togglePasswordText: {
    ...FONTS.medium,
    color: COLORS.primary,
    fontSize: SIZES.small,
  },
  errorText: {
    ...FONTS.regular,
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: 5,
  },
});

export default CustomTextInput;
