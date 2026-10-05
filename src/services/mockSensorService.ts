/**
 * MockSensorService
 *
 * Generates realistic simulated sensor data for demo/development mode.
 * This service replaces the real Firebase/ESP32 data source and can be
 * swapped out without changing any UI components.
 *
 * Scenarios:
 *   'NORMAL'        - All sensors nominal
 *   'STRONG_WIND'   - Wind disturbance + flame instability
 *   'FLAME_FAILURE' - Flame extinguished, solenoid closed
 *   'GAS_LEAKAGE'   - Gas detected, solenoid closed, CRITICAL
 *   'HIGH_TEMP'     - Temperature above warning threshold
 */

import {
  SensorReading,
  FlameStatus,
  GasStatus,
  WindStatus,
  SolenoidStatus,
  DataPoint,
  SensorHistory,
} from '../types/sensor';
import { deriveSystemStatus } from '../utils/safetyLogic';
import { Alert, AlertType, AlertSeverity } from '../types/alert';
import { DEVICE_ID, MAX_GRAPH_POINTS } from '../utils/constants';
import { clamp, lerp } from '../utils/formatters';

export type DemoScenario = 'NORMAL' | 'STRONG_WIND' | 'FLAME_FAILURE' | 'GAS_LEAKAGE' | 'HIGH_TEMP';

// Internal state
let currentScenario: DemoScenario = 'NORMAL';
let temperature = 42.0;
let windSpeed = 3.5;
let gasConcentration = 85.0;
let pressure = 1.03;
let battery = 87;
let signalStrength = 92;
let burnerOn = true;
let stabilizationActive = false;
let listeners: Array<(reading: SensorReading) => void> = [];
let alertListeners: Array<(alerts: Alert[]) => void> = [];
let historyListeners: Array<(history: SensorHistory) => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let scenarioTimeout: ReturnType<typeof setTimeout> | null = null;

// In-memory alert log
let mockAlerts: Alert[] = [
  {
    id: '1',
    deviceId: DEVICE_ID,
    type: 'STRONG_WIND',
    severity: 'WARNING',
    title: 'Strong Wind Detected',
    message: 'Wind disturbance detected near the burner. Stabilization mechanism activated.',
    recommendedAction: 'Monitor flame stability. Check outdoor conditions.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '2',
    deviceId: DEVICE_ID,
    type: 'HIGH_TEMPERATURE',
    severity: 'WARNING',
    title: 'High Temperature Warning',
    message: 'Burner temperature has exceeded the configured warning threshold (60°C).',
    recommendedAction: 'Reduce flame intensity or improve ventilation.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    deviceId: DEVICE_ID,
    type: 'SYSTEM_RESTORED',
    severity: 'INFO',
    title: 'System Restored',
    message: 'All sensor readings have returned to normal operating conditions.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: true,
  },
];

// In-memory history
let history: SensorHistory = {
  temperature: generateInitialHistory(42, 8),
  wind: generateInitialHistory(4, 3),
  gas: generateInitialHistory(90, 30),
  flame: generateInitialHistory(1, 0),
};

function generateInitialHistory(base: number, variance: number): DataPoint[] {
  const now = Date.now();
  return Array.from({ length: MAX_GRAPH_POINTS }, (_, i) => ({
    timestamp: now - (MAX_GRAPH_POINTS - i) * 2500,
    value: clamp(base + (Math.random() - 0.5) * variance * 2, 0, base * 2),
  }));
}

function pushHistoryPoint(arr: DataPoint[], value: number): DataPoint[] {
  const updated = [...arr, { timestamp: Date.now(), value }];
  return updated.length > MAX_GRAPH_POINTS ? updated.slice(-MAX_GRAPH_POINTS) : updated;
}

function buildReading(): SensorReading {
  let flameDetected = true;
  let flameStatus: FlameStatus = 'STABLE';
  let gasStatus: GasStatus = 'NORMAL';
  let windStatus: WindStatus = 'NORMAL';
  let solenoidValve: SolenoidStatus = 'OPEN';

  switch (currentScenario) {
    case 'STRONG_WIND':
      windStatus = 'STRONG';
      flameStatus = 'UNSTABLE';
      stabilizationActive = true;
      solenoidValve = 'OPEN';
      windSpeed = lerp(windSpeed, 28, 0.05) + (Math.random() - 0.5) * 2;
      temperature = lerp(temperature, 48, 0.02) + (Math.random() - 0.5) * 0.5;
      break;

    case 'FLAME_FAILURE':
      flameDetected = false;
      flameStatus = 'EXTINGUISHED';
      solenoidValve = 'CLOSED';
      burnerOn = false;
      windSpeed = lerp(windSpeed, 18, 0.04) + (Math.random() - 0.5) * 1;
      temperature = lerp(temperature, 35, 0.03);
      break;

    case 'GAS_LEAKAGE':
      gasConcentration = lerp(gasConcentration, 750, 0.06) + (Math.random() - 0.5) * 10;
      gasStatus = gasConcentration > 600 ? 'CRITICAL' : gasConcentration > 300 ? 'WARNING' : 'NORMAL';
      solenoidValve = 'CLOSED';
      burnerOn = false;
      temperature = lerp(temperature, 44, 0.01) + (Math.random() - 0.5) * 0.3;
      break;

    case 'HIGH_TEMP':
      temperature = lerp(temperature, 85, 0.04) + (Math.random() - 0.5) * 1;
      windSpeed = lerp(windSpeed, 5, 0.05) + (Math.random() - 0.5) * 0.5;
      break;

    case 'NORMAL':
    default:
      stabilizationActive = false;
      burnerOn = true;
      solenoidValve = 'OPEN';
      temperature = lerp(temperature, 42, 0.05) + (Math.random() - 0.5) * 0.8;
      windSpeed = lerp(windSpeed, 3.5, 0.05) + (Math.random() - 0.5) * 0.5;
      gasConcentration = lerp(gasConcentration, 85, 0.05) + (Math.random() - 0.5) * 8;
      break;
  }

  // Clamp values to realistic ranges
  temperature = clamp(temperature, 20, 120);
  windSpeed = clamp(windSpeed, 0, 50);
  gasConcentration = clamp(gasConcentration, 0, 1000);
  pressure = clamp(pressure + (Math.random() - 0.5) * 0.01, 0.8, 1.5);
  battery = clamp(battery - 0.001 + (Math.random() < 0.001 ? 5 : 0), 10, 100);
  signalStrength = clamp(signalStrength + (Math.random() - 0.5) * 2, 40, 100);

  // Derive statuses from scenario overrides + thresholds
  if (currentScenario === 'NORMAL') {
    gasStatus = gasConcentration > 600 ? 'CRITICAL' : gasConcentration > 300 ? 'WARNING' : 'NORMAL';
    windStatus = windSpeed > 15 ? 'STRONG' : 'NORMAL';
    flameStatus = flameDetected ? 'STABLE' : 'EXTINGUISHED';
    solenoidValve = 'OPEN';
  }

  const reading: SensorReading = {
    deviceId: DEVICE_ID,
    wind: parseFloat(windSpeed.toFixed(1)),
    windStatus,
    flame: flameDetected,
    flameStatus,
    gas: parseFloat(gasConcentration.toFixed(1)),
    gasStatus,
    temperature: parseFloat(temperature.toFixed(1)),
    pressure: parseFloat(pressure.toFixed(2)),
    burnerStatus: burnerOn,
    stabilization: stabilizationActive,
    solenoidValve,
    battery: Math.round(battery),
    signalStrength: Math.round(signalStrength),
    systemStatus: 'SAFE', // will be overridden below
    timestamp: new Date(),
  };

  reading.systemStatus = deriveSystemStatus(reading);
  return reading;
}

function notifyListeners(reading: SensorReading) {
  listeners.forEach(cb => cb(reading));
}

function notifyAlertListeners() {
  alertListeners.forEach(cb => cb([...mockAlerts]));
}

function notifyHistoryListeners() {
  historyListeners.forEach(cb => cb({ ...history }));
}

function addAlert(type: AlertType, severity: AlertSeverity, title: string, message: string, action?: string) {
  const alert: Alert = {
    id: Date.now().toString(),
    deviceId: DEVICE_ID,
    type,
    severity,
    title,
    message,
    recommendedAction: action,
    timestamp: new Date(),
    read: false,
  };
  mockAlerts = [alert, ...mockAlerts].slice(0, 100);
  notifyAlertListeners();
}

let lastScenario = currentScenario;
let scenarioAlertSent = false;

