import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashScreen({ logoSource, fontLoaded }) {
  const [active, setActive] = useState(0);
  const scaleAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(1))).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((v) => (v + 1) % 6);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // animate scales based on active
    scaleAnims.forEach((anim, idx) => {
      Animated.timing(anim, {
        toValue: idx === active ? 1.4 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [active]);

  return (
    <LinearGradient colors={["#FFFFFF","#F9CBCB"]} style={styles.container}>
      <View style={styles.center}>
        {logoSource ? (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]} />
        )}

        <View style={styles.titleWrap} pointerEvents="none">
          <MaskedView
            style={{ height: 60, width: width * 0.8 }}
            maskElement={
              <Text style={[styles.titleText, !fontLoaded && { fontFamily: undefined }]}>smartcrow</Text>
            }
          >
            <LinearGradient colors={["#E53E3E", "#7F2222"]} start={[0, 0]} end={[0, 1]} style={{flex:1}} />
          </MaskedView>
        </View>

        <View style={styles.dotsRow}>
          {scaleAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ scale: anim }] }]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  logoPlaceholder: {
    backgroundColor: '#eee',
    borderRadius: 90,
  },
  titleWrap: {
    marginTop: 6,
    marginBottom: 18,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'JimNightshade',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7F2222',
    marginHorizontal: 6,
    opacity: 0.9,
  },
});
