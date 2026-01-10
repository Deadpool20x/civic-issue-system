/**
 * Centralized Axios Client
 * 
 * Handles API communication with automatic JWT attachment
 * and basic error response handling.
 */

import axios from 'axios';
import { getToken } from './authStorage';

// Placeholder baseURL - replace with actual backend URL
const BASE_URL = 'https://api.civic-issue-system.com/api/v1';

// Create Axios instance with default configuration
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor: Attach JWT token to all requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Retrieve JWT token from storage
            const token = await getToken();

            // If token exists, add Authorization header
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Proceed without token if it doesn't exist
            return config;
        } catch (error) {
            // If there's an error getting the token, proceed without it
            return config;
        }
    },
    (error) => {
        // Return any request errors
        return Promise.reject(error);
    }
);

// Response interceptor: Handle basic auth-related errors
apiClient.interceptors.response.use(
    (response) => {
        // Return successful response normally
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Reject the promise - logout handling will be done at screen level
            return Promise.reject(error);
        }

        // Return other errors
        return Promise.reject(error);
    }
);

// Export the configured Axios instance
export default apiClient;