import { apiClient } from './client';
import { AlertItem, AlertStatus, Severity } from '../types';
import { mockAlerts } from '../mock/mockData';

export interface AlertFilterParams {
  severity?: Severity | 'all';
  status?: AlertStatus | 'all';
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AlertListResponse {
  items: AlertItem[];
  total: number;
}

// In-memory state for mock alterations during a demo session
let demoAlertsState = [...mockAlerts];

export const alertsApi = {
  async getAlerts(params: AlertFilterParams = {}, isDemo: boolean = false): Promise<AlertListResponse> {
    if (isDemo) {
      let filtered = [...demoAlertsState];

      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(query) ||
          a.alert_id.toLowerCase().includes(query) ||
          (a.source_ip && a.source_ip.toLowerCase().includes(query)) ||
          a.detection_rule.toLowerCase().includes(query)
        );
      }

      if (params.severity && params.severity !== 'all') {
        filtered = filtered.filter(a => a.severity === params.severity);
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(a => a.status === params.status);
      }

      if (params.category && params.category !== 'all') {
        filtered = filtered.filter(a => a.event_category === params.category);
      }

      return {
        items: filtered,
        total: filtered.length
      };
    }

    try {
      const response = await apiClient.get<AlertListResponse>('/api/v1/alerts', { params });
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /alerts unreachable, falling back to mock dataset:', err);
      return alertsApi.getAlerts(params, true);
    }
  },

  async getAlertById(id: string, isDemo: boolean = false): Promise<AlertItem | null> {
    if (isDemo) {
      const found = demoAlertsState.find(a => a.alert_id === id);
      return found || null;
    }
    try {
      const response = await apiClient.get<AlertItem>(`/api/v1/alerts/${id}`);
      return response.data;
    } catch {
      return alertsApi.getAlertById(id, true);
    }
  },

  async acknowledgeAlert(id: string, username: string = 'analyst', isDemo: boolean = false): Promise<AlertItem> {
    if (isDemo) {
      demoAlertsState = demoAlertsState.map(alert => {
        if (alert.alert_id === id) {
          return {
            ...alert,
            status: 'acknowledged' as AlertStatus,
            acknowledged_by: username,
            acknowledged_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return alert;
      });
      const updated = demoAlertsState.find(a => a.alert_id === id);
      if (!updated) throw new Error('Alert not found');
      return updated;
    }

    const response = await apiClient.patch<AlertItem>(`/api/v1/alerts/${id}/acknowledge`, {
      acknowledged_by: username
    });
    return response.data;
  },

  async resolveAlert(id: string, username: string = 'admin', resolutionNotes: string, isDemo: boolean = false): Promise<AlertItem> {
    if (isDemo) {
      demoAlertsState = demoAlertsState.map(alert => {
        if (alert.alert_id === id) {
          return {
            ...alert,
            status: 'resolved' as AlertStatus,
            resolved_by: username,
            resolved_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            resolution_notes: resolutionNotes
          };
        }
        return alert;
      });
      const updated = demoAlertsState.find(a => a.alert_id === id);
      if (!updated) throw new Error('Alert not found');
      return updated;
    }

    const response = await apiClient.patch<AlertItem>(`/api/v1/alerts/${id}/resolve`, {
      resolved_by: username,
      resolution_notes: resolutionNotes
    });
    return response.data;
  },

  resetDemoState(): void {
    demoAlertsState = [...mockAlerts];
  }
};
