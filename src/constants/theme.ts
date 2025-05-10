// src/constants/theme.ts
export const COLORS = {
  primary: '#8DCC63', // Xanh lá tươi (giống HeyJapan)

  primaryDark: '#E05555', // Phiên bản đậm hơn của primary
  secondary: '#4ECDC4', // Màu phụ - Xanh ngọc
  accent: '#FFE66D', // Màu nhấn - Vàng nhạt
  background: '#FFFFFF', // Nền chính
  card: '#F9F9F9', // Nền thẻ
  text: '#333333', // Chữ chính
  textLight: '#777777', // Chữ phụ
  border: '#EEEEEE', // Viền
  error: '#FF5252', // Báo lỗi
  success: '#4CAF50', // Báo thành công
  warning: '#FFC107', // Cảnh báo
  info: '#2196F3', // Thông tin
  disabled: '#CCCCCC', // Bị vô hiệu hóa
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  transparent: 'transparent',
  nenItem: 'rgba(241, 233, 217, 0.99)',
};

export const SIZES = {
  // Font sizes
  xSmall: 10,
  small: 12,
  medium: 14,
  large: 16,
  xLarge: 18,
  xxLarge: 20,
  xxxLarge: 24,
  font: 14,
  h2: 18,

  // Spacing
  padding: 15,
  margin: 15,
  radius: 8,

  // Screen dimensions - sẽ được thay thế bằng Dimensions động
  width: 375,
  height: 812,
};

export const FONTS = {
  regular: {
    fontFamily: 'Roboto-Regular',
    fontWeight: 'normal' as 'normal',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
    fontWeight: '500' as '500',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold' as 'bold',
  },
  light: {
    fontFamily: 'Roboto-Light',
    fontWeight: '300' as '300',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
