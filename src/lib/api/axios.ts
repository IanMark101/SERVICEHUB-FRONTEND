import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required for refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearAccessToken(): void {
  localStorage.removeItem('accessToken');
  delete api.defaults.headers.common.Authorization;
}

// Attach access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers) {
      // Axios defaults survive client-side navigation and hot reloads. Never
      // allow a token removed during logout to remain on later requests.
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];


const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Handle 401 Unauthorized response by calling /auth/refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if auth/refresh or login fails
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/google-login')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      const errData = error.response.data;
      if (errData?.error === "Account suspended" || errData?.code === "EMAIL_NOT_VERIFIED") {
        clearAccessToken();
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const hadToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
      const hadAuthHeader = !!originalRequest.headers?.Authorization;

      // If the request had no token and no session exists in storage, do not attempt refresh
      if (!hadToken && !hadAuthHeader) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Refresh endpoint returns { success: true, data: { accessToken } }
        const accessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        if (!accessToken) {
          throw new Error('No access token returned from refresh');
        }
        setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // Clean up token and trigger redirect or logout event
        clearAccessToken();
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
