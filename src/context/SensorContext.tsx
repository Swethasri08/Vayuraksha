import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SensorReading, SensorHistory } from '../types/sensor';
import { Alert } from '../types/alert';
import { MockSensorService, DemoScenario } from '../services/mockSensorService';

interface SensorContextType {
  reading: SensorReading | null;
  history: SensorHistory | null;
  alerts: Alert[];
  unreadCount: number;
  isConnected: boolean;
  scenario: DemoScenario;
  setScenario: (s: DemoScenario) => void;
  markAlertRead: (id: string) => void;
  markAllRead: () => void;
}

const SensorContext = createContext<SensorContextType>({
  reading: null,
  history: null,
  alerts: [],
  unreadCount: 0,
  isConnected: false,
  scenario: 'NORMAL',
  setScenario: () => {},
  markAlertRead: () => {},
  markAllRead: () => {},
});

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorHistory | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [scenario, setScenarioState] = useState<DemoScenario>('NORMAL');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    MockSensorService.start(2500);
    setIsConnected(true);

    const unsubReading = MockSensorService.onReading(r => setReading(r));
    const unsubAlerts = MockSensorService.onAlerts(a => setAlerts(a));
    const unsubHistory = MockSensorService.onHistory(h => setHistory(h));

    return () => {
      unsubReading();
      unsubAlerts();
      unsubHistory();
      MockSensorService.stop();
    };
  }, []);

  const setScenario = (s: DemoScenario) => {
    setScenarioState(s);
    MockSensorService.setScenario(s);
  };

  const markAlertRead = (id: string) => MockSensorService.markAlertRead(id);
  const markAllRead = () => MockSensorService.markAllRead();

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <SensorContext.Provider value={{
      reading, history, alerts, unreadCount,
      isConnected, scenario, setScenario,
      markAlertRead, markAllRead,
    }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  return useContext(SensorContext);
}
