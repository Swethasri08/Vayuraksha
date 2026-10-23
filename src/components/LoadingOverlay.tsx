import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: Props) {
  const { theme } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: theme.background, opacity: fade }]}>
      <Animated.View style={[styles.spinner, { borderColor: theme.accent + '30', borderTopColor: theme.accent, transform: [{ rotate }] }]} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>{message}</Text>
    </Animated.View>
  );
}

export function InlineLoader({ size = 32 }: { size?: number }) {
  const { theme } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 3, borderColor: theme.accent + '30', borderTopColor: theme.accent,
      transform: [{ rotate }],
    }} />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  spinner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
  },
  text: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
});
