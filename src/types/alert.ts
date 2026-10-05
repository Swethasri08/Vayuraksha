export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertType =
  | 'GAS_LEAKAGE'
  | 'FLAME_EXTINGUISHED'
  | 'HIGH_TEMPERATURE'
  | 'STRONG_WIND'
  | 'BURNER_OFF'
  | 'CONNECTION_LOST'
  | 'BATTERY_LOW'
  | 'STABILIZATION_ACTIVE'
  | 'SYSTEM_RESTORED'
  | 'COMMAND_EXECUTED';

export interface Alert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendedAction?: string;
  timestamp: Date | string;
  read: boolean;
}
