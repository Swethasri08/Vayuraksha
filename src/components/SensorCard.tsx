import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';

interface Props {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  subValue?: string;
  status?: 'safe' | 'warning' | 'critical' | 'info' | 'neutral';
  onPress?: () => void;
  fullWidth?: boolean;
}

export function SensorCard({ icon, label, value, unit, subValue, status = 'neutral', onPress, fullWidth }: Props) {
  const { theme } = useTheme();

  const statusColor = {
    safe:     theme.safe,
    warning:  theme.warning,
    critical: theme.critical,
    info:     theme.info,
    neutral:  theme.accent,
  }[status];

  const statusBg = {
    safe:     theme.safeLight + '18',
    warning:  theme.warningLight + '18',
    critical: theme.criticalLight + '18',
    info:     theme.infoLight + '18',
    neutral:  theme.accentLight,
  }[status];

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          width: fullWidth ? '100%' : '48%',
        },
        Shadows.md,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: statusBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: theme.textMuted }]}>{unit}</Text>}
      </View>
      {subValue && (
        <Text style={[styles.subValue, { color: theme.textMuted }]}>{subValue}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  iconText: {
    fontSize: 22,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  unit: {
    fontSize: Typography.sm,
    fontWeight: Typography.regular,
  },
  subValue: {
    fontSize: Typography.xs,
  },
});
