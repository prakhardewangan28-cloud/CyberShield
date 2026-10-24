import axios, { AxiosInstance, AxiosError } from 'axios';

export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

let authToken: string | null = sessionStorage.getItem('cybershield_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    sessionStorage.setItem('cybershield_token', token);
  } else {
    sessionStorage.removeItem('cybershield_token');
  }
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const createApiClient = (baseURL: string = DEFAULT_API_BASE_URL): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 6000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Safe error wrapping without exposing raw backend traces
      const status = error.response ? error.response.status : null;
      let userMessage = 'Unable to communicate with the CyberShield Python backend.';
      
      if (status === 401) {
        userMessage = 'Authentication required or session expired.';
      } else if (status === 403) {
        userMessage = 'Access denied. You lack permissions for this resource.';
      } else if (status === 404) {
        userMessage = 'Requested endpoint was not found on the backend API.';
      } else if (status && status >= 500) {
        userMessage = 'The Python backend encountered an internal error.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        userMessage = 'Backend connection timed out.';
      } else if (error.message.includes('Network Error')) {
        userMessage = `Cannot reach Python backend at ${baseURL}. Check if the server is running.`;
      }

      return Promise.reject({
        status,
        message: userMessage,
        originalError: error
      });
    }
  );

  return instance;
};

export let apiClient = createApiClient();

export const updateApiBaseUrl = (newUrl: string) => {
  apiClient = createApiClient(newUrl);
};
