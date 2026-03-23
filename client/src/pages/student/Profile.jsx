import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Camera, UserCircle, Shield, Lock, Save, GraduationCap } from 'lucide-react';

const DEPARTMENTS = [
    'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil',
    'Computer Science and Business Systems', 'Electrical and Electronics', 'Electrical Communication',
    'Food Technology', 'Fashion Technology', 'Information Science',
    'Artificial Intelligence and Data Science', 'Artificial Intelligence and Machine Learning',
    'Biotechnology', 'MBA', 'MCA', 'Other'
];
const STREAMS = ['BE', 'BTECH', 'MCA', 'MBA', 'Other'];
const YEARS = ['1', '2', '3', '4'];

const Profile = () => {
    const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);
    const user = authUser || JSON.parse(localStorage.getItem('coursehub_user') || '{}');
    const [activeTab, setActiveTab] = useState('personal');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        institute: user?.institute || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
        rollNumber: user?.rollNumber || '',
        department: user?.department || '',
        year: user?.year || '',
        stream: user?.stream || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePwdChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put('/api/auth/profile', formData);
            const stored = JSON.parse(localStorage.getItem('coursehub_user') || '{}');
            const updatedUser = { ...stored, ...data };
            localStorage.setItem('coursehub_user', JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            await axios.put('/api/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const initials = (formData.name || '?').charAt(0).toUpperCase();

    const tabBtnStyle = (tab) => ({
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        background: activeTab === tab ? 'var(--primary)' : 'transparent',
        color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    });

    return (
        <StudentLayout>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information and account settings</p>
                </div>

                {/* Profile Header Card */}
                <Card style={{ marginBottom: '2rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                        ) : (
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                                {initials}
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{formData.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user.email}</div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {formData.rollNumber && <span className="badge badge-primary">{formData.rollNumber}</span>}
                            {formData.department && <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-main)' }}>{formData.department}</span>}
                            {formData.stream && <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-main)' }}>{formData.stream}</span>}
                            {formData.year && <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-main)' }}>Year {formData.year}</span>}
                        </div>
                    </div>
                </Card>

                {/* Tab Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface)', padding: '0.375rem', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
                    <button style={tabBtnStyle('personal')} onClick={() => setActiveTab('personal')}>
                        <GraduationCap size={16} /> Personal Info
                    </button>
                    <button style={tabBtnStyle('security')} onClick={() => setActiveTab('security')}>
                        <Lock size={16} /> Security
                    </button>
                </div>

                {activeTab === 'personal' && (
                    <form onSubmit={handleSave}>
                        <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Personal Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                                <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="e.g. CMR2024001" />
                                <Input label="Email ID" name="email" value={user.email} disabled />
                            </div>
                        </Card>

                        <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Academic Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                                    <select name="department" value={formData.department} onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Stream</label>
                                    <select name="stream" value={formData.stream} onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        <option value="">Select Stream</option>
                                        {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Year of Study</label>
                                    <select name="year" value={formData.year} onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        <option value="">Select Year</option>
                                        {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Card>


                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" disabled={loading}>
                                <Save size={16} style={{ marginRight: '0.5rem' }} />
                                {loading ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </form>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate}>
                        <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Change Password</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                                <Input label="Current Password" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePwdChange} required />
                                <Input label="New Password" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePwdChange} required />
                                <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePwdChange} required />
                            </div>
                        </Card>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" disabled={loading}>
                                <Lock size={16} style={{ marginRight: '0.5rem' }} />
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </StudentLayout>
    );
};

export default Profile;
