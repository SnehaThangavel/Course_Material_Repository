import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import '../styles/pages.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userData = await login(email, password);
            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(message);
            console.error('Login Error:', err.response?.data || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg"></div>
            <div className="auth-overlay"></div>

            <div className="glass-card">
                <div className="auth-logo">
                    <div style={{
                        background: '#818cf8',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(129, 140, 248, 0.2)'
                    }}>
                        <BookOpen size={28} color="white" />
                    </div>
                </div>

                <div className="auth-welcome">
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Explore your educational resource repository</p>
                </div>

                {error && (
                    <div className="error-msg-auth">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-input-wrapper">
                        <div className="auth-input-icon">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            className="auth-form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email Address"
                        />
                    </div>

                    <div className="auth-input-wrapper" style={{ marginBottom: '2rem' }}>
                        <div className="auth-input-icon">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            className="auth-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                        />
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <span
                        onClick={() => navigate('/signup')}
                        className="auth-footer-link"
                    >
                        Create Account
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
