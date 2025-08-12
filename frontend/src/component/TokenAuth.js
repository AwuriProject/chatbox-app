import { isTokenExpired, redirectToLogin } from '../utils/tokenManger'

export const makeAuthenticatedRequest = async (url, options = {}) => {
    console.log(url, options)
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (!token || isTokenExpired(token)) {
        redirectToLogin();
        return;
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, defaultOptions);
        
        // Check if response indicates token expired (401/403)
        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            
            // Check if error message indicates token expiration
            if (errorData.message && 
                (errorData.message.includes('token') || 
                 errorData.message.includes('expired') || 
                 errorData.message.includes('unauthorized'))) {
                redirectToLogin();
                return;
            }
        }
        
        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};