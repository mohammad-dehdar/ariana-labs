import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getCurrentUser, isAuthenticated, logoutUser } from "../services/auth";

// Create context
const AuthContext = createContext(null);

// Context provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);

    // Function to load user data
    const loadUserData = useCallback(async () => {
        if (!isAuthenticated()) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            setIsLoggedIn(true);
            setError(null);
        } catch (err) {
            console.error("Failed to load user data:", err);
            setError(err.message);
            
            // If the token is invalid, perform logout
            if (err.message.includes("401") || err.message.includes("invalid credentials")) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load user data on initialization
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Function to log in
    const login = useCallback(async (userData) => {
        // Update state based on received data
        setIsLoggedIn(true);
        
        // If we only have a token, load full data
        if (userData && userData.token && !userData.username) {
            await loadUserData();
        } else {
            // Otherwise, use the provided data
            setUser(userData);
        }
    }, [loadUserData]);

    // Function to log out
    const logout = useCallback(() => {
        logoutUser();
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    // Reload user data (useful after profile update)
    const refreshUserData = useCallback(() => {
        return loadUserData();
    }, [loadUserData]);

    // Memoize context value for optimization
    const contextValue = useMemo(() => ({
        user,
        isLoggedIn,
        isLoading,
        error,
        login,
        logout,
        refreshUserData
    }), [user, isLoggedIn, isLoading, error, login, logout, refreshUserData]);

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook to use authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
