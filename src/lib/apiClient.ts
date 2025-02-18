import { env } from '../utils/env';

export const apiClient = {
    async request(endpoint: string, options: RequestInit = {}) {
        const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred');
            }

            return response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint: string, body: any) {
        return this.request(endpoint, { 
            method: 'POST', 
            body: JSON.stringify(body) 
        });
    },

    put(endpoint: string, body: any) {
        return this.request(endpoint, { 
            method: 'PUT', 
            body: JSON.stringify(body) 
        });
    },

    delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}; 