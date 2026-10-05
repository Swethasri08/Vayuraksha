import { SensorReading, SystemStatus, SensorThresholds, DEFAULT_THRESHOLDS } from '../types/sensor';

/**
 * Derives the overall system status from raw sensor readings.
 * This logic mirrors what the ESP32 uses locally – the app only DISPLAYS it.
 */
export function deriveSystemStatus(
  reading: Partial<SensorReading>,
  thresholds: SensorThresholds = DEFAULT_THRESHOLDS
): SystemStatus {
  if (!reading) return 'UNKNOWN';

  // CRITICAL conditions
  if (reading.gasStatus === 'CRITICAL') return 'CRITICAL';
  if (reading.flameStatus === 'EXTINGUISHED') return 'CRITICAL';
  if (reading.temperature !== undefined && reading.temperature >= thresholds.temperatureCritical) return 'CRITICAL';

  // WARNING conditions
  if (reading.gasStatus === 'WARNING') return 'WARNING';
  if (reading.flameStatus === 'UNSTABLE') return 'WARNING';
  if (reading.windStatus === 'STRONG') return 'WARNING';
  if (reading.temperature !== undefined && reading.temperature >= thresholds.temperatureWarning) return 'WARNING';

  return 'SAFE';
}

/**
 * Returns a human-readable status label + emoji
 */
export function getStatusLabel(status: SystemStatus): string {
  switch (status) {
    case 'SAFE':     return '🟢 SAFE';
    case 'WARNING':  return '🟡 WARNING';
    case 'CRITICAL': return '🔴 CRITICAL';
    default:         return '⚪ UNKNOWN';
  }
}

/**
 * Returns the statusMessage shown on the dashboard
 */
export function getStatusMessage(reading: Partial<SensorReading>): string {
  if (reading.gasStatus === 'CRITICAL') return 'LPG leakage detected! Gas supply shutoff active.';
  if (reading.flameStatus === 'EXTINGUISHED') return 'Flame failure detected. Safety response initiated.';
  if (reading.temperature !== undefined && reading.temperature >= 80) return 'Critical temperature exceeded. Check burner immediately.';
  if (reading.gasStatus === 'WARNING') return 'Elevated gas concentration detected. Monitoring closely.';
  if (reading.flameStatus === 'UNSTABLE') return 'Flame instability detected. Stabilization active.';
  if (reading.windStatus === 'STRONG') return 'Strong wind detected. Burner stabilization activated.';
  if (reading.temperature !== undefined && reading.temperature >= 60) return 'High temperature warning. Monitor the burner area.';
  return 'All systems nominal. Burner operating safely.';
}
