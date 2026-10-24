import { apiClient } from './client';
import { AuditLog } from '../types';
import { mockAuditLogs } from '../mock/mockData';

let demoAuditLogsState = [...mockAuditLogs];

export interface AuditFilterParams {
  search?: string;
  action?: string;
  actor?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  async getAuditLogs(params: AuditFilterParams = {}, isDemo: boolean = false): Promise<{ items: AuditLog[]; total: number }> {
    if (isDemo) {
      let filtered = [...demoAuditLogsState];

      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(l => 
          l.action.toLowerCase().includes(query) ||
          l.actor.toLowerCase().includes(query) ||
          l.target_resource.toLowerCase().includes(query) ||
          l.details.toLowerCase().includes(query)
        );
      }

      if (params.action && params.action !== 'all') {
        filtered = filtered.filter(l => l.action === params.action);
      }

      return {
        items: filtered,
        total: filtered.length
      };
    }

    try {
      const response = await apiClient.get<{ items: AuditLog[]; total: number }>('/api/v1/audit', { params });
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /audit unreachable, falling back to mock dataset:', err);
      return auditApi.getAuditLogs(params, true);
    }
  },

  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const entry: AuditLog = {
      ...log,
      id: `aud_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    demoAuditLogsState = [entry, ...demoAuditLogsState];
  }
};
