export const isTokenExpired = (token) => {

    console.log('🔍 Checking token expiration for:', token);
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

export const clearAuthData = () => {
    console.log('🗑️ Clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiryDate');
};

export const redirectToLogin = () => {
    console.log('🔄 Redirecting to login');
    clearAuthData();
    // Replace with your routing method
    window.location.href = '/login'; // or use your router
};