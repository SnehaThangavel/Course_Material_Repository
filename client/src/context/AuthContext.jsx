import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('coursehub_user');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (err) {
                console.error('Failed to parse user info', err);
                localStorage.removeItem('coursehub_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('coursehub_user', JSON.stringify(data));
        setUser(data);
    };

    const signup = async (name, email, password, role, rollNumber, department, year) => {
        const { data } = await axios.post('/api/auth/signup', { name, email, password, role, rollNumber, department, year });
        localStorage.setItem('coursehub_user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('coursehub_user');
        setUser(null);
    };

    // Add axios interceptor for tokens
    axios.interceptors.request.use(config => {
        const currentUser = JSON.parse(localStorage.getItem('coursehub_user'));
        if (currentUser?.token) {
            config.headers.Authorization = `Bearer ${currentUser.token}`;
        }
        return config;
    });

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
