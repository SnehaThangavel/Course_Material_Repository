import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, BookOpen, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';
import '../styles/pages.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userData = await register(name, email, password, role);
            if (userData.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Signup failed. Try again.';
            setError(message);
            console.error('Signup Error:', err.response?.data || err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg"></div>
            <div className="auth-overlay"></div>

            <div className="glass-card" style={{ maxWidth: '500px' }}>
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
                    <h2>Join CourseHub</h2>
                    <p>Start your collaborative learning journey</p>
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
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            className="auth-form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Full Name"
                        />
                    </div>

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

                    <div className="auth-input-wrapper">
                        <div className="auth-input-icon">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            className="auth-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create Password"
                        />
                    </div>

                    <div className="auth-input-wrapper" style={{ marginBottom: '2rem' }}>
                        <div className="auth-input-icon">
                            <UserPlus size={18} />
                        </div>
                        <select
                            className="auth-form-input"
                            style={{ appearance: 'none' }}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">I am a Student</option>
                            <option value="admin">I am an Instructor</option>
                        </select>
                        <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                            <ChevronDown size={18} />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Get Started'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <span
                        onClick={() => navigate('/login')}
                        className="auth-footer-link"
                    >
                        Sign In
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Signup;
