import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {StyleSheet, View} from 'react-native';

const WavyBackground = () => {
  return (
    <View style={styles.container}>
      <Svg height="400" width="100%" viewBox="0 0 1440 320">
        <Path
          fill="#A3D8F4"
          d="M0,96L30,117.3C60,139,120,181,180,202.7C240,224,300,224,360,213.3C420,203,480,181,540,154.7C600,128,660,96,720,112C780,128,840,192,900,218.7C960,245,1020,235,1080,218.7C1140,203,1200,181,1260,170.7C1320,160,1380,160,1410,160L1440,160L1440,0L1410,0C1380,0,1320,0,1260,0C1200,0,1140,0,1080,0C1020,0,960,0,900,0C840,0,780,0,720,0C660,0,600,0,540,0C480,0,420,0,360,0C300,0,240,0,180,0C120,0,60,0,30,0L0,0Z"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});

export default WavyBackground;
