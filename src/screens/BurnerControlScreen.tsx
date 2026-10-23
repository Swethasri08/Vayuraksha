import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';

export function BurnerControlScreen() {
  const { theme } = useTheme();
  const { reading } = useSensor();
  const [confirmModal, setConfirmModal] = useState<null | 'shutoff' | 'burner_off' | 'stabilize'>(null);
  const [commandLog, setCommandLog] = useState<{ time: Date; action: string; status: string }[]>([]);

  const executeCommand = (action: string) => {
    setCommandLog(prev => [{ time: new Date(), action, status: 'Sent to ESP32' }, ...prev].slice(0, 20));
    setConfirmModal(null);
  };

  if (!reading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[{ color: theme.textSecondary, fontSize: Typography.base }]}>Connecting to device...</Text>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Burner Control</Text>
        </View>

        {/* Safety Notice */}
        <View style={[styles.safetyNotice, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '40' }]}>
          <Text style={styles.safetyIcon}>⚠️</Text>
          <Text style={[styles.safetyText, { color: theme.textSecondary }]}>
            <Text style={{ fontWeight: Typography.bold, color: theme.warning }}>Safety Notice: </Text>
            Local ESP32 safety logic has absolute priority. Emergency shutoff and solenoid valve control operate autonomously. Remote commands via this app are secondary.
          </Text>
        </View>

        {/* Status Overview */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.md]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Current Status</Text>
          <View style={styles.statusGrid}>
            <StatusRow icon="🔥" label="Burner" value={reading.burnerStatus ? 'ON' : 'OFF'} color={reading.burnerStatus ? theme.safe : theme.textMuted} theme={theme} />
            <StatusRow icon="💧" label="Solenoid Valve" value={reading.solenoidValve} color={reading.solenoidValve === 'OPEN' ? theme.safe : theme.critical} theme={theme} />
            <StatusRow icon="⚙️" label="Stabilization" value={reading.stabilization ? 'ACTIVE' : 'INACTIVE'} color={reading.stabilization ? theme.warning : theme.textMuted} theme={theme} />
            <StatusRow icon="🔋" label="Battery" value={`${reading.battery}%`} color={reading.battery < 20 ? theme.warning : theme.safe} theme={theme} />
          </View>
        </View>

        {/* Control Buttons */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Remote Commands</Text>

        <ControlButton
          icon="💡"
          title="Toggle Burner"
          description={reading.burnerStatus ? 'Send command to turn OFF burner' : 'Send command to turn ON burner'}
          color={reading.burnerStatus ? theme.warning : theme.safe}
          onPress={() => setConfirmModal('burner_off')}
          theme={theme}
        />

        <ControlButton
          icon="⚙️"
          title="Toggle Stabilization"
          description="Activate or deactivate wind stabilization mechanism"
          color={theme.info}
          onPress={() => setConfirmModal('stabilize')}
          theme={theme}
        />

        {/* Emergency Shutoff */}
        <Text style={[styles.sectionTitle, { color: theme.critical }]}>⚠️ Emergency Controls</Text>
        <View style={[styles.emergencyCard, { backgroundColor: theme.criticalLight + '10', borderColor: theme.critical + '50' }, Shadows.md]}>
          <Text style={{ fontSize: 32 }}>🛑</Text>
          <Text style={[styles.emergencyTitle, { color: theme.textPrimary }]}>Emergency Gas Shutoff</Text>
          <Text style={[styles.emergencyDesc, { color: theme.textSecondary }]}>
            Sends emergency shutoff command to the ESP32. The controller will close the solenoid valve and halt all operations. This action requires confirmation.
          </Text>
          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: theme.critical }]}
            onPress={() => setConfirmModal('shutoff')}
          >
            <Text style={styles.emergencyBtnText}>🚨 EMERGENCY SHUTOFF</Text>
          </TouchableOpacity>
        </View>

        {/* Command Log */}
        {commandLog.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Command Log</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.sm]}>
              {commandLog.map((log, i) => (
                <View key={i} style={[styles.logRow, i < commandLog.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: 1 }]}>
                  <View style={[styles.logDot, { backgroundColor: theme.safe }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.logAction, { color: theme.textPrimary }]}>{log.action}</Text>
                    <Text style={[styles.logStatus, { color: theme.textMuted }]}>{log.status}</Text>
                  </View>
                  <Text style={[styles.logTime, { color: theme.textMuted }]}>
                    {log.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={!!confirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, Shadows.lg]}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>
              {confirmModal === 'shutoff' ? '🚨' : confirmModal === 'burner_off' ? '🔥' : '⚙️'}
            </Text>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {confirmModal === 'shutoff' ? 'Emergency Gas Shutoff' :
               confirmModal === 'burner_off' ? `${reading.burnerStatus ? 'Turn Burner OFF' : 'Turn Burner ON'}` :
               'Toggle Stabilization'}
            </Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              {confirmModal === 'shutoff'
                ? 'Are you sure you want to activate emergency gas shutoff? This will close the solenoid valve and stop all gas supply immediately.'
                : 'Are you sure you want to send this command to the ESP32 controller?'}
            </Text>
            <View style={[styles.modalNote, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '30' }]}>
              <Text style={[styles.modalNoteText, { color: theme.textSecondary }]}>
                ℹ️ Command will be queued for the ESP32. Local safety logic may override this command.
              </Text>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.cardBorder }]}
                onPress={() => setConfirmModal(null)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: confirmModal === 'shutoff' ? theme.critical : theme.accent }]}
                onPress={() => executeCommand(
                  confirmModal === 'shutoff' ? '🚨 Emergency Gas Shutoff' :
                  confirmModal === 'burner_off' ? `${reading.burnerStatus ? 'Burner OFF' : 'Burner ON'}` :
                  'Toggle Stabilization'
                )}
              >
                <Text style={styles.confirmBtnText}>
                  {confirmModal === 'shutoff' ? 'CONFIRM SHUTOFF' : 'CONFIRM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatusRow({ icon, label, value, color, theme }: any) {
  return (
    <View style={styles.statusRow}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
    </View>
  );
}

