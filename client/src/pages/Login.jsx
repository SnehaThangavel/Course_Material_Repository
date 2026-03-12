import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Card from '../components/Card';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: '1rem',
            backgroundImage: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
            backgroundAttachment: 'fixed',
            overflowY: 'auto'
        }}>
            <Card style={{
                maxWidth: '380px',
                width: '100%',
                padding: '2rem 2.25rem',
                borderRadius: '24px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.25)'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--primary)', color: 'white',
                    width: '46px', height: '46px', borderRadius: '14px',
                    marginBottom: '1.25rem',
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                }}>
                    <BookOpen size={22} strokeWidth={2.5} />
                </div>

                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.35rem', letterSpacing: '-0.5px' }}>
                    Terminal Access
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                    Provision your authority credentials to proceed.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-main)', paddingLeft: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            User Identifier
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
                                <Mail size={16} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@protocol.com"
                                style={{ width: '100%', height: '44px', paddingLeft: '2.75rem', paddingRight: '1rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxSizing: 'border-box' }}
                                className="focus:border-primary focus:bg-white focus:shadow-lg outline-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--text-main)', paddingLeft: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Access Secret
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
                                <Lock size={16} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ width: '100%', height: '44px', paddingLeft: '2.75rem', paddingRight: '1rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxSizing: 'border-box' }}
                                className="focus:border-primary focus:bg-white focus:shadow-lg outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', height: '46px',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
                            marginTop: '0.25rem'
                        }}
                        className="hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Decrypting...' : 'Establish Connection'} <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    New operative?
                    <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 800, marginLeft: '6px', textDecoration: 'none' }} className="hover:underline">
                        Initialize Account
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
