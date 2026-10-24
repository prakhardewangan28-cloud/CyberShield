import { apiClient } from './client';
import { EventItem } from '../types';
import { mockGeneralEvents } from '../mock/mockData';

export interface EventFilterParams {
  search?: string;
  eventType?: string;
  severity?: string;
  source?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const eventsApi = {
  async getEvents(params: EventFilterParams = {}, isDemo: boolean = false): Promise<PaginatedResponse<EventItem>> {
    if (isDemo) {
      let filtered = [...mockGeneralEvents];

      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.event_id.toLowerCase().includes(query) ||
          e.source.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.event_type.toLowerCase().includes(query)
        );
      }

      if (params.eventType && params.eventType !== 'all') {
        filtered = filtered.filter(e => e.event_type === params.eventType);
      }

      if (params.severity && params.severity !== 'all') {
        filtered = filtered.filter(e => e.severity === params.severity);
      }

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(e => e.processing_status === params.status);
      }

      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      return {
        items,
        total: filtered.length,
        page,
        pageSize
      };
    }

    try {
      const response = await apiClient.get<PaginatedResponse<EventItem>>('/api/v1/events', { params });
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /events unreachable, falling back to mock dataset:', err);
      return eventsApi.getEvents(params, true);
    }
  },

  async getEventById(id: string, isDemo: boolean = false): Promise<EventItem | null> {
    if (isDemo) {
      const found = mockGeneralEvents.find(e => e.event_id === id);
      return found || null;
    }
    try {
      const response = await apiClient.get<EventItem>(`/api/v1/events/${id}`);
      return response.data;
    } catch {
      return eventsApi.getEventById(id, true);
    }
  }
};
