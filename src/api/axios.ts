import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5050/api');

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
});

// Interceptor to handle 401 Unauthorized and auto-refresh the token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet, and the url is not /auth/me or /auth/refresh
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh token
                await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                
                // If successful, retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, it means the refresh token is also invalid/expired.
                // We should let the application handle the logout instead of forcing a redirect.
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
