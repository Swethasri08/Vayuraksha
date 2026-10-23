import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform,
} from 'react-native';
import { useSensor } from '../context/SensorContext';
import { useTheme } from '../context/ThemeContext';
import { AlertCard } from '../components/AlertCard';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';
import { AlertSeverity } from '../types/alert';

type Filter = 'ALL' | AlertSeverity;

export function AlertsScreen() {
  const { theme } = useTheme();
  const { alerts, unreadCount, markAlertRead, markAllRead } = useSensor();
  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered = alerts.filter(a => filter === 'ALL' || a.severity === filter);

  const filters: Filter[] = ['ALL', 'CRITICAL', 'WARNING', 'INFO'];
  
  const getFilterStyle = (f: Filter, isActive: boolean) => {
    if (!isActive) {
      return {
        bg: theme.card,
        border: theme.cardBorder,
        text: theme.textSecondary,
      };
    }
    switch (f) {
      case 'CRITICAL':
        return { bg: '#EF4444', border: '#EF4444', text: '#FFFFFF' };
      case 'WARNING':
        return { bg: '#F59E0B', border: '#F59E0B', text: '#FFFFFF' };
      case 'INFO':
        return { bg: '#3B82F6', border: '#3B82F6', text: '#FFFFFF' };
      default:
        return { bg: theme.accent, border: theme.accent, text: '#FFFFFF' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Safety Alerts</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              style={[styles.markAllBtn, { borderColor: theme.accent + '50' }]}
            >
              <Text style={[styles.markAllText, { color: theme.accent }]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBanner, { backgroundColor: theme.critical + '15', borderColor: theme.critical + '30' }]}>
            <Text style={[styles.unreadText, { color: theme.critical }]}>
              🚨 {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} require attention
            </Text>
          </View>
        )}
      </View>

      {/* Filter chips bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map(f => {
            const isActive = filter === f;
            const styleConfig = getFilterStyle(f, isActive);
            let label = '';
            let dotColor = '';

            if (f === 'ALL') {
              label = `All (${alerts.length})`;
            } else if (f === 'CRITICAL') {
              label = 'Critical';
              dotColor = '#EF4444';
            } else if (f === 'WARNING') {
              label = 'Warning';
              dotColor = '#F59E0B';
            } else if (f === 'INFO') {
              label = 'Info';
              dotColor = '#3B82F6';
            }

            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: styleConfig.bg,
                    borderColor: styleConfig.border,
                  },
                ]}
                onPress={() => setFilter(f)}
              >
                {dotColor !== '' && (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isActive ? '#FFFFFF' : dotColor },
                    ]}
                  />
                )}
                <Text style={[styles.filterText, { color: styleConfig.text }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Alert list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onMarkRead={markAlertRead}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No alerts</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {filter === 'ALL' ? 'All systems are operating normally.' : `No ${filter.toLowerCase()} alerts.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.base, paddingTop: 52, borderBottomWidth: 1, gap: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  markAllBtn: { borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: 14, paddingVertical: 6 },
  markAllText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
  unreadBanner: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
  },
  unreadText: { fontSize: Typography.sm, fontWeight: Typography.medium },
  filterContainer: {
    paddingVertical: 12,
  },
  filterScrollContent: {
    paddingHorizontal: Spacing.base,
    gap: 10,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  list: { padding: Spacing.base, paddingBottom: 100 },
  empty: { alignItems: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontSize: Typography.lg, fontWeight: Typography.bold },
  emptyText: { fontSize: Typography.sm, textAlign: 'center' },
});
