// VayuRaksha Color System
// Safety-focused palette for IoT/industrial dashboard

export const SafetyColors = {
  safe: '#00C853',       // Green - SAFE
  safeLight: '#B9F6CA',
  warning: '#FF8F00',    // Amber - WARNING
  warningLight: '#FFE0B2',
  critical: '#D32F2F',   // Red - CRITICAL
  criticalLight: '#FFCDD2',
  info: '#0288D1',       // Blue - INFO/CONNECTED
  infoLight: '#B3E5FC',
};

export const DarkTheme = {
  // Backgrounds
  background: '#0A0E1A',
  surface: '#111827',
  card: '#1C2538',
  cardBorder: '#2A3550',
  elevated: '#243044',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#8A9BC0',
  textMuted: '#4A5780',
  textInverse: '#0A0E1A',

  // Accent
  accent: '#4F8EF7',
  accentLight: '#1A2F55',

  // Status
  ...SafetyColors,

  // UI Elements
  divider: '#1E2A45',
  inputBackground: '#162033',
  inputBorder: '#2A3550',
  shadow: '#000000',

  // Tab bar
  tabBar: '#111827',
  tabBarBorder: '#1E2A45',
  tabActive: '#4F8EF7',
  tabInactive: '#4A5780',

  // Status bar
  statusBar: 'light',
};

export const LightTheme = {
  // Backgrounds
  background: '#F0F4FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#DDE5F8',
  elevated: '#EEF2FF',

  // Text
  textPrimary: '#0D1B3E',
  textSecondary: '#4A5780',
  textMuted: '#8A9BC0',
  textInverse: '#FFFFFF',

  // Accent
  accent: '#1F5EE8',
  accentLight: '#E8EEFF',

  // Status
  ...SafetyColors,

  // UI Elements
  divider: '#DDE5F8',
  inputBackground: '#F5F7FF',
  inputBorder: '#C5D0EE',
  shadow: '#8A9BC0',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#DDE5F8',
  tabActive: '#1F5EE8',
  tabInactive: '#8A9BC0',

  // Status bar
  statusBar: 'dark',
};

export type Theme = typeof DarkTheme;
