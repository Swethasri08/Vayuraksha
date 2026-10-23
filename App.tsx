import 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { SensorProvider } from './src/context/SensorContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent() {
  const { theme, isDark } = useTheme();
  return (
    <View style={[styles.outerContainer, { backgroundColor: isDark ? '#05070E' : '#E2E8F0' }]}>
      <View style={[styles.innerContainer, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.background} />
        <SensorProvider>
          <RootNavigator />
        </SensorProvider>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 580, // Restricts boxes/cards from being overly wide on desktop displays
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});

