import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SystemStatus } from '../types/sensor';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';

interface Props {
  status: SystemStatus;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function StatusBadge({ status, size = 'md', animated = true }: Props) {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated || status === 'SAFE') {
      pulseAnim.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [status, animated]);

  const config = {
    SAFE:     { color: theme.safe,     bg: theme.safeLight + '30',    dot: theme.safe,     label: 'SAFE' },
    WARNING:  { color: theme.warning,  bg: theme.warningLight + '30', dot: theme.warning,  label: 'WARNING' },
    CRITICAL: { color: theme.critical, bg: theme.criticalLight + '30',dot: theme.critical, label: 'CRITICAL' },
    UNKNOWN:  { color: theme.textMuted,bg: theme.divider,             dot: theme.textMuted,label: 'UNKNOWN' },
  }[status];

  const sizeConfig = {
    sm: { fontSize: Typography.xs, padding: Spacing.xs, dotSize: 6 },
    md: { fontSize: Typography.sm, padding: Spacing.sm, dotSize: 8 },
    lg: { fontSize: Typography.md, padding: Spacing.md, dotSize: 10 },
  }[size];

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.color + '60',
          paddingHorizontal: sizeConfig.padding * 1.5,
          paddingVertical: sizeConfig.padding * 0.75,
          transform: [{ scale: pulseAnim }],
        }
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot, width: sizeConfig.dotSize, height: sizeConfig.dotSize, borderRadius: sizeConfig.dotSize / 2 }]} />
      <Text style={[styles.label, { color: config.color, fontSize: sizeConfig.fontSize }]}>
        {config.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {},
  label: {
    fontWeight: Typography.bold,
    letterSpacing: 1.2,
  },
});
