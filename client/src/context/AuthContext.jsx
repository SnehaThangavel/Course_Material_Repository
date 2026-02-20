import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            // Refresh full user data (including completedCourses & enrolledCourses) from server
            api.get('/auth/me').then(res => {
                const fullUser = { ...parsed, ...res.data };
                localStorage.setItem('user', JSON.stringify(fullUser));
                setUser(fullUser);
            }).catch(() => { }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Call this after any action that changes enrolledCourses/completedCourses
    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const fullUser = { ...storedUser, ...data };
            localStorage.setItem('user', JSON.stringify(fullUser));
            setUser(fullUser);
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
            // Fetch full profile (includes completedCourses, enrolledCourses)
            await refreshUser();
        }
        return response.data;
    };

    const register = async (name, email, password, role) => {
        const response = await api.post('/auth/signup', {
            name,
            email,
            password,
            role,
        });
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateProfile = (data) => {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
