import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: Props) {
  const { theme } = useTheme();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ring pulse animation
    const ringPulse = Animated.loop(
      Animated.stagger(300, [
        Animated.sequence([
          Animated.timing(ring1Scale, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(ring1Scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ring2Scale, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
          Animated.timing(ring2Scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    );
    ringPulse.start();

    // Sequence: logo → name → tagline → progress bar → done
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(progressWidth, { toValue: width * 0.65, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      ringPulse.stop();
      setTimeout(onFinish, 200);
    });
  }, []);

  return (
    <LinearGradient
      colors={['#040B1C', '#071430', '#0A1A40']}
      style={styles.container}
    >
      {/* Background decorative rings */}
      <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1Scale }], borderColor: '#4F8EF720' }]} />
      <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], borderColor: '#4F8EF710' }]} />

      {/* Logo container */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient
          colors={['#1A3A6A', '#0D2455']}
          style={styles.logoCircle}
        >
          <Text style={styles.logoEmoji}>🔥</Text>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>5G</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>VayuRaksha</Text>
        <View style={styles.nameDivider} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Smart LPG Safety & Burner Monitoring
      </Animated.Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>Initializing secure connection...</Text>
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0 • Demo Mode</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  ring1: { width: 260, height: 260 },
  ring2: { width: 380, height: 380 },
  logoWrap: { marginBottom: 12 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4F8EF740',
  },
  logoEmoji: { fontSize: 50 },
  logoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#00C853',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  logoBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#F0F4FF',
    letterSpacing: 2,
  },
  nameDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#4F8EF7',
    borderRadius: 2,
    marginTop: 6,
  },
  tagline: {
    fontSize: Typography.sm,
    color: '#8A9BC0',
    letterSpacing: 0.5,
    textAlign: 'center',
    maxWidth: 260,
  },
  progressContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: width * 0.65,
    height: 3,
    backgroundColor: '#1E2A45',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#4F8EF7',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.xs,
    color: '#4A5780',
    letterSpacing: 0.3,
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: Typography.xs,
    color: '#2A3550',
  },
});
