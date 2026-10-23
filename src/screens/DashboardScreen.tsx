import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { SensorCard } from '../components/SensorCard';
import { InlineLoader } from '../components/LoadingOverlay';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import {
  formatTemperature, formatWindSpeed, formatGasConcentration,
  formatPressure, formatBattery, formatRelativeTime,
} from '../utils/formatters';
import { getStatusMessage } from '../utils/safetyLogic';
import { DEVICE_NAME } from '../utils/constants';

export function DashboardScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const { reading, alerts, unreadCount, isConnected } = useSensor();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const statusColors: Record<string, [string, string]> = {
    SAFE:     ['#00C85320', '#0A0E1A00'],
    WARNING:  ['#FF8F0020', '#0A0E1A00'],
    CRITICAL: ['#D32F2F30', '#0A0E1A00'],
    UNKNOWN:  ['#4F8EF720', '#0A0E1A00'],
  };

  const statusGrad = statusColors[reading?.systemStatus ?? 'UNKNOWN'];
  const firstName = user?.displayName?.split(' ')[0] ?? 'Engineer';

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: theme.background }, { opacity: fadeAnim }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#071430', '#0A0E1A'] : ['#EEF2FF', '#F5F7FF']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>Good day, {firstName} 👋</Text>
              <Text style={[styles.deviceName, { color: theme.textPrimary }]}>{DEVICE_NAME}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')} style={styles.alertBell}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.critical }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Connection status */}
          <View style={[styles.connRow, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.connDot, { backgroundColor: isConnected ? theme.safe : theme.critical }]} />
            <Text style={[styles.connText, { color: theme.textSecondary }]}>
              {isConnected ? '5G Connected • DEMO MODE' : 'Disconnected'}
            </Text>
            {reading && (
              <Text style={[styles.lastUpdate, { color: theme.textMuted }]}>
                {formatRelativeTime(reading.timestamp)}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* System Status Card */}
        {reading ? (
          <LinearGradient
            colors={statusGrad}
            style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.lg]}
          >
            <View style={styles.statusHeader}>
              <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>System Status</Text>
              <StatusBadge status={reading.systemStatus} size="md" />
            </View>
            <Text style={[styles.statusMessage, { color: theme.textSecondary }]}>
              {getStatusMessage(reading)}
            </Text>
            <View style={[styles.statusDivider, { backgroundColor: theme.divider }]} />
            <View style={styles.statusGrid}>
              <StatusItem icon="🔥" label="Burner" value={reading.burnerStatus ? 'ON' : 'OFF'} color={reading.burnerStatus ? theme.safe : theme.textMuted} theme={theme} />
              <StatusItem icon="💧" label="Solenoid" value={reading.solenoidValve} color={reading.solenoidValve === 'OPEN' ? theme.safe : theme.critical} theme={theme} />
              <StatusItem icon="⚙️" label="Stabilizer" value={reading.stabilization ? 'ACTIVE' : 'IDLE'} color={reading.stabilization ? theme.warning : theme.textMuted} theme={theme} />
              <StatusItem icon="📡" label="Signal" value={`${reading.signalStrength}%`} color={theme.info} theme={theme} />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: 'center', justifyContent: 'center' }, Shadows.lg]}>
            <InlineLoader />
            <Text style={[{ color: theme.textSecondary, marginTop: 12 }]}>Connecting to VayuRaksha-001...</Text>
          </View>
        )}

        {/* Sensor Cards Grid */}
        {reading && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Live Sensor Readings</Text>
            <View style={styles.grid}>
              <SensorCard
                icon="🌡️" label="Temperature"
                value={formatTemperature(reading.temperature)}
                status={reading.temperature >= 80 ? 'critical' : reading.temperature >= 60 ? 'warning' : 'safe'}
                subValue={reading.temperature >= 60 ? '⚠️ Above threshold' : '✓ Normal range'}
              />
              <SensorCard
                icon="💨" label="Wind Speed"
                value={formatWindSpeed(reading.wind)}
                status={reading.windStatus === 'STRONG' ? 'warning' : 'safe'}
                subValue={reading.windStatus === 'STRONG' ? '⚠️ Strong wind' : '✓ Normal'}
              />
              <SensorCard
                icon="🔥" label="Flame"
                value={reading.flameStatus}
                status={reading.flameStatus === 'EXTINGUISHED' ? 'critical' : reading.flameStatus === 'UNSTABLE' ? 'warning' : 'safe'}
                subValue={reading.flame ? '✓ Detected' : '✗ Not detected'}
              />
              <SensorCard
                icon="⚗️" label="Gas (LPG)"
                value={formatGasConcentration(reading.gas)}
                status={reading.gasStatus === 'CRITICAL' ? 'critical' : reading.gasStatus === 'WARNING' ? 'warning' : 'safe'}
                subValue={reading.gasStatus !== 'NORMAL' ? '⚠️ Elevated' : '✓ Normal'}
              />
              <SensorCard
                icon="📊" label="Pressure"
                value={formatPressure(reading.pressure)}
                status="info"
                subValue="LPG supply"
              />
              <SensorCard
                icon="🔋" label="Battery"
                value={formatBattery(reading.battery)}
                status={reading.battery < 20 ? 'warning' : 'safe'}
                subValue={reading.battery < 20 ? '⚠️ Low battery' : '✓ Good'}
              />
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickAction icon="📊" label="Live Monitor" color={theme.accent} onPress={() => navigation.navigate('Monitor')} theme={theme} />
              <QuickAction icon="🎛️" label="Burner Control" color={theme.warning} onPress={() => navigation.navigate('Control')} theme={theme} />
              <QuickAction icon="📈" label="History" color={theme.info} onPress={() => navigation.navigate('History')} theme={theme} />
              <QuickAction icon="📱" label="Device Info" color={theme.safe} onPress={() => navigation.navigate('Device')} theme={theme} />
            </View>
          </>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function StatusItem({ icon, label, value, color, theme }: any) {
  return (
    <View style={styles.statusItem}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.statusItemLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statusItemValue, { color }]}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress, theme }: any) {
  return (
    <TouchableOpacity
      style={[styles.qaBtn, { backgroundColor: theme.card, borderColor: color + '40' }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.qaIcon}>{icon}</Text>
      <Text style={[styles.qaLabel, { color: theme.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  header: { padding: Spacing.base, paddingTop: 52, gap: Spacing.sm },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: Typography.sm },
  deviceName: { fontSize: Typography.lg, fontWeight: Typography.bold },
  alertBell: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  connRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connText: { fontSize: Typography.xs, flex: 1 },
  lastUpdate: { fontSize: Typography.xs },
  statusCard: {
    margin: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTitle: { fontSize: Typography.md, fontWeight: Typography.bold },
  statusMessage: { fontSize: Typography.sm, lineHeight: 20 },
  statusDivider: { height: 1 },
  statusGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statusItem: { alignItems: 'center', gap: 3 },
  statusItemLabel: { fontSize: 10, letterSpacing: 0.3 },
  statusItemValue: { fontSize: Typography.xs, fontWeight: Typography.bold },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    gap: 0,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    gap: 10,
  },
  qaBtn: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: { fontSize: 28 },
  qaLabel: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
});
