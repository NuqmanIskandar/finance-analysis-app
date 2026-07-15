import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { api, setToken, getToken } from "../api/client"

const AuthContext = createContext(null);

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const { exp } = JSON.parse(atob(token.split(".")[1]));
        return Date.now() >= exp * 1000;
    } catch {
        return true; // malformed token, treat as invalid
    }
}

export function AuthProvider({ children }) {
    const [isAuthed, setIsAuthed] = useState(() => {
        const token = getToken();
        return Boolean(token) && !isTokenExpired(token);
    });
    const [error, setError] = useState(null);

    const login = useCallback(async (username, password) => {
        setError(null);
        try {
            const res = await api.login(username, password);
            setToken(res.access_token);
            setIsAuthed(true);
            return true;
        } catch (e) {
            setError(e.message || "Login failed");
            return false;
        }
    }, []);

    const register = useCallback(async (username, password) => {
        setError(null);
        try {
            const res = await api.register(username, password);
            setToken(res.access_token);
            setIsAuthed(true);
            return true;
        } catch (e) {
            setError(e.message || "Registration failed");
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setIsAuthed(false);
    }, []);

    // Reactive: catches expiry as soon as any API call comes back 401.
    // Triggered by the "auth:expired" event dispatched in api/client.js.
    useEffect(() => {
        function handleExpired() {
            setToken(null);
            setIsAuthed(false);
            setError("Session expired, please sign in again");
        }

        window.addEventListener("auth:expired", handleExpired);
        return () => window.removeEventListener("auth:expired", handleExpired);
    }, []);

    // Proactive: catches expiry even with no API calls in flight,
    // by checking the JWT's exp claim on mount and periodically.
    useEffect(() => {
        function checkExpiry() {
            const token = getToken();
            if (token && isTokenExpired(token)) {
                setToken(null);
                setIsAuthed(false);
                setError("Session expired, please sign in again");
            }
        }

        checkExpiry();
        const interval = setInterval(checkExpiry, 30000); // every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthed, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}