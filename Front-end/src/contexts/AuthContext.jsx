import { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionId, setSessionId] = useState(
        () => localStorage.getItem('session_id') || null
    );

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        authApi.getMe()
            .then(({ data }) => setUser(data))
            .catch(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('session_id');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (credentials) => {
        const { data } = await authApi.login(credentials);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('session_id', data.session_id);
        setUser(data.user);
        setSessionId(data.session_id);
        return data;
    }, []);

    const logout = useCallback(async () => {
        const sid = localStorage.getItem('session_id');
        try { await authApi.logout({ session_id: sid }); } catch (_) { }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('session_id');
        setUser(null);
        setSessionId(null);
    }, []);

    const register = useCallback(async (data) => {
        await authApi.register(data);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, sessionId, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}
