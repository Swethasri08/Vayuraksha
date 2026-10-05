// VayuRaksha – TypeScript interfaces for sensor data and device status

export type SystemStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
export type FlameStatus = 'STABLE' | 'UNSTABLE' | 'EXTINGUISHED';
export type GasStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type WindStatus = 'NORMAL' | 'STRONG';
export type SolenoidStatus = 'OPEN' | 'CLOSED';
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'WEAK';

export interface SensorReading {
  deviceId: string;
  wind: number;           // m/s or relative units from sensor
  windStatus: WindStatus;
  flame: boolean;         // true = flame detected
  flameStatus: FlameStatus;
  gas: number;            // ppm or relative ADC value
  gasStatus: GasStatus;
  temperature: number;    // °C
  pressure: number;       // bar or relative units
  burnerStatus: boolean;  // true = burner ON
  stabilization: boolean; // true = stabilization active
  solenoidValve: SolenoidStatus;
  battery: number;        // 0-100 %
  signalStrength: number; // 0-100 %
  systemStatus: SystemStatus;
  timestamp: Date | string;
}

export interface DeviceInfo {
  deviceId: string;
  name: string;
  firmwareVersion: string;
  espStatus: ConnectionStatus;
  moduleStatus: ConnectionStatus; // 5G module
  lastCommunication: Date | string;
  battery: number;
  signalStrength: number;
}

export interface SensorThresholds {
  temperatureWarning: number;   // °C
  temperatureCritical: number;  // °C
  windWarning: number;          // m/s
  gasWarning: number;           // ppm
  gasCritical: number;          // ppm
}

export const DEFAULT_THRESHOLDS: SensorThresholds = {
  temperatureWarning: 60,
  temperatureCritical: 80,
  windWarning: 15,
  gasWarning: 300,
  gasCritical: 600,
};

// Historical data point (for charts)
export interface DataPoint {
  timestamp: number; // unix ms
  value: number;
}

export interface SensorHistory {
  temperature: DataPoint[];
  wind: DataPoint[];
  gas: DataPoint[];
  flame: DataPoint[]; // 1 = detected, 0 = not detected
}
