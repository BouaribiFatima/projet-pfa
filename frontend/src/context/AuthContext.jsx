import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    const login = async (username, password) => {
        const res = await api.post('/auth/login/', { username, password });

        localStorage.setItem('access_token', res.data.access);

        if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
        }

        const currentUser = res.data.user || {
            username,
            role: username === 'admin' ? 'superadmin' : 'manager',
        };

        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);

        return currentUser;
    };

    const logout = async () => {
        const refresh = localStorage.getItem('refresh_token');

        try {
            if (refresh) {
                await api.post('/auth/logout/', { refresh });
            }
        } catch (error) {
            console.log('Erreur logout:', error);
        }

        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);