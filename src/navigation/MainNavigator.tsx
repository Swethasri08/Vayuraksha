import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useSensor } from '../context/SensorContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MonitoringScreen } from '../screens/MonitoringScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BurnerControlScreen } from '../screens/BurnerControlScreen';
import { DeviceStatusScreen } from '../screens/DeviceStatusScreen';
import { Typography } from '../theme/typography';

const Tab = createBottomTabNavigator();
const SettingsStack = createStackNavigator();

function SettingsStackNav() {
  const { theme } = useTheme();
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="Device" component={DeviceStatusScreen} />
      <SettingsStack.Screen name="Control" component={BurnerControlScreen} />
    </SettingsStack.Navigator>
  );
}

function TabIcon({ emoji, label, focused, color, unreadCount }: {
  emoji: string; label: string; focused: boolean; color: string; unreadCount?: number;
}) {
  return (
    <View style={styles.tabIcon}>
      <View style={{ position: 'relative' }}>
        <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
        {(unreadCount ?? 0) > 0 && (
          <View style={[styles.tabBadge, { backgroundColor: '#D32F2F' }]}>
            <Text style={styles.tabBadgeText}>{unreadCount! > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color, fontWeight: focused ? '700' : '400', fontSize: focused ? 10 : 9 }]}>
        {label}
      </Text>
    </View>
  );
}

export function MainNavigator() {
  const { theme } = useTheme();
  const { unreadCount } = useSensor();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Monitor"
        component={MonitoringScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📊" label="Monitor" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} color={color} unreadCount={unreadCount} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📈" label="History" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNav}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { letterSpacing: 0.2 },
  tabBadge: {
    position: 'absolute', top: -4, right: -8,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
