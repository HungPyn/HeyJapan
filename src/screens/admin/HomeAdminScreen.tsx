// src/screens/admin/HomeAdminScreen.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import TaiKhoanScreen from './TaiKhoanScreen';
import HocTapScreen from './HocTapScreen';
import TienDoScreenAdmin from './TienDoScreen';

import {COLORS} from '../../constants/theme';

export type AdminHomeTabParamList = {
  AdminAccount: undefined;
  AdminLearning: undefined;
  AdminProgress: undefined;
};

const Tab = createBottomTabNavigator<AdminHomeTabParamList>();

const HomeAdminScreen = () => {
  return (
    <Tab.Navigator
      // --- ÁP DỤNG STYLE TỪ USER TABBAR VÀO ĐÂY ---
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveBackgroundColor: '#FFBF00', // Style từ User
        tabBarActiveTintColor: COLORS.white, // Style từ User
        tabBarInactiveTintColor: COLORS.white, // Style từ User
        tabBarStyle: {
          // Style từ User (khi visible)
          height: 65,
          paddingVertical: 5,
          backgroundColor: COLORS.primary,
          paddingBottom: 0,
          // Bạn có thể thêm các thuộc tính khác như borderTopWidth: 0 nếu cần
          borderTopWidth: 0, // Giống user nếu user không có border
        },
        tabBarLabelStyle: {
          // Style từ User
          fontSize: 16,
          fontWeight: '500',
          paddingVertical: 0,
          paddingBottom: 0,
          transform: [{translateY: -10}],
        },
        tabBarIcon: () => null, // Giữ nguyên không có icon
      }}
      // --- KẾT THÚC PHẦN STYLE ---
    >
      {/* Các Tab.Screen giữ nguyên */}
      <Tab.Screen
        name="AdminAccount"
        component={TaiKhoanScreen}
        options={{tabBarLabel: 'Tài khoản'}}
      />
      <Tab.Screen
        name="AdminLearning"
        component={HocTapScreen}
        options={{tabBarLabel: 'Học Tập'}}
      />
      <Tab.Screen
        name="AdminProgress"
        component={TienDoScreenAdmin}
        options={{tabBarLabel: 'Tiến độ'}}
      />
    </Tab.Navigator>
  );
};

export default HomeAdminScreen;