function tick() {
  const reading = buildReading();

  // Update history
  history = {
    temperature: pushHistoryPoint(history.temperature, reading.temperature),
    wind: pushHistoryPoint(history.wind, reading.wind),
    gas: pushHistoryPoint(history.gas, reading.gas),
    flame: pushHistoryPoint(history.flame, reading.flame ? 1 : 0),
  };

  notifyListeners(reading);
  notifyHistoryListeners();

  // Fire alerts when scenario changes
  if (currentScenario !== lastScenario) {
    scenarioAlertSent = false;
  }
  lastScenario = currentScenario;

  if (!scenarioAlertSent) {
    switch (currentScenario) {
      case 'GAS_LEAKAGE':
        addAlert('GAS_LEAKAGE', 'CRITICAL', '🚨 LPG Leakage Detected',
          'Gas leakage detected near the burner. Solenoid valve automatically closed by ESP32.',
          'Evacuate the area. Check gas connections. Do NOT operate any electrical switches.');
        break;
      case 'FLAME_FAILURE':
        addAlert('FLAME_EXTINGUISHED', 'CRITICAL', '🔥 Flame Extinguished',
          'Flame failure detected. LPG supply safety response initiated by ESP32.',
          'Check gas supply and ignition. Ventilate the area before re-ignition.');
        break;
      case 'STRONG_WIND':
        addAlert('STRONG_WIND', 'WARNING', '💨 Strong Wind Detected',
          'Wind disturbance detected near the burner. Stabilization mechanism activated.',
          'Monitor flame stability. Consider using a wind shield.');
        break;
      case 'HIGH_TEMP':
        addAlert('HIGH_TEMPERATURE', 'WARNING', '🌡️ High Temperature Warning',
          'Burner temperature has exceeded the warning threshold (60°C).',
          'Reduce flame intensity or improve ventilation around the burner.');
        break;
      case 'NORMAL':
        if (lastScenario !== 'NORMAL') {
          addAlert('SYSTEM_RESTORED', 'INFO', '✅ System Restored',
            'All sensor readings have returned to normal operating conditions.',
            'Continue normal monitoring.');
        }
        break;
    }
    scenarioAlertSent = true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export const MockSensorService = {
  /** Start generating mock data */
  start(intervalMs = 2500) {
    if (intervalId) return;
    intervalId = setInterval(tick, intervalMs);
    tick(); // emit immediately
  },

  /** Stop generating mock data */
  stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (scenarioTimeout) {
      clearTimeout(scenarioTimeout);
      scenarioTimeout = null;
    }
  },

  /** Subscribe to live sensor readings */
  onReading(callback: (reading: SensorReading) => void) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  /** Subscribe to alerts */
  onAlerts(callback: (alerts: Alert[]) => void) {
    alertListeners.push(callback);
    callback([...mockAlerts]); // emit immediately
    return () => {
      alertListeners = alertListeners.filter(l => l !== callback);
    };
  },

  /** Subscribe to sensor history */
  onHistory(callback: (history: SensorHistory) => void) {
    historyListeners.push(callback);
    callback({ ...history }); // emit immediately
    return () => {
      historyListeners = historyListeners.filter(l => l !== callback);
    };
  },

  /** Trigger a demo scenario */
  setScenario(scenario: DemoScenario, durationMs = 15000) {
    // Reset physical state
    burnerOn = scenario !== 'FLAME_FAILURE' && scenario !== 'GAS_LEAKAGE';
    stabilizationActive = scenario === 'STRONG_WIND';
    scenarioAlertSent = false;

    currentScenario = scenario;

    if (scenarioTimeout) clearTimeout(scenarioTimeout);
    if (scenario !== 'NORMAL') {
      scenarioTimeout = setTimeout(() => {
        currentScenario = 'NORMAL';
        burnerOn = true;
        stabilizationActive = false;
        scenarioAlertSent = false;
      }, durationMs);
    }
  },

  getCurrentScenario(): DemoScenario {
    return currentScenario;
  },

  /** Mark an alert as read */
  markAlertRead(alertId: string) {
    mockAlerts = mockAlerts.map(a => a.id === alertId ? { ...a, read: true } : a);
    notifyAlertListeners();
  },

  /** Mark all alerts as read */
  markAllRead() {
    mockAlerts = mockAlerts.map(a => ({ ...a, read: true }));
    notifyAlertListeners();
  },

  /** Get historical data (returns last N days worth of points) */
  getHistory(): SensorHistory {
    return { ...history };
  },
};
