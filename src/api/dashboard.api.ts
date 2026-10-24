import { apiClient } from './client';
import { DashboardSummary } from '../types';
import { mockDashboardSummary } from '../mock/mockData';

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'offline';
  version: string;
  uptime_seconds: number;
  active_threads: number;
  database: 'connected' | 'error';
}

export const getTrendForTimeRange = (range: string = '24h') => {
  if (range === '1h') {
    return [
      { time: '11:20', events: 340, failures: 0, alerts: 0 },
      { time: '11:30', events: 620, failures: 0, alerts: 0 },
      { time: '11:40', events: 740, failures: 1, alerts: 0 },
      { time: '11:50', events: 810, failures: 0, alerts: 0 },
      { time: '12:00', events: 1240, failures: 6, alerts: 1 },
      { time: '12:10', events: 1450, failures: 0, alerts: 3 },
      { time: '12:20', events: 980, failures: 0, alerts: 1 }
    ];
  } else if (range === '7d') {
    return [
      { time: 'Mon', events: 7200, failures: 2, alerts: 1 },
      { time: 'Tue', events: 8100, failures: 1, alerts: 0 },
      { time: 'Wed', events: 7890, failures: 4, alerts: 2 },
      { time: 'Thu', events: 9400, failures: 3, alerts: 1 },
      { time: 'Fri', events: 12450, failures: 6, alerts: 4 },
      { time: 'Sat', events: 4500, failures: 1, alerts: 0 },
      { time: 'Sun', events: 4800, failures: 0, alerts: 0 }
    ];
  }
  // Default 24h
  return [
    { time: '00:00', events: 410, failures: 0, alerts: 0 },
    { time: '04:00', events: 290, failures: 0, alerts: 0 },
    { time: '08:00', events: 820, failures: 1, alerts: 0 },
    { time: '12:00', events: 1840, failures: 6, alerts: 2 },
    { time: '16:00', events: 1420, failures: 1, alerts: 1 },
    { time: '20:00', events: 980, failures: 0, alerts: 0 }
  ];
};

export const dashboardApi = {
  async getSummary(isDemo: boolean = false, timeRange: string = '24h'): Promise<DashboardSummary> {
    const fallbackSummary: DashboardSummary = {
      ...mockDashboardSummary,
      events_trend: getTrendForTimeRange(timeRange),
      is_simulated: true
    };

    if (isDemo) {
      return fallbackSummary;
    }

    try {
      const response = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary', {
        params: { timeRange }
      });
      return { 
        ...response.data, 
        events_trend: response.data.events_trend?.length ? response.data.events_trend : getTrendForTimeRange(timeRange),
        is_simulated: false 
      };
    } catch (err) {
      console.warn('[CyberShield API] Backend summary unavailable, falling back to simulation dataset:', err);
      return fallbackSummary;
    }
  },

  async getHealth(isDemo: boolean = false): Promise<HealthResponse> {
    if (isDemo) {
      return {
        status: 'healthy',
        version: '1.0.0-demo',
        uptime_seconds: 48920,
        active_threads: 5,
        database: 'connected'
      };
    }
    try {
      const response = await apiClient.get<HealthResponse>('/api/v1/health');
      return response.data;
    } catch {
      return {
        status: 'offline',
        version: '1.0.0-fallback',
        uptime_seconds: 0,
        active_threads: 0,
        database: 'error'
      };
    }
  }
};

