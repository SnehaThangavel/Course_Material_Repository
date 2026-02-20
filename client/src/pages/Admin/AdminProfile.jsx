import React, { useState, useEffect } from 'react';
import { Camera, User, Shield, List, ChevronLeft, ChevronRight, Activity, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import Toast from '../../components/UI/Toast';
import '../../styles/pages.css';

const AdminProfile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        organization: user?.organization || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [activityData, setActivityData] = useState({
        activities: [],
        page: 1,
        pages: 1
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchActivity(1);
        }
    }, [activeTab]);

    const fetchActivity = async (page) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/auth/activity?page=${page}&limit=10`);
            setActivityData(data);
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const { data } = await api.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateProfile({ ...user, avatar: data.avatar });
            setToast({ type: 'success', text: 'Avatar updated!' });
        } catch (error) {
            setToast({ type: 'error', text: 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            updateProfile(data);
            setToast({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setToast({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setToast({ type: 'error', text: 'New passwords do not match' });
        }
        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setToast({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setToast({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
        } finally {
            setLoading(false);
        }
    };

    const fields = ['name', 'phone', 'bio', 'organization', 'avatar'];
    const completedFields = fields.filter(f => user?.[f] && String(user[f]).length > 0).length;
    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    return (
        <div className="content-wrapper">
            {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

            <div className="page-header">
                <h1 className="page-title">Admin Settings</h1>
            </div>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Card style={{ textAlign: 'center' }}>
                        <div className="profile-avatar-container" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="avatar-upload-btn" style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', transition: 'all 0.3s' }}>
                                <Camera size={18} color="var(--primary-color)" />
                                <input type="file" style={{ display: 'none' }} onChange={handleAvatarChange} accept="image/*" disabled={uploading} />
                            </label>
                            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>...</div>}
                        </div>
                        <h2 style={{ margin: '0 0 5px' }}>{user?.name}</h2>
                        <p style={{ color: 'var(--text-gray)', marginBottom: '15px' }}>{user?.email}</p>

                        <div style={{ marginTop: '25px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span>Profile Completion</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{completionPercentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.5s ease' }}></div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <button onClick={() => setActiveTab('personal')} className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}>
                                <User size={18} /> Administrative Info
                            </button>
                            <button onClick={() => setActiveTab('security')} className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}>
                                <Shield size={18} /> Security Guard
                            </button>
                            <button onClick={() => setActiveTab('activity')} className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}>
                                <Activity size={18} /> System Activity
                            </button>
                        </div>
                    </Card>
                </div>

                <div className="profile-content">
                    {activeTab === 'personal' && (
                        <Card>
                            <h3 className="section-title">Edit Administrative Details</h3>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="grid-2" style={{ gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Institute / Company</label>
                                        <input type="text" name="organization" className="form-input" value={formData.organization} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label className="form-label">Professional Bio</label>
                                    <textarea name="bio" className="form-input" value={formData.bio} onChange={handleInputChange} rows="4" style={{ height: 'auto' }}></textarea>
                                </div>
                                <div style={{ marginTop: '30px' }}>
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        {loading ? 'Saving Changes...' : 'Save Profile'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card>
                            <h3 className="section-title">Security Governance</h3>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label className="form-label">Current Master Password</label>
                                    <input type="password" name="currentPassword" className="form-input" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                                </div>
                                <div className="grid-2" style={{ gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input type="password" name="newPassword" className="form-input" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input type="password" name="confirmPassword" className="form-input" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                                    </div>
                                </div>
                                <div style={{ marginTop: '30px' }}>
                                    <Button type="submit" variant="primary" disabled={loading}>
                                        {loading ? 'Updating Credentials...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                            <div style={{ marginTop: '40px', padding: '20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                                <Settings color="#c2410c" size={24} />
                                <div>
                                    <h4 style={{ margin: '0 0 5px', color: '#9a3412' }}>Administrative Guard</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#c2410c' }}>Regular password rotations are recommended for system integrity.</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'activity' && (
                        <Card>
                            <h3 className="section-title">Audit Log</h3>
                            <div className="timeline" style={{ padding: '20px 0' }}>
                                {activityData.activities.length > 0 ? (
                                    activityData.activities.map((log) => (
                                        <div key={log._id} className="timeline-item" style={{ paddingBottom: '25px' }}>
                                            <div className="timeline-dot" style={{ top: '5px' }}></div>
                                            <div className="timeline-content" style={{ padding: '12px 18px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                    <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{log.action.replace(/_/g, ' ')}</strong>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-gray)' }}>{log.details}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '40px' }}>No system logs found.</p>
                                )}
                            </div>

                            {activityData.pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                                    <Button variant="outline" disabled={activityData.page === 1} onClick={() => fetchActivity(activityData.page - 1)} style={{ padding: '8px' }}>
                                        <ChevronLeft size={18} />
                                    </Button>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Page {activityData.page} of {activityData.pages}</span>
                                    <Button variant="outline" disabled={activityData.page === activityData.pages} onClick={() => fetchActivity(activityData.page + 1)} style={{ padding: '8px' }}>
                                        <ChevronRight size={18} />
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
