import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5050/api');

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
});

import { auth } from '../firebase/firebase';

// Request Interceptor to attach the Firebase token
apiClient.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        try {
            // Try getting the Firebase token if user is signed in
            const currentUser = auth.currentUser;
            if (currentUser) {
                // Get token, forcing refresh if necessary
                const token = await currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error attaching Firebase token", e);
        }
    }
    return config;
});

// Response Interceptor to handle 401s
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Since Firebase automatically refreshes tokens in the background, 
        // a 401 usually means the user is genuinely logged out or token is invalid.
        return Promise.reject(error);
    }
);
