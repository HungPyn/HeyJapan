import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AdminScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đây là màn hình Học tạp</Text>
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // căn giữa theo chiều dọc
    alignItems: 'center', // căn giữa theo chiều ngang
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
