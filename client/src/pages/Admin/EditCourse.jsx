import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronLeft, Save, Globe, Lock, Layout, BookOpen,
    Settings, Plus, Trash2, ExternalLink, Image as ImageIcon,
    FileText, Video, Layers, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Toast from '../../components/UI/Toast';
import '../../styles/pages.css';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [toast, setToast] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        code: '',
        description: '',
        category: '',
        level: 'Beginner',
        tags: '',
        isPublished: false
    });

    // Material Form State
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        type: 'pdf',
        link: ''
    });

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
            setFormData({
                title: data.title,
                code: data.code,
                description: data.description,
                category: data.category || 'Uncategorized',
                level: data.level || 'Beginner',
                tags: data.tags ? data.tags.join(', ') : '',
                isPublished: data.isPublished
            });
        } catch (error) {
            setToast({ type: 'error', text: 'Failed to load course details' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            };
            const { data } = await api.put(`/courses/${id}`, payload);
            setCourse(data);
            setToast({ type: 'success', text: 'General information updated!' });
        } catch (error) {
            setToast({ type: 'error', text: error.response?.data?.message || 'Save failed' });
        } finally {
            setSaving(false);
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('cover', file);

        setUploading(true);
        try {
            const { data } = await api.post(`/courses/${id}/upload-cover`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCourse(prev => ({ ...prev, coverImage: data.coverImage }));
            setToast({ type: 'success', text: 'Cover image updated!' });
        } catch (error) {
            setToast({ type: 'error', text: 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/courses/${id}/materials`, newMaterial);
            setCourse(data);
            setNewMaterial({ title: '', type: 'pdf', link: '' });
            setToast({ type: 'success', text: 'New material added to curriculum' });
        } catch (error) {
            setToast({ type: 'error', text: 'Failed to add material' });
        }
    };

    if (loading) return <div className="content-wrapper">Building editor...</div>;

    return (
        <div className="content-wrapper">
            {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

            <div className="page-header" style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/admin/courses" className="no-underline">
                        <Button variant="outline" style={{ padding: '8px' }}><ChevronLeft size={20} /></Button>
                    </Link>
                    <div>
                        <h1 className="page-title">{formData.title || 'Untitled Course'}</h1>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Editing {formData.code || 'Draft'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        variant={formData.isPublished ? "success" : "outline"}
                        onClick={() => handleSaveGeneral({ preventDefault: () => { } })}
                        disabled={saving}
                    >
                        {formData.isPublished ? <Globe size={18} /> : <Lock size={18} />}
                        {formData.isPublished ? " Live" : " Draft"}
                    </Button>
                    <Button variant="primary" onClick={handleSaveGeneral} disabled={saving}>
                        <Save size={18} /> {saving ? "Saving..." : "Save All Changes"}
                    </Button>
                </div>
            </div>

            <div className="tab-navigation" style={{ display: 'flex', gap: '5px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <button onClick={() => setActiveTab('general')} className={`nav-item ${activeTab === 'general' ? 'active' : ''}`} style={{ border: 'none', background: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
                    <Layout size={18} /> General Info
                </button>
                <button onClick={() => setActiveTab('curriculum')} className={`nav-item ${activeTab === 'curriculum' ? 'active' : ''}`} style={{ border: 'none', background: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
                    <BookOpen size={18} /> Curriculum
                </button>
                <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} style={{ border: 'none', background: 'none', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
                    <Settings size={18} /> Configuration
                </button>
            </div>

            <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="editor-main">
                    {activeTab === 'general' && (
                        <Card>
                            <h3 className="section-title">Essential Details</h3>
                            <form onSubmit={handleSaveGeneral}>
                                <div className="form-group">
                                    <label className="form-label">Course Title</label>
                                    <input type="text" name="title" className="form-input" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="grid-2" style={{ gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Course Code</label>
                                        <input type="text" name="code" className="form-input" value={formData.code} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input type="text" name="category" className="form-input" value={formData.category} onChange={handleInputChange} placeholder="e.g. Programming, Design" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea name="description" className="form-input" value={formData.description} onChange={handleInputChange} rows="8" style={{ height: 'auto' }} required></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tags (Comma separated)</label>
                                    <input type="text" name="tags" className="form-input" value={formData.tags} onChange={handleInputChange} placeholder="react, frontend, javascript" />
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'curriculum' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 className="section-title" style={{ margin: 0 }}>Materials ({course.materials.length})</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {course.materials.length === 0 ? (
                                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                                        <Layers size={48} opacity={0.3} style={{ marginBottom: '15px' }} />
                                        <p style={{ color: 'var(--text-gray)' }}>Build your curriculum by adding resources.</p>
                                    </Card>
                                ) : (
                                    course.materials.map((mat, i) => (
                                        <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px' }}>
                                            <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                                {mat.type === 'pdf' && <FileText size={20} />}
                                                {mat.type === 'video' && <Video size={20} />}
                                                {mat.type === 'image' && <ImageIcon size={20} />}
                                                {mat.type === 'note' && <BookOpen size={20} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{mat.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'flex', gap: '10px' }}>
                                                    <span style={{ textTransform: 'uppercase' }}>{mat.type}</span>
                                                    <span>•</span>
                                                    <a href={mat.link} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        Source <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                            <Button variant="danger" style={{ padding: '8px', background: 'transparent', color: '#94a3b8' }}><Trash2 size={18} /></Button>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <Card>
                            <h3 className="section-title">Visibility & Level</h3>
                            <div className="form-group">
                                <label className="form-label">Course Level</label>
                                <select name="level" className="form-input" value={formData.level} onChange={handleInputChange}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Public Visibility</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: 'var(--text-gray)' }}>Allow students to find and enroll in this course.</p>
                                    </div>
                                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                                        <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleInputChange} style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', inset: 0,
                                            backgroundColor: formData.isPublished ? 'var(--success)' : '#ccc',
                                            transition: '.4s', borderRadius: '34px'
                                        }}>
                                            <span style={{
                                                position: 'absolute', height: '26px', width: '26px', left: formData.isPublished ? '28px' : '4px',
                                                bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                            }}></span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div style={{ marginTop: '30px', padding: '20px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                                <AlertCircle color="#c2410c" />
                                <div>
                                    <h4 style={{ margin: '0 0 5px', color: '#9a3412' }}>Publishing Notice</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#c2410c' }}>Switching to "Draft" will hide this course from all student search results.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="editor-sidebar">
                    <Card style={{ marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 15px' }}>Cover Image</h4>
                        <div style={{
                            width: '100%', height: '150px',
                            background: course.coverImage ? `url(${course.coverImage}) center/cover` : '#f8fafc',
                            borderRadius: '12px', border: '2px dashed #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>...</div>}
                            {!course.coverImage && <ImageIcon size={32} opacity={0.2} />}
                        </div>
                        <label className="no-underline" style={{ width: '100%' }}>
                            <Button variant="outline" style={{ width: '100%', cursor: 'pointer' }} disabled={uploading}>
                                {course.coverImage ? "Change Cover" : "Upload Cover"}
                                <input type="file" style={{ display: 'none' }} onChange={handleCoverUpload} accept="image/*" />
                            </Button>
                        </label>
                    </Card>

                    {activeTab === 'curriculum' && (
                        <Card>
                            <h4 style={{ margin: '0 0 15px' }}>Quick Add Material</h4>
                            <form onSubmit={handleAddMaterial}>
                                <div className="form-group">
                                    <label className="form-label">Resource Title</label>
                                    <input type="text" className="form-input" value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} required placeholder="e.g. Core Concepts PDF" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Resource Type</label>
                                    <select className="form-input" value={newMaterial.type} onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}>
                                        <option value="pdf">PDF Document</option>
                                        <option value="video">Video Lecture</option>
                                        <option value="image">Graphic Image</option>
                                        <option value="note">Textual Note</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL / Content</label>
                                    <input type="text" className="form-input" value={newMaterial.link} onChange={e => setNewMaterial({ ...newMaterial, link: e.target.value })} required placeholder="https://..." />
                                </div>
                                <Button type="submit" variant="secondary" style={{ width: '100%' }}>
                                    <Plus size={18} /> Add to Curriculum
                                </Button>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCourse;
