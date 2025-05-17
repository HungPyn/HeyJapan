// src/constants/theme.ts
export const COLORS = {
  primary: '#8DCC63', // Xanh lá tươi (giống HeyJapan)
  textSecondary: '#616161', // Màu chữ phụ (xám đậm) - Cập nhật đây là màu thứ cấp
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
  deeperRed: '#ef5350', // Màu đỏ đậm
  lightGray: '#D3D3D3', // Xám nhạt
  transparent: 'transparent',
  nenItem: 'rgba(241, 233, 217, 0.99)',
  nenItemDam: '#FFE7A1',
  // Màu sắc mới bạn yêu cầu
  lightGreen: '#a8e6cf', // Màu xanh lá nhạt
  lightRed: '#f8d7da', // Màu đỏ nhạt
  mediumRed: '#e57373', // Màu đỏ đậm nhẹ
  orange: '#f39c12', // Màu cam

  lightGray2: '#F5F5F5', // Màu xám nhạt hơn

  darkGray: '#616161', // Màu xám đậm

  blue: '#2196F3', // Màu xanh dương
  green: '#4CAF50', // Màu xanh lá
  red: '#F44336', // Màu đỏ
  lightPrimary: '#C8E6C9', // Màu xanh lá nhạt
  correctBg: '#D4EDDA', // Nền xanh lá khi đúng
  darkGreen: '#155724', // Chữ xanh lá đậm khi đúng
  incorrectBg: '#F8D7DA', // Nền đỏ khi sai
  darkRed: '#721C24', // Chữ đỏ đậm khi sai
};

export const SIZES = {
  // Font sizes
  radiusLG: 16, // Kích thước bo góc lớn
  xSmall: 10,
  small: 12,
  medium: 14,
  large: 16,
  xLarge: 18,
  xxLarge: 20,
  xxxLarge: 24,
  font: 14,
  h2: 18,

  // Kích thước chung
  h1: 32, // Tiêu đề lớn
  h3: 20, // Tiêu đề nhỏ
  base: 12, // Khoảng cách cơ bản
  marginTop: 20, // Margin top
  marginBottom: 20, // Margin bottom

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
  semiBold: {
    fontFamily: 'System', // Phông chữ mặc định
    fontWeight: '600', // Semi-bold weight (đậm vừa phải)
  },
  medium: {
    fontFamily: 'Roboto-Medium',
    fontWeight: '500' as '500',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold' as 'bold',
  },
  h3: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold' as 'bold',
  },
  h2: {
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
