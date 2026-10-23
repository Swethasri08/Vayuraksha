import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import {
  formatTemperature, formatWindSpeed, formatGasConcentration,
  formatPressure, formatRelativeTime,
} from '../utils/formatters';
import { DataPoint } from '../types/sensor';
import { InlineLoader } from '../components/LoadingOverlay';

// Minimal inline sparkline chart (no external deps needed)
function MiniChart({ data, color, height = 60 }: { data: DataPoint[]; color: string; height?: number }) {
  const { theme } = useTheme();
  if (!data || data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 280;
  const H = height;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  // Use SVG-like rendering via View rows
  return (
    <View style={{ height, overflow: 'hidden', borderRadius: 4, marginTop: 8 }}>
      <View style={{ flex: 1, backgroundColor: color + '10', borderRadius: 4, justifyContent: 'flex-end', padding: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height - 8, gap: 2 }}>
          {values.slice(-20).map((v, i) => {
            const barH = Math.max(3, ((v - min) / range) * (height - 12));
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: barH,
                  backgroundColor: color + (i === values.length - 1 ? 'FF' : '80'),
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function MonitoringScreen() {
  const { theme } = useTheme();
  const { reading, history } = useSensor();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  if (!reading || !history) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <InlineLoader size={40} />
        <Text style={[{ color: theme.textSecondary, marginTop: 16 }]}>Loading sensors...</Text>
      </View>
    );
  }

  const tempColor = reading.temperature >= 80 ? theme.critical : reading.temperature >= 60 ? theme.warning : theme.safe;
  const windColor = reading.windStatus === 'STRONG' ? theme.warning : theme.info;
  const gasColor = reading.gasStatus === 'CRITICAL' ? theme.critical : reading.gasStatus === 'WARNING' ? theme.warning : theme.safe;
  const flameColor = reading.flameStatus === 'EXTINGUISHED' ? theme.critical : reading.flameStatus === 'UNSTABLE' ? theme.warning : theme.safe;

  return (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      opacity={fadeAnim}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Live Monitoring</Text>
        <View style={[styles.liveIndicator, { backgroundColor: theme.critical + '20', borderColor: theme.critical + '40' }]}>
          <View style={[styles.liveDot, { backgroundColor: theme.critical }]} />
          <Text style={[styles.liveText, { color: theme.critical }]}>LIVE</Text>
        </View>
      </View>
      <Text style={[styles.updated, { color: theme.textMuted }]}>
        Last updated: {formatRelativeTime(reading.timestamp)}
      </Text>

      {/* Temperature */}
      <SensorDetailCard
        icon="🌡️"
        title="Temperature Sensor"
        value={formatTemperature(reading.temperature)}
        status={reading.temperature >= 80 ? 'CRITICAL' : reading.temperature >= 60 ? 'WARNING' : 'NORMAL'}
        color={tempColor}
        details={[
          { label: 'Current', value: formatTemperature(reading.temperature) },
          { label: 'Warning Threshold', value: '60°C' },
          { label: 'Critical Threshold', value: '80°C' },
        ]}
        theme={theme}
        chart={<MiniChart data={history.temperature} color={tempColor} />}
      />

      {/* Wind */}
      <SensorDetailCard
        icon="💨"
        title="Wind Sensor"
        value={formatWindSpeed(reading.wind)}
        status={reading.windStatus}
        color={windColor}
        details={[
          { label: 'Wind Speed', value: formatWindSpeed(reading.wind) },
          { label: 'Condition', value: reading.windStatus },
          { label: 'Warning At', value: '15 m/s' },
        ]}
        theme={theme}
        chart={<MiniChart data={history.wind} color={windColor} />}
      />

      {/* Gas */}
      <SensorDetailCard
        icon="⚗️"
        title="Gas / LPG Sensor"
        value={formatGasConcentration(reading.gas)}
        status={reading.gasStatus}
        color={gasColor}
        details={[
          { label: 'Concentration', value: formatGasConcentration(reading.gas) },
          { label: 'Status', value: reading.gasStatus },
          { label: 'Warning At', value: '300 ppm' },
          { label: 'Critical At', value: '600 ppm' },
        ]}
        theme={theme}
        chart={<MiniChart data={history.gas} color={gasColor} />}
      />

      {/* Flame */}
      <SensorDetailCard
        icon="🔥"
        title="Flame Sensor"
        value={reading.flameStatus}
        status={reading.flameStatus === 'EXTINGUISHED' ? 'CRITICAL' : reading.flameStatus === 'UNSTABLE' ? 'WARNING' : 'STABLE'}
        color={flameColor}
        details={[
          { label: 'Detected', value: reading.flame ? 'Yes' : 'No' },
          { label: 'Stability', value: reading.flameStatus },
          { label: 'Burner', value: reading.burnerStatus ? 'ON' : 'OFF' },
        ]}
        theme={theme}
        chart={<MiniChart data={history.flame} color={flameColor} />}
      />

      {/* Pressure */}
      <SensorDetailCard
        icon="📊"
        title="Pressure Sensor"
        value={formatPressure(reading.pressure)}
        status="NORMAL"
        color={theme.info}
        details={[
          { label: 'LPG Pressure', value: formatPressure(reading.pressure) },
          { label: 'Solenoid Valve', value: reading.solenoidValve },
          { label: 'Supply Status', value: reading.solenoidValve === 'OPEN' ? 'Active' : 'Shutoff' },
        ]}
        theme={theme}
      />

    </Animated.ScrollView>
  );
}

function SensorDetailCard({ icon, title, value, status, color, details, theme, chart }: any) {
  const statusColors: Record<string, string> = {
    NORMAL: theme.safe, STABLE: theme.safe,
    WARNING: theme.warning, STRONG: theme.warning, UNSTABLE: theme.warning,
    CRITICAL: theme.critical, EXTINGUISHED: theme.critical,
  };
  const sc = statusColors[status] ?? theme.info;

  return (
    <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.md]}>
      <View style={styles.detailHeader}>
        <View style={[styles.detailIconWrap, { backgroundColor: color + '18' }]}>
          <Text style={{ fontSize: 26 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.detailValue, { color }]}>{value}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: sc + '20', borderColor: sc + '50' }]}>
          <Text style={[styles.statusChipText, { color: sc }]}>{status}</Text>
        </View>
      </View>

      {chart}

      <View style={[styles.detailDivider, { backgroundColor: theme.divider }]} />
      <View style={styles.detailGrid}>
        {details.map((d: any) => (
          <View key={d.label} style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{d.label}</Text>
            <Text style={[styles.detailItemValue, { color: theme.textSecondary }]}>{d.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.base, paddingTop: 52, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pageTitle: { fontSize: Typography.xl, fontWeight: Typography.bold },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.8 },
  updated: { fontSize: Typography.xs, marginBottom: Spacing.base },
  detailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailIconWrap: {
    width: 50, height: 50, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  detailTitle: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  detailValue: { fontSize: Typography.xl, fontWeight: Typography.bold },
  statusChip: {
    borderRadius: BorderRadius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusChipText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5 },
  detailDivider: { height: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  detailItem: { minWidth: '45%', gap: 2 },
  detailLabel: { fontSize: Typography.xs, letterSpacing: 0.3 },
  detailItemValue: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
});
