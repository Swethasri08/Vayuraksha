import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { DataPoint } from '../types/sensor';
import { formatTemperature, formatWindSpeed, formatGasConcentration } from '../utils/formatters';

type Range = '1H' | '24H' | '7D';

// Bar chart component for history display
function BarChart({
  data, color, label, formatter, height = 120
}: {
  data: DataPoint[];
  color: string;
  label: string;
  formatter: (v: number) => string;
  height?: number;
}) {
  const { theme } = useTheme();
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const current = values[values.length - 1];

  return (
    <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartLabel, { color: theme.textPrimary }]}>{label}</Text>
        <Text style={[styles.chartCurrent, { color }]}>{formatter(current)}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 2, marginVertical: 8 }}>
        {values.slice(-40).map((v, i, arr) => {
          const h = Math.max(4, ((v - min) / range) * height);
          const isLast = i === arr.length - 1;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: h,
                backgroundColor: isLast ? color : color + '50',
                borderRadius: 2,
              }}
            />
          );
        })}
      </View>

      <View style={styles.chartFooter}>
        <Text style={[styles.chartMinMax, { color: theme.textMuted }]}>Min: {formatter(min)}</Text>
        <Text style={[styles.chartMinMax, { color: theme.textMuted }]}>Max: {formatter(max)}</Text>
      </View>
    </View>
  );
}

export function HistoryScreen() {
  const { theme } = useTheme();
  const { history, alerts } = useSensor();
  const [range, setRange] = useState<Range>('1H');

  const ranges: Range[] = ['1H', '24H', '7D'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>History</Text>
      </View>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Sensor trends and historical records</Text>

      {/* Range selector */}
      <View style={[styles.rangeRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        {ranges.map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.rangeBtn, range === r && { backgroundColor: theme.accent }]}
            onPress={() => setRange(r)}
          >
            <Text style={[styles.rangeBtnText, { color: range === r ? '#fff' : theme.textSecondary }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Sensor Trends</Text>

      {history ? (
        <>
          <BarChart data={history.temperature} color={theme.critical} label="🌡️ Temperature" formatter={formatTemperature} />
          <BarChart data={history.wind} color={theme.info} label="💨 Wind Speed" formatter={formatWindSpeed} />
          <BarChart data={history.gas} color={theme.warning} label="⚗️ Gas Concentration" formatter={formatGasConcentration} />
          <BarChart data={history.flame} color={theme.safe} label="🔥 Flame (1=Detected, 0=Off)" formatter={(v) => v === 1 ? 'Detected' : 'None'} height={80} />
        </>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[{ color: theme.textMuted }]}>Loading history...</Text>
        </View>
      )}

      {/* Safety Events */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Safety Events</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        {alerts.slice(0, 8).map((alert, i) => (
          <View
            key={alert.id}
            style={[
              styles.eventRow,
              i < Math.min(alerts.length, 8) - 1 && { borderBottomColor: theme.divider, borderBottomWidth: 1 }
            ]}
          >
            <View style={[
              styles.eventDot,
              { backgroundColor: alert.severity === 'CRITICAL' ? theme.critical : alert.severity === 'WARNING' ? theme.warning : theme.info }
            ]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.eventTitle, { color: theme.textPrimary }]} numberOfLines={1}>{alert.title}</Text>
              <Text style={[styles.eventTime, { color: theme.textMuted }]}>
                {typeof alert.timestamp === 'string'
                  ? new Date(alert.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
                  : (alert.timestamp as Date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
            <View style={[
              styles.severityBadge,
              { backgroundColor: alert.severity === 'CRITICAL' ? theme.critical + '20' : alert.severity === 'WARNING' ? theme.warning + '20' : theme.info + '20' }
            ]}>
              <Text style={[
                styles.severityText,
                { color: alert.severity === 'CRITICAL' ? theme.critical : alert.severity === 'WARNING' ? theme.warning : theme.info }
              ]}>
                {alert.severity}
              </Text>
            </View>
          </View>
        ))}
        {alerts.length === 0 && (
          <Text style={[styles.eventTime, { color: theme.textMuted, padding: Spacing.base, textAlign: 'center' }]}>
            No safety events recorded yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.base, paddingTop: 52, paddingBottom: 100 },
  headerRow: { marginBottom: 4 },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  sub: { fontSize: Typography.sm, marginBottom: Spacing.base },
  rangeRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  rangeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.sm },
  rangeBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  chartCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1,
    padding: Spacing.base, marginBottom: Spacing.md,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartLabel: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  chartCurrent: { fontSize: Typography.lg, fontWeight: Typography.bold },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  chartMinMax: { fontSize: Typography.xs },
  placeholder: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: 40, alignItems: 'center', marginBottom: Spacing.md },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.base, overflow: 'hidden' },
  eventRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, gap: Spacing.sm },
  eventDot: { width: 8, height: 8, borderRadius: 4 },
  eventTitle: { fontSize: Typography.sm, fontWeight: Typography.medium },
  eventTime: { fontSize: Typography.xs },
  severityBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  severityText: { fontSize: 10, fontWeight: Typography.bold, letterSpacing: 0.5 },
});
