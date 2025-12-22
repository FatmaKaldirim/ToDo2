import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Listen for token changes in localStorage
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // The claims are mapped differently. Let's get them by their type URL.
        const userData = {
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
          name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        };
        setUser(userData);
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUser(null);
        localStorage.removeItem('token'); // Clear invalid token
      }
    } else {
      setUser(null);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  return { user, token };
};