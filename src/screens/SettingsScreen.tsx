import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSensor } from '../context/SensorContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { DemoScenario } from '../services/mockSensorService';
import { APP_VERSION } from '../utils/constants';

export function SettingsScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { scenario, setScenario } = useSensor();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [tempWarn, setTempWarn] = useState('60');
  const [tempCrit, setTempCrit] = useState('80');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const scenarios: DemoScenario[] = ['NORMAL', 'STRONG_WIND', 'FLAME_FAILURE', 'GAS_LEAKAGE', 'HIGH_TEMP'];
  const scenarioConfig: Record<DemoScenario, { icon: string; label: string; color: string }> = {
    NORMAL:       { icon: '🟢', label: 'Normal (SAFE)', color: theme.safe },
    STRONG_WIND:  { icon: '💨', label: 'Strong Wind (WARNING)', color: theme.warning },
    FLAME_FAILURE:{ icon: '🔥', label: 'Flame Failure (CRITICAL)', color: theme.critical },
    GAS_LEAKAGE:  { icon: '⚗️', label: 'Gas Leakage (CRITICAL)', color: theme.critical },
    HIGH_TEMP:    { icon: '🌡️', label: 'High Temperature (WARNING)', color: theme.warning },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>

      {/* User Profile */}
      <View style={[styles.profileCard, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '30' }, Shadows.sm]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: theme.textPrimary }]}>{user?.displayName ?? 'VayuRaksha User'}</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.accent + '30' }]}>
            <Text style={[styles.roleText, { color: theme.accent }]}>Authorized Engineer</Text>
          </View>
        </View>
      </View>

      {/* Appearance */}
      <SectionHeader title="Appearance" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <SettingRow
          icon={isDark ? '🌙' : '☀️'}
          label="Dark Mode"
          right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.accent }} thumbColor="#fff" />}
          theme={theme}
        />
      </View>

      {/* Notifications */}
      <SectionHeader title="Notifications" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <SettingRow icon="🔔" label="Push Notifications"
          right={<Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ true: theme.accent }} thumbColor="#fff" />}
          theme={theme} />
        <SettingRow icon="🚨" label="Critical Alerts Only"
          right={<Switch value={criticalOnly} onValueChange={setCriticalOnly} trackColor={{ true: theme.accent }} thumbColor="#fff" />}
          theme={theme} />
      </View>

      {/* Safety Thresholds */}
      <SectionHeader title="Safety Thresholds" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <ThresholdInput icon="🟡" label="Temperature Warning (°C)" value={tempWarn} onChange={setTempWarn} theme={theme} />
        <ThresholdInput icon="🔴" label="Temperature Critical (°C)" value={tempCrit} onChange={setTempCrit} theme={theme} />
      </View>

      {/* Device */}
      <SectionHeader title="Device" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Device')}>
          <Text style={{ fontSize: 20 }}>📟</Text>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Device Status</Text>
          <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('Control')}>
          <Text style={{ fontSize: 20 }}>🎛️</Text>
          <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Burner Control</Text>
          <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Scenarios */}
      <SectionHeader title="🎭 Demo Scenarios" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <Text style={[styles.demoNote, { color: theme.textMuted }]}>
          Trigger simulated events for demonstration. Scenarios auto-reset to NORMAL after 15 seconds.
        </Text>
        {scenarios.map(s => {
          const cfg = scenarioConfig[s];
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.scenarioBtn,
                {
                  backgroundColor: scenario === s ? cfg.color + '20' : theme.elevated,
                  borderColor: scenario === s ? cfg.color + '60' : theme.divider,
                }
              ]}
              onPress={() => setScenario(s)}
            >
              <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
              <Text style={[styles.scenarioLabel, { color: scenario === s ? cfg.color : theme.textSecondary }]}>
                {cfg.label}
              </Text>
              {scenario === s && (
                <View style={[styles.activeDot, { backgroundColor: cfg.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* About */}
      <SectionHeader title="About" theme={theme} />
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
        <SettingRow icon="ℹ️" label="Version" right={<Text style={[{ color: theme.textMuted, fontSize: Typography.sm }]}>{APP_VERSION}</Text>} theme={theme} />
        <SettingRow icon="🛡️" label="Mode" right={<Text style={[{ color: theme.info, fontSize: Typography.sm }]}>Demo / Mock</Text>} theme={theme} />
        <SettingRow icon="⚡" label="Powered by" right={<Text style={[{ color: theme.textMuted, fontSize: Typography.sm }]}>ESP32 + 5G + Firebase</Text>} theme={theme} />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: theme.criticalLight + '15', borderColor: theme.critical + '40' }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: theme.critical }]}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionHeader({ title, theme }: any) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
  );
}

function SettingRow({ icon, label, right, theme }: any) {
  return (
    <View style={styles.settingRow}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{label}</Text>
      {right}
    </View>
  );
}

function ThresholdInput({ icon, label, value, onChange, theme }: any) {
  return (
    <View style={styles.threshRow}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.threshLabel, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        style={[styles.threshInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        maxLength={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.base, paddingTop: 52, paddingBottom: 100 },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: Spacing.base },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.lg, borderWidth: 1,
    padding: Spacing.base, marginBottom: Spacing.base,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold },
  profileName: { fontSize: Typography.base, fontWeight: Typography.bold },
  profileEmail: { fontSize: Typography.xs, marginBottom: 4 },
  roleBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: Typography.bold },
  sectionTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.xs, marginTop: Spacing.md },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base,
    borderBottomWidth: 0,
  },
  settingLabel: { flex: 1, fontSize: Typography.sm },
  chevron: { fontSize: 22 },
  demoNote: { fontSize: Typography.xs, lineHeight: 18, padding: Spacing.sm, paddingBottom: 0 },
  scenarioBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1,
    margin: Spacing.xs, padding: Spacing.sm,
  },
  scenarioLabel: { flex: 1, fontSize: Typography.sm, fontWeight: Typography.medium },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  threshRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base },
  threshLabel: { flex: 1, fontSize: Typography.sm },
  threshInput: {
    borderRadius: BorderRadius.sm, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
    width: 70, textAlign: 'center',
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
  },
  logoutBtn: {
    borderRadius: BorderRadius.lg, borderWidth: 1,
    paddingVertical: 14, alignItems: 'center',
    marginTop: Spacing.base,
  },
  logoutText: { fontSize: Typography.base, fontWeight: Typography.bold },
});
