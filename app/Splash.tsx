import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
        router.replace('/RoleSelection');

     
    }, 1500);

    return () => clearTimeout(t);
  }, [router, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/logoplanbuddy.png')}
        accessibilityLabel="PlanBuddy logo"
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AAAFCA',
  },
  logo: {
    width: 180,
    height: 180,
  },
});