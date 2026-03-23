import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Card from '../components/Card';
import { BookOpen } from 'lucide-react';

const DEPARTMENTS = [
    'Artificial Intelligence and Data Science',
    'Artificial Intelligence and Machine Learning',
    'Biotechnology',
    'Computer Science',
    'Computer Science and Business Systems',
    'Electrical and Electronics',
    'Electrical Communication',
    'Fashion Technology',
    'Food Technology',
    'Information Science',
    'Information Technology',
    'MBA',
    'Mechanical'
];

const Signup = () => {
    const { signup } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'student',
        rollNumber: '', department: '', year: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!formData.email.endsWith('@bitsathy.ac.in')) {
            toast.error('Only @bitsathy.ac.in email addresses are allowed.');
            return;
        }
        if (formData.role === 'admin' && formData.email !== 'admin@bitsathy.ac.in') {
            toast.error('Only authorized admin email can sign up as admin.');
            return;
        }
        setLoading(true);
        try {
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
            await signup(
                fullName,
                formData.email,
                formData.password,
                formData.role,
                formData.rollNumber,
                formData.department,
                formData.year
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };


    const emailPlaceholder = formData.role === 'admin' ? 'admin@bitsathy.ac.in' : 'Enter your email';

    const labelStyle = { fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em' };
    const inputStyle = { height: '40px', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem' };
    const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', textAlign: 'left' };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', padding: '1rem',
            backgroundImage: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)',
            backgroundAttachment: 'fixed', overflowY: 'auto'
        }}>
            <Card style={{
                maxWidth: '460px', width: '100%', padding: '1.25rem 2rem',
                borderRadius: '22px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.25)',
                margin: '1rem 0'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--primary)', color: 'white',
                    width: '38px', height: '38px', borderRadius: '12px',
                    marginBottom: '0.4rem', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
                }}>
                    <BookOpen size={20} strokeWidth={2.5} />
                </div>

                <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.15rem', letterSpacing: '-0.5px' }}>
                    Create Account
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.85rem', fontWeight: 500 }}>
                    Sign up to access the curriculum.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

                    {/* Role */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            {['student', 'admin'].map(r => (
                                <label key={r} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0.55rem', borderRadius: '10px', border: `2px solid ${formData.role === r ? 'var(--primary)' : 'var(--border)'}`, background: formData.role === r ? 'var(--primary-light)' : 'white', transition: 'all 0.2s' }}>
                                    <input type="radio" name="role" value={r} checked={formData.role === r} onChange={(e) => setFormData({ ...formData, role: e.target.value, email: '' })} style={{ display: 'none' }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: formData.role === r ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{r}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* First + Last Name side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>First Name</label>
                            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required placeholder="First name" style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Last Name</label>
                            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required placeholder="Last name" style={inputStyle} />
                        </div>
                    </div>

                    {/* Email — placeholder changes based on role */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Email</label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder={emailPlaceholder} style={inputStyle} />
                    </div>

                    {/* Password + Confirm Password side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Password</label>
                            <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required placeholder="Enter Password" style={inputStyle} />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Confirm Password</label>
                            <Input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                placeholder="Enter Password"
                                style={{ ...inputStyle, borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : undefined }}
                            />
                        </div>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, textAlign: 'left', marginTop: '-0.25rem' }}>
                            Passwords do not match
                        </span>
                    )}

                    {/* Student Specific Fields */}
                    {formData.role === 'student' && (
                        <>
                            <div style={fieldStyle}>
                                <label style={labelStyle}>Roll Number</label>
                                <Input
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                    required
                                    placeholder="e.g. 7376232CB150"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                        style={{ ...inputStyle, width: '100%', padding: '0 0.5rem', background: 'white', border: '1.5px solid var(--border)' }}
                                    >
                                        <option value="">Select Dept</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={fieldStyle}>
                                    <label style={labelStyle}>Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        required
                                        style={{ ...inputStyle, width: '100%', padding: '0 0.5rem', background: 'white', border: '1.5px solid var(--border)' }}
                                    >
                                        <option value="">Select Year</option>
                                        {['1', '2', '3', '4'].map(y => (
                                            <option key={y} value={y}>{y}{y === '1' ? 'st' : y === '2' ? 'nd' : y === '3' ? 'rd' : 'th'} Year</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', height: '44px',
                            background: 'var(--primary)', color: 'white',
                            borderRadius: '11px', fontSize: '0.92rem', fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                            boxShadow: '0 8px 20px rgba(79,70,229,0.3)', marginTop: '0.1rem'
                        }}
                        className="hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }} className="hover:underline">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
