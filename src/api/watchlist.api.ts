import { apiClient } from './client';
import { WatchlistEntry } from '../types';
import { mockWatchlist } from '../mock/mockData';

let demoWatchlistState = [...mockWatchlist];

export const watchlistApi = {
  async getWatchlist(isDemo: boolean = false): Promise<WatchlistEntry[]> {
    if (isDemo) {
      return [...demoWatchlistState];
    }
    try {
      const response = await apiClient.get<WatchlistEntry[]>('/api/v1/watchlist');
      return response.data;
    } catch (err) {
      console.warn('[CyberShield API] Backend /watchlist unreachable, falling back to mock dataset:', err);
      return watchlistApi.getWatchlist(true);
    }
  },

  async addEntry(entry: Omit<WatchlistEntry, 'id' | 'created_at' | 'match_count'>, isDemo: boolean = false): Promise<WatchlistEntry> {
    if (isDemo) {
      const newEntry: WatchlistEntry = {
        ...entry,
        id: `wl_${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        match_count: 0
      };
      demoWatchlistState = [newEntry, ...demoWatchlistState];
      return newEntry;
    }
    const response = await apiClient.post<WatchlistEntry>('/api/v1/watchlist', entry);
    return response.data;
  },

  async updateEntry(id: string, updates: Partial<WatchlistEntry>, isDemo: boolean = false): Promise<WatchlistEntry> {
    if (isDemo) {
      demoWatchlistState = demoWatchlistState.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      const updated = demoWatchlistState.find(item => item.id === id);
      if (!updated) throw new Error('Watchlist entry not found');
      return updated;
    }
    const response = await apiClient.put<WatchlistEntry>(`/api/v1/watchlist/${id}`, updates);
    return response.data;
  },

  async deleteEntry(id: string, isDemo: boolean = false): Promise<void> {
    if (isDemo) {
      demoWatchlistState = demoWatchlistState.filter(item => item.id !== id);
      return;
    }
    await apiClient.delete(`/api/v1/watchlist/${id}`);
  }
};
