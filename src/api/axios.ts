import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5050/api');

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
});

// Request Interceptor to attach the JWT token
apiClient.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        try {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error attaching JWT token", e);
        }
    }
    return config;
});

// Response Interceptor to handle 401s and Network Errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.message === 'Network Error') {
            console.error('Network Error Details:', {
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                method: error.config?.method
            });
            const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
            if (fullUrl.includes('localhost')) {
                error.message = `Network Error: Tried to connect to local backend (${fullUrl}) from deployed site. Please update NEXT_PUBLIC_API_URL in Vercel to your deployed backend URL.`;
            } else if (fullUrl.startsWith('http:')) {
                error.message = `Network Error: Mixed Content blocked. Cannot fetch ${fullUrl} over HTTP from an HTTPS site. Please use HTTPS for backend URL.`;
            } else if (error.config?.baseURL === '/api') {
                error.message = `Network Error: NEXT_PUBLIC_API_URL is missing in Vercel. Tried hitting ${fullUrl}. Please configure it.`;
            } else {
                error.message = `Network Error: Backend at ${fullUrl} is unreachable or blocked by CORS. Make sure the backend is running and allows this domain.`;
            }
        }
        return Promise.reject(error);
    }
);
