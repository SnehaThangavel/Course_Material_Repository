import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Camera, UserCircle, Lock, Save } from 'lucide-react';

const DEPARTMENTS = [
    'Administration', 'Computer Science', 'Information Technology',
    'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics',
    'MBA', 'MCA', 'Examination Cell', 'Academic Affairs', 'Other'
];

const AdminProfile = () => {
    const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);
    const user = authUser || JSON.parse(localStorage.getItem('coursehub_user') || '{}');
    const [activeTab, setActiveTab] = useState('personal');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        institute: user?.institute || 'CMR University',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
        rollNumber: user?.rollNumber || '',   // used as Admin ID
        department: user?.department || '',
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
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const tabBtnStyle = (tab) => ({
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        padding: '1.25rem', border: '1px solid',
        borderColor: activeTab === tab ? 'var(--primary-light)' : 'transparent',
        borderRadius: '18px', cursor: 'pointer', transition: 'all 0.3s',
        width: '100%', fontWeight: 800, fontSize: '1rem',
        background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
        color: activeTab === tab ? 'var(--primary)' : 'var(--text-light)',
    });

    const labelStyle = {
        fontWeight: 800, fontSize: '0.9rem',
        color: 'var(--text-main)', paddingLeft: '0.5rem'
    };

    const selectStyle = {
        width: '100%', padding: '0.85rem 1rem',
        borderRadius: '12px', border: '1.5px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text-main)',
        fontSize: '0.95rem', outline: 'none',
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '5rem', paddingTop: '1rem' }}>
                <header style={{ padding: '0 0.5rem' }}>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Admin Profile</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>Manage your administrator details and account settings</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '2.5rem', alignItems: 'start' }}>
                    {/* Left Panel */}
                    <Card style={{ padding: '2.5rem 2rem', textAlign: 'center', position: 'sticky', top: '2rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid white', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>{formData.name?.charAt(0) || 'A'}</span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            >
                                <Camera size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                        </div>

                        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{formData.name || 'Admin'}</h2>

                        {/* Admin ID and Department badges */}
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{user.email}</span>
                        </div>
                        {formData.rollNumber && (
                            <div style={{ marginBottom: '0.25rem' }}>
                                <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>ID: {formData.rollNumber}</span>
                            </div>
                        )}
                        {formData.department && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-main)', fontSize: '0.8rem' }}>{formData.department}</span>
                            </div>
                        )}
                        {!formData.rollNumber && !formData.department && <div style={{ marginBottom: '1.5rem' }} />}

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button onClick={() => setActiveTab('personal')} style={tabBtnStyle('personal')}>
                                <UserCircle size={20} /> Personal Info
                            </button>
                            <button onClick={() => setActiveTab('security')} style={tabBtnStyle('security')}>
                                <Lock size={20} /> Change Password
                            </button>
                        </nav>
                    </Card>

                    {/* Right Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {activeTab === 'personal' ? (
                            <Card style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Personal Information</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your admin name, department and contact details.</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={loading} style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={18} />
                                        <span style={{ fontWeight: 800 }}>{loading ? 'Saving...' : 'Save Changes'}</span>
                                    </Button>
                                </div>

                                <form className="flex-col" style={{ gap: '1.75rem' }}>
                                    {/* Name + Phone */}
                                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <label style={labelStyle}>Admin Name</label>
                                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Dr. Rajesh Kumar" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <label style={labelStyle}>Mobile Number</label>
                                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" />
                                        </div>
                                    </div>

                                    {/* Admin ID + Department */}
                                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <label style={labelStyle}>Admin ID</label>
                                            <Input name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="e.g. CMR-ADM-001" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <label style={labelStyle}>Department</label>
                                            <select name="department" value={formData.department} onChange={handleChange} style={selectStyle}>
                                                <option value="">Select Department</option>
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Institution */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={labelStyle}>Institution / University Name</label>
                                        <Input name="institute" value={formData.institute} onChange={handleChange} placeholder="e.g. CMR University, Hyderabad" />
                                    </div>

                                    {/* Bio */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={labelStyle}>About / Designation</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="e.g. Head of Department, Computer Science — responsible for academic curriculum and student mentoring."
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: '0.95rem', resize: 'none', outline: 'none', color: 'var(--text-main)' }}
                                        />
                                    </div>

                                </form>
                            </Card>
                        ) : (
                            <Card style={{ padding: '2.5rem' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Change Password</h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your account password for security.</p>
                                </div>

                                <form onSubmit={handlePasswordUpdate} className="flex-col" style={{ gap: '1.5rem', maxWidth: '420px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={labelStyle}>Current Password</label>
                                        <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePwdChange} required placeholder="Enter current password" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={labelStyle}>New Password</label>
                                        <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePwdChange} required placeholder="Enter new password" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={labelStyle}>Confirm New Password</label>
                                        <Input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePwdChange} required placeholder="Re-enter new password" />
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <Button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem' }}>
                                            <Lock size={18} />
                                            <span style={{ fontWeight: 800 }}>{loading ? 'Updating...' : 'Update Password'}</span>
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;
