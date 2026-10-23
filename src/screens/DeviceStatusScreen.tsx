import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { formatRelativeTime } from '../utils/formatters';
import { DEVICE_NAME, FIRMWARE_VERSION } from '../utils/constants';

export function DeviceStatusScreen() {
  const { theme } = useTheme();
  const { reading, isConnected } = useSensor();

  const connColor = isConnected ? theme.safe : theme.critical;
  const connLabel = isConnected ? 'Connected' : 'Disconnected';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>Device Status</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Hardware & connectivity information</Text>

      {/* Device Identity */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.md]}>
        <View style={styles.deviceHeader}>
          <View style={[styles.deviceIcon, { backgroundColor: theme.accentLight }]}>
            <Text style={{ fontSize: 36 }}>📟</Text>
          </View>
          <View>
            <Text style={[styles.deviceName, { color: theme.textPrimary }]}>{DEVICE_NAME}</Text>
            <Text style={[styles.firmwareText, { color: theme.textSecondary }]}>Firmware {FIRMWARE_VERSION}</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <InfoRow icon="🆔" label="Device ID" value={DEVICE_NAME} theme={theme} />
        <InfoRow icon="📦" label="Firmware" value={FIRMWARE_VERSION} theme={theme} />
        <InfoRow icon="🕐" label="Last Seen" value={reading ? formatRelativeTime(reading.timestamp) : 'N/A'} theme={theme} />
      </View>

      {/* Connection Status */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.md]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Connectivity</Text>
        <ConnRow icon="🔌" label="ESP32 MCU" status={connLabel} color={connColor} theme={theme} />
        <ConnRow icon="📡" label="5G Module" status={isConnected ? 'Online' : 'Offline'} color={connColor} theme={theme} />
        <ConnRow icon="☁️" label="Firebase Cloud" status={isConnected ? 'Connected' : 'Unreachable'} color={connColor} theme={theme} />
        <ConnRow icon="📲" label="Mobile App" status="Active (Demo Mode)" color={theme.safe} theme={theme} />
      </View>

      {/* Hardware Metrics */}
      {reading && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.md]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Hardware Metrics</Text>

          {/* Battery bar */}
          <View style={styles.metricItem}>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>🔋 Battery Level</Text>
              <Text style={[styles.metricValue, { color: reading.battery < 20 ? theme.warning : theme.safe }]}>
                {reading.battery}%
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.elevated }]}>
              <View style={[styles.barFill, { width: `${reading.battery}%` as any, backgroundColor: reading.battery < 20 ? theme.warning : theme.safe }]} />
            </View>
          </View>

          {/* Signal bar */}
          <View style={styles.metricItem}>
            <View style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>📶 Signal Strength</Text>
              <Text style={[styles.metricValue, { color: reading.signalStrength < 40 ? theme.warning : theme.info }]}>
                {reading.signalStrength}%
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.elevated }]}>
              <View style={[styles.barFill, { width: `${reading.signalStrength}%` as any, backgroundColor: theme.info }]} />
            </View>
          </View>

          <InfoRow icon="🌡️" label="CPU Temperature" value="42°C (approx.)" theme={theme} />
          <InfoRow icon="⏱️" label="Uptime" value="14h 32m" theme={theme} />
        </View>
      )}

      {/* Sensors List */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Connected Sensors</Text>
        {[
          { icon: '🌡️', name: 'DS18B20 Temperature Sensor', status: 'OK' },
          { icon: '💨', name: 'Anemometer Wind Sensor', status: 'OK' },
          { icon: '🔥', name: 'IR Flame Sensor', status: 'OK' },
          { icon: '⚗️', name: 'MQ-6 LPG Gas Sensor', status: 'OK' },
          { icon: '📊', name: 'Pressure Transducer', status: 'OK' },
          { icon: '💧', name: 'Solenoid Valve (12V)', status: 'OK' },
          { icon: '⚙️', name: 'Stabilization Actuator', status: 'OK' },
        ].map((s, i, arr) => (
          <View
            key={s.name}
            style={[
              styles.sensorRow,
              i < arr.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: 1 }
            ]}
          >
            <Text style={{ fontSize: 18 }}>{s.icon}</Text>
            <Text style={[styles.sensorName, { color: theme.textSecondary }]}>{s.name}</Text>
            <View style={[styles.okBadge, { backgroundColor: theme.safe + '20' }]}>
              <Text style={[styles.okText, { color: theme.safe }]}>✓ {s.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, theme }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function ConnRow({ icon, label, status, color, theme }: any) {
  return (
    <View style={styles.connRow}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.connLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.statusChip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.base, paddingTop: 52, paddingBottom: 100 },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: 4 },
  sub: { fontSize: Typography.sm, marginBottom: Spacing.base },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.sm },
  cardTitle: { fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: 4 },
  deviceHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  deviceIcon: { width: 64, height: 64, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: Typography.lg, fontWeight: Typography.bold },
  firmwareText: { fontSize: Typography.xs },
  divider: { height: 1, marginVertical: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoLabel: { flex: 1, fontSize: Typography.sm },
  infoValue: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  connLabel: { flex: 1, fontSize: Typography.sm },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: BorderRadius.full, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  metricItem: { gap: 6 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { fontSize: Typography.sm },
  metricValue: { fontSize: Typography.sm, fontWeight: Typography.bold },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  sensorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  sensorName: { flex: 1, fontSize: Typography.sm },
  okBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  okText: { fontSize: Typography.xs, fontWeight: Typography.bold },
});
