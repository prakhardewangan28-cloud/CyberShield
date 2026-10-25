import { apiClient } from './client';

export interface ReportData {
  timeframe: string;
  total_events: number;
  total_alerts: number;
  failed_login_count: number;
  watchlist_match_count: number;
  fim_modifications_count: number;
  alerts_by_severity: { severity: string; count: number }[];
  events_by_category: { category: string; count: number }[];
  worker_health_summary: { total: number; healthy: number; stopped: number };
  generated_at: string;
  is_simulated: boolean;
}

export const reportsApi = {
  async getReport(range: string = '7d', isDemo: boolean = false): Promise<ReportData> {
    if (isDemo) {
      return {
        timeframe: range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days',
        total_events: range === '24h' ? 8352 : 54200,
        total_alerts: range === '24h' ? 5 : 28,
        failed_login_count: range === '24h' ? 6 : 42,
        watchlist_match_count: range === '24h' ? 4 : 19,
        fim_modifications_count: range === '24h' ? 2 : 11,
        alerts_by_severity: [
          { severity: 'Critical', count: range === '24h' ? 1 : 4 },
          { severity: 'High', count: range === '24h' ? 2 : 9 },
          { severity: 'Medium', count: range === '24h' ? 1 : 10 },
          { severity: 'Low', count: range === '24h' ? 1 : 5 }
        ],
        events_by_category: [
          { category: 'Authentication', count: range === '24h' ? 18 : 120 },
          { category: 'Watchlist Match', count: range === '24h' ? 4 : 29 },
          { category: 'File Integrity', count: range === '24h' ? 5 : 34 },
          { category: 'Network Activity', count: range === '24h' ? 8325 : 54017 }
        ],
        worker_health_summary: {
          total: 6,
          healthy: 5,
          stopped: 1
        },
        generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        is_simulated: true
      };
    }

    try {
      const response = await apiClient.get<any>('/api/v1/reports/summary', {
        params: { range }
      });
      const data = response.data;
      return {
        timeframe: data.timeframe || (range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'),
        total_events: data.total_events ?? 0,
        total_alerts: data.total_alerts ?? 0,
        failed_login_count: data.failed_login_count ?? 0,
        watchlist_match_count: data.watchlist_match_count ?? 0,
        fim_modifications_count: data.fim_modifications_count ?? 0,
        alerts_by_severity: data.alerts_by_severity || [
          { severity: 'Critical', count: 0 },
          { severity: 'High', count: 0 },
          { severity: 'Medium', count: 0 },
          { severity: 'Low', count: 0 }
        ],
        events_by_category: data.events_by_category || [
          { category: 'Authentication', count: 0 },
          { category: 'Watchlist Match', count: 0 },
          { category: 'File Integrity', count: 0 },
          { category: 'Network Activity', count: 0 }
        ],
        worker_health_summary: data.worker_health_summary || { total: 4, healthy: 4, stopped: 0 },
        generated_at: data.generated_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
        is_simulated: data.is_simulated ?? false
      };
    } catch (err) {
      console.warn('[CyberShield API] Backend /reports unreachable, falling back to mock dataset:', err);
      return reportsApi.getReport(range, true);
    }
  }
};