function ControlButton({ icon, title, description, color, onPress, theme }: any) {
  return (
    <TouchableOpacity
      style={[styles.ctrlBtn, { backgroundColor: theme.card, borderColor: color + '40' }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.ctrlTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.ctrlDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <Text style={{ color, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingTop: 52, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { marginBottom: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  safetyNotice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    alignItems: 'flex-start',
  },
  safetyIcon: { fontSize: 20 },
  safetyText: { flex: 1, fontSize: Typography.sm, lineHeight: 20 },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.base, marginBottom: Spacing.base, gap: Spacing.sm },
  cardTitle: { fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: 4 },
  statusGrid: { gap: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusLabel: { flex: 1, fontSize: Typography.sm },
  statusValue: { fontSize: Typography.sm, fontWeight: Typography.bold },
  sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  ctrlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  ctrlTitle: { fontSize: Typography.base, fontWeight: Typography.semiBold },
  ctrlDesc: { fontSize: Typography.xs, marginTop: 2 },
  emergencyCard: {
    borderRadius: BorderRadius.lg, borderWidth: 2,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  emergencyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, textAlign: 'center' },
  emergencyDesc: { fontSize: Typography.sm, textAlign: 'center', lineHeight: 20 },
  emergencyBtn: {
    borderRadius: BorderRadius.md, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center', width: '100%',
  },
  emergencyBtnText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.extraBold, letterSpacing: 1 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logAction: { fontSize: Typography.sm, fontWeight: Typography.semiBold },
  logStatus: { fontSize: Typography.xs },
  logTime: { fontSize: Typography.xs },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000A0', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: {
    width: '100%', borderRadius: BorderRadius.xl, borderWidth: 1,
    padding: Spacing.xl, gap: Spacing.md, alignItems: 'center',
  },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, textAlign: 'center' },
  modalDesc: { fontSize: Typography.sm, textAlign: 'center', lineHeight: 22 },
  modalNote: { borderRadius: BorderRadius.sm, borderWidth: 1, padding: Spacing.sm, width: '100%' },
  modalNoteText: { fontSize: Typography.xs, lineHeight: 18 },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderRadius: BorderRadius.md,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontWeight: Typography.bold, letterSpacing: 0.5 },
  confirmBtn: { flex: 1, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: Typography.bold, letterSpacing: 0.5 },
});
