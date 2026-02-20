import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Loader2, Globe, Lock, AlertCircle } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import '../../styles/pages.css';

const CourseConfig = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
            setIsPublished(data.isPublished);
        } catch (error) {
            console.error('Error fetching course:', error);
            setMessage({ type: 'error', text: 'Failed to load course configurations.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put(`/courses/${id}`, { isPublished });
            setMessage({ type: 'success', text: 'Configuration updated successfully.' });
            setTimeout(() => navigate('/admin/courses'), 1500);
        } catch (error) {
            console.error('Error updating course:', error);
            setMessage({ type: 'error', text: 'Failed to update configuration.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="content-wrapper">Loading configurations...</div>;
    if (!course) return <div className="content-wrapper">Course not found.</div>;

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/admin/courses" className="back-link">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="page-title">Course Configuration</h1>
                        <p style={{ color: 'var(--text-gray)' }}>Manage visibility and settings for <strong>{course.title}</strong></p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </Button>
            </div>

            {message.text && (
                <div style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '25px',
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#059669' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                    {message.type === 'error' && <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div style={{ maxWidth: '800px' }}>
                <Card style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Globe size={22} className="text-primary" /> Visibility Settings
                    </h2>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: '0 0 4px 0' }}>Public Visibility</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                {isPublished
                                    ? "This course is currently live and visible to all students."
                                    : "This course is currently a draft and hidden from students."}
                            </p>
                        </div>

                        <div
                            onClick={() => setIsPublished(!isPublished)}
                            style={{
                                width: '50px',
                                height: '26px',
                                background: isPublished ? 'var(--primary-color)' : '#cbd5e1',
                                borderRadius: '13px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.3s ease'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: isPublished ? '27px' : '3px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', padding: '15px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', display: 'flex', gap: '12px' }}>
                        <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>
                            <strong>Note:</strong> When set to "Draft", students will not be able to find, enroll in, or view this course. They can only see courses that are "Live".
                        </p>
                    </div>
                </Card>

                <Card style={{ padding: '30px', marginTop: '20px', opacity: 0.6 }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#64748b' }}>Advanced Settings</h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Additional course configurations will be available here in future updates (e.g., enrollment period, prerequisites, certificate generation).</p>
                </Card>
            </div>
        </div>
    );
};

export default CourseConfig;
