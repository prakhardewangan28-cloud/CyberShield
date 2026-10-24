import { apiClient } from './client';
import { FileIntegrityEntry } from '../types';
import { mockFileIntegrity } from '../mock/mockData';

export interface FimSummary {
  monitored_directories: string[];
  total_files_tracked: number;
  hash_mismatches_detected: number;
  new_files_created: number;
  files_deleted: number;
  monitoring_active: boolean;
  algorithm: string;
}

export const filesApi = {
  async getFiles(isDemo: boolean = false): Promise<FileIntegrityEntry[]> {
    if (isDemo) {
      return [...mockFileIntegrity];
    }
    try {
      const response = await apiClient.get<FileIntegrityEntry[]>('/api/v1/fim/files');
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /fim/files unreachable, falling back to mock dataset:', err);
      return filesApi.getFiles(true);
    }
  },

  async getFimSummary(isDemo: boolean = false): Promise<FimSummary> {
    if (isDemo) {
      return {
        monitored_directories: ['/etc/security/', '/etc/sudoers.d/', '/etc/pam.d/', '/var/log/'],
        total_files_tracked: 5,
        hash_mismatches_detected: 1,
        new_files_created: 1,
        files_deleted: 0,
        monitoring_active: true,
        algorithm: 'SHA-256'
      };
    }
    try {
      const response = await apiClient.get<FimSummary>('/api/v1/fim/summary');
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /fim/summary unreachable, falling back to mock dataset:', err);
      return filesApi.getFimSummary(true);
    }
  }
};
