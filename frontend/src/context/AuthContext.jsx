import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/config/axiosConfig';

const AuthContext = createContext(null);

/**
 * AuthProvider component to manage authentication state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedRole = localStorage.getItem('activeRole');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setActiveRole(storedRole ? JSON.parse(storedRole) : null);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing stored auth data:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Login function
     * @param {Object} userData - User data from login response
     * @param {string} token - JWT token
     * @param {Object} role - Active role object
     */
    const login = (userData, token, role = null) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        if (role) {
            localStorage.setItem('activeRole', JSON.stringify(role));
            setActiveRole(role);
        }
        setUser(userData);
        setIsAuthenticated(true);
    };

    /**
     * Logout function
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeRole');
        setUser(null);
        setActiveRole(null);
        setIsAuthenticated(false);
    };

    /**
     * Switch active role
     * @param {Object} role - New active role
     */
    const switchRole = (role) => {
        console.log(role, "In auth context");
        localStorage.setItem('activeRole', JSON.stringify(role));
        setActiveRole(role);
    };

    /**
     * Update user data
     * @param {Object} userData - Updated user data
     */
    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const value = {
        user,
        activeRole,
        isAuthenticated,
        loading,
        login,
        logout,
        switchRole,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Protected Route Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Array<string>} props.requiredRoles - Array of required role names
 * @param {React.ReactNode} props.fallback - Fallback component if not authorized
 */
export const ProtectedRoute = ({
    children,
    requiredRoles = [],
    fallback = null
}) => {
    const { isAuthenticated, activeRole, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Replace with proper loading component
    }

    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    if (requiredRoles.length > 0) {
        const hasRequiredRole = activeRole && requiredRoles.includes(activeRole.name);
        if (!hasRequiredRole) {
            return fallback || <div>Access Denied. You don't have permission to view this page.</div>;
        }
    }

    return children;
};

export default AuthContext;
