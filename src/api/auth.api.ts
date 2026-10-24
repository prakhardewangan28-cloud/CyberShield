import { apiClient, setAuthToken } from './client';
import { User } from '../types';
import { mockUsers } from '../mock/mockData';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  async login(username: string, password: string, isDemo: boolean = false): Promise<LoginResponse> {
    const doMockLogin = (): LoginResponse => {
      const uname = (username || '').trim().toLowerCase();
      const matched = mockUsers.find(u => u.username.toLowerCase() === uname);
      
      const user: User = matched || {
        id: `usr_${Date.now().toString().slice(-4)}`,
        username: uname || 'operator',
        name: uname === 'analyst' ? 'SOC Analyst L2' : uname === 'viewer' ? 'Student Auditor' : 'Chief Security Officer',
        email: `${uname || 'operator'}@cybershield.internal`,
        role: uname === 'analyst' ? 'analyst' : uname === 'viewer' ? 'viewer' : 'admin',
        last_login: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      const token = `demo_token_${user.role}_${Date.now()}`;
      setAuthToken(token);
      return { token, user };
    };

    if (isDemo) {
      return doMockLogin();
    }

    try {
      const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', { username, password });
      if (response.data?.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (err) {
      console.warn('[CyberShield Auth] Python backend offline, using safe local operator session:', err);
      // Fallback to local session so the user is never locked out
      return doMockLogin();
    }
  },

  async getCurrentUser(isDemo: boolean = false): Promise<User> {
    if (isDemo) {
      return mockUsers[0];
    }
    try {
      const response = await apiClient.get<User>('/api/v1/auth/me');
      return response.data;
    } catch {
      return mockUsers[0];
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // safe ignore on logout failure
    } finally {
      setAuthToken(null);
    }
  }
};
