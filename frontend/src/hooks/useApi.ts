import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiClient';

interface HealthStatus {
  status: 'connected' | 'disconnected' | 'loading';
  message?: string;
  timestamp?: string;
  error?: string;
}

export function useBackendConnection() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'loading',
    message: 'Checking backend connection...',
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await apiService.healthCheck();
        setHealth({
          status: 'connected',
          message: response.message,
          timestamp: response.timestamp,
        });
      } catch (error: any) {
        setHealth({
          status: 'disconnected',
          error: error.message || 'Failed to connect to backend',
        });
      }
    };

    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return health;
}

export function useMarketPrices() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMarketPrices({ limit: 10 });
        setPrices(data.prices || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch market prices');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { prices, loading, error };
}

export function useTransportSchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTransportSchedules({ limit: 10 });
        setSchedules(data.schedules || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch transport schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  return { schedules, loading, error };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAlerts({ limit: 10 });
        setAlerts(data.alerts || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return { alerts, loading, error };
}
