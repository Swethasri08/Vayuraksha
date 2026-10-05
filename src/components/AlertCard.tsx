import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert, AlertSeverity } from '../types/alert';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { formatRelativeTime } from '../utils/formatters';

interface Props {
  alert: Alert;
  onPress?: (alert: Alert) => void;
  onMarkRead?: (id: string) => void;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; color: string; label: string }> = {
  CRITICAL: { icon: '🔴', color: '#D32F2F', label: 'CRITICAL' },
  WARNING:  { icon: '🟠', color: '#FF8F00', label: 'WARNING' },
  INFO:     { icon: '🔵', color: '#0288D1', label: 'INFO' },
};

export function AlertCard({ alert, onPress, onMarkRead }: Props) {
  const { theme } = useTheme();
  const config = SEVERITY_CONFIG[alert.severity];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(alert)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: alert.read ? theme.cardBorder : config.color + '50',
          borderLeftColor: config.color,
          opacity: alert.read ? 0.75 : 1,
        },
        Shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{config.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
              {alert.title}
            </Text>
            <Text style={[styles.severity, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.time, { color: theme.textMuted }]}>
            {formatRelativeTime(alert.timestamp)}
          </Text>
          {!alert.read && (
            <TouchableOpacity
              onPress={() => onMarkRead?.(alert.id)}
              style={[styles.readBtn, { borderColor: theme.accent }]}
            >
              <Text style={[styles.readBtnText, { color: theme.accent }]}>Mark read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
        {alert.message}
      </Text>

      {alert.recommendedAction && (
        <View style={[styles.actionBox, { backgroundColor: theme.elevated, borderColor: theme.divider }]}>
          <Text style={[styles.actionLabel, { color: theme.textMuted }]}>💡 Recommended Action</Text>
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>{alert.recommendedAction}</Text>
        </View>
      )}

      {!alert.read && (
        <View style={[styles.unreadDot, { backgroundColor: config.color }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Spacing.xs,
  },
  icon: { fontSize: 20, marginTop: 2 },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
  severity: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    letterSpacing: 0.8,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: { fontSize: Typography.xs },
  readBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  readBtnText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  message: {
    fontSize: Typography.sm,
    lineHeight: Typography.lineHeightBase,
    marginTop: 2,
  },
  actionBox: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: 2,
  },
  actionLabel: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
  actionText: { fontSize: Typography.xs, lineHeight: 16 },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
