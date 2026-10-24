import { apiClient } from './client';
import { QueueMetrics, WorkerItem } from '../types';
import { mockQueueMetrics, mockWorkers } from '../mock/mockData';

export interface WorkersResponse {
  workers: WorkerItem[];
  queue_metrics: QueueMetrics | null;
  multithreading_mode: 'threading' | 'asyncio' | 'multiprocessing';
  gil_note: string;
}

export const workersApi = {
  async getWorkers(isDemo: boolean = false): Promise<WorkersResponse> {
    if (isDemo) {
      return {
        workers: [...mockWorkers],
        queue_metrics: mockQueueMetrics,
        multithreading_mode: 'threading',
        gil_note: 'Workers use Python standard library threading.Thread with thread-safe queue.Queue for inter-thread message passing.'
      };
    }
    try {
      const response = await apiClient.get<WorkersResponse>('/api/v1/workers');
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /workers unreachable, falling back to mock dataset:', err);
      return workersApi.getWorkers(true);
    }
  }
};
