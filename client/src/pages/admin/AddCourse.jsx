import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ChevronLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, BookOpen, Link as LinkIcon, Edit2 } from 'lucide-react';

const SKILL_CATS = ['Software', 'Hardware', 'General'];

const AddCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [course, setCourse] = useState({
        title: '', courseCode: '', category: 'Software',
        skillCategory: 'Software', level: 'Beginner',
        description: '', coverImage: '',
        isPublished: false, levels: [],
        sections: []
    });

    const [loading, setLoading] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState(null);

    useEffect(() => {
        if (isEditing) {
            axios.get(`/api/courses/${id}`)
                .then(res => {
                    const c = res.data;
                    if (!c.levels) c.levels = [];
                    setCourse(c);
                    if (c.levels.length > 0) setExpandedLevel(0);
                })
                .catch(() => toast.error('Failed to load course'));
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setCourse({ ...course, [e.target.name]: val });
    };

    const addLevel = () => {
        const newLevels = [...course.levels, {
            levelNumber: course.levels.length + 1,
            levelTitle: `Level ${course.levels.length + 1}`,
            topics: []
        }];
        setCourse({ ...course, levels: newLevels, totalLevels: newLevels.length });
        setExpandedLevel(newLevels.length - 1);
    };

    const removeLevel = (idx) => {
        if (!window.confirm('Remove this level?')) return;
        const newLevels = course.levels.filter((_, i) => i !== idx).map((l, i) => ({ ...l, levelNumber: i + 1 }));
        setCourse({ ...course, levels: newLevels, totalLevels: newLevels.length });
        if (expandedLevel === idx) setExpandedLevel(null);
    };

    const updateLevel = (idx, field, value) => {
        const newLevels = [...course.levels];
        newLevels[idx] = { ...newLevels[idx], [field]: value };
        setCourse({ ...course, levels: newLevels });
    };

    const addTopic = (levelIdx) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics = [...(newLevels[levelIdx].topics || []), { title: '', materials: [] }];
        setCourse({ ...course, levels: newLevels });
    };

    const updateTopic = (levelIdx, topicIdx, value) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics[topicIdx] = { ...newLevels[levelIdx].topics[topicIdx], title: value };
        setCourse({ ...course, levels: newLevels });
    };

    const removeTopic = (levelIdx, topicIdx) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics.splice(topicIdx, 1);
        setCourse({ ...course, levels: newLevels });
    };

    const addMaterial = (levelIdx, topicIdx) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics[topicIdx].materials = [
            ...(newLevels[levelIdx].topics[topicIdx].materials || []),
            { title: '', type: 'link', url: '' }
        ];
        setCourse({ ...course, levels: newLevels });
    };

    const updateMaterial = (levelIdx, topicIdx, matIdx, field, value) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics[topicIdx].materials[matIdx] = {
            ...newLevels[levelIdx].topics[topicIdx].materials[matIdx],
            [field]: value
        };
        setCourse({ ...course, levels: newLevels });
    };

    const removeMaterial = (levelIdx, topicIdx, matIdx) => {
        const newLevels = [...course.levels];
        newLevels[levelIdx].topics[topicIdx].materials.splice(matIdx, 1);
        setCourse({ ...course, levels: newLevels });
    };

    const handleSave = async (publishStatus) => {
        if (!course.title || !course.courseCode) {
            return toast.error('Title and Course Code are required');
        }
        setLoading(true);
        try {
            const payload = { ...course, isPublished: publishStatus, totalLevels: course.levels.length };
            if (isEditing) {
                await axios.put(`/api/courses/${id}`, payload);
                toast.success('Course updated successfully');
            } else {
                await axios.post('/api/courses', payload);
                toast.success('Course created successfully');
            }
            navigate('/admin/courses');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.6rem 0.9rem', borderRadius: '8px',
        border: '1.5px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text-main)', fontSize: '0.875rem'
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/admin/courses')} className="btn-secondary" style={{ padding: '0.5rem' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: 0 }}>{isEditing ? 'Edit Course' : 'Add New Course'}</h1>
                            <p className="page-subtitle" style={{ marginBottom: 0 }}>Define course structure with levels and topics</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary">
                            Save Draft
                        </button>
                        <button onClick={() => handleSave(true)} disabled={loading} className="btn-primary">
                            <Save size={16} style={{ marginRight: '0.4rem' }} />
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>

                {/* Basic Info */}
                <Card style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Course Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input label="Course Title*" name="title" value={course.title} onChange={handleChange} placeholder="e.g. Java Programming" required />
                        <Input label="Course Code*" name="courseCode" value={course.courseCode} onChange={handleChange} placeholder="e.g. JAVA-101" required />

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skill Category</label>
                            <select name="skillCategory" value={course.skillCategory} onChange={handleChange} style={inputStyle}>
                                {SKILL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Difficulty Level</label>
                            <select name="level" value={course.level} onChange={handleChange} style={inputStyle}>
                                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</label>
                            <textarea name="description" value={course.description} onChange={handleChange}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Course description..." />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Input label="Cover Image URL" name="coverImage" value={course.coverImage} onChange={handleChange} placeholder="https://..." />
                        </div>
                    </div>
                </Card>

                {/* Levels Section */}
                <Card style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 0 }}>
                                Course Levels
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {course.levels.length} level{course.levels.length !== 1 ? 's' : ''} defined
                            </p>
                        </div>
                        <button onClick={addLevel} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <Plus size={16} /> Add Level
                        </button>
                    </div>

                    {course.levels.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', borderRadius: '10px', border: '2px dashed var(--border)' }}>
                            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No levels yet. Click "Add Level" to get started.</p>
                        </div>
                    )}

                    {course.levels.map((level, lIdx) => (
                        <div key={lIdx} style={{ border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                            {/* Level Header */}
                            <div
                                onClick={() => setExpandedLevel(expandedLevel === lIdx ? null : lIdx)}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', background: 'var(--surface)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                    {level.levelNumber}
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        value={level.levelTitle}
                                        onChange={(e) => { e.stopPropagation(); updateLevel(lIdx, 'levelTitle', e.target.value); }}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ 
                                            flex: 1, 
                                            border: '1px solid transparent', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px',
                                            background: 'transparent', 
                                            color: 'var(--text-main)', 
                                            fontWeight: 700, 
                                            fontSize: '0.95rem', 
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        className="level-title-input"
                                        placeholder="Level title (e.g. Programming Java Level - 1)"
                                    />
                                    <Edit2 size={14} style={{ color: 'var(--text-light)', opacity: 0.6 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(level.topics || []).length} topics</span>
                                    <button onClick={(e) => { e.stopPropagation(); removeLevel(lIdx); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}>
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedLevel === lIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Level Body */}
                            {expandedLevel === lIdx && (
                                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                                    {(level.topics || []).map((topic, tIdx) => (
                                        <div key={tIdx} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>Topic {tIdx + 1}</span>
                                                <input
                                                    value={topic.title}
                                                    onChange={(e) => updateTopic(lIdx, tIdx, e.target.value)}
                                                    style={{ ...inputStyle, flex: 1 }}
                                                    placeholder="Topic title (e.g. Variables & Data Types)"
                                                />
                                                <button onClick={() => removeTopic(lIdx, tIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            {/* Materials */}
                                            {(topic.materials || []).map((mat, mIdx) => (
                                                <div key={mIdx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr auto auto', gap: '0.5rem', marginBottom: '0.5rem', paddingLeft: '2rem', alignItems: 'center' }}>
                                                    <input value={mat.title} onChange={(e) => updateMaterial(lIdx, tIdx, mIdx, 'title', e.target.value)} style={inputStyle} placeholder="Material title" title="Material Title" />
                                                    <select value={mat.type} onChange={(e) => updateMaterial(lIdx, tIdx, mIdx, 'type', e.target.value)} style={inputStyle} title="Material Type">
                                                        {['link', 'pdf', 'youtube', 'document', 'image', 'zip'].map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    <input value={mat.url} onChange={(e) => updateMaterial(lIdx, tIdx, mIdx, 'url', e.target.value)} style={inputStyle} placeholder="URL or File Path" title="Material URL/Path" />
                                                    
                                                    {/* Upload Button for specific types */}
                                                    {['pdf', 'document', 'image', 'zip'].includes(mat.type) && (
                                                        <div style={{ position: 'relative' }}>
                                                            <button 
                                                                type="button"
                                                                className="btn-secondary" 
                                                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                                onClick={() => document.getElementById(`file-upload-${lIdx}-${tIdx}-${mIdx}`).click()}
                                                            >
                                                                <Plus size={12} /> Upload
                                                            </button>
                                                            <input 
                                                                id={`file-upload-${lIdx}-${tIdx}-${mIdx}`}
                                                                type="file" 
                                                                style={{ display: 'none' }} 
                                                                onChange={async (e) => {
                                                                    if (e.target.files && e.target.files[0]) {
                                                                        const file = e.target.files[0];
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        try {
                                                                            toast.info('Uploading file...');
                                                                            const res = await axios.post('/api/upload', formData, {
                                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                                            });
                                                                            updateMaterial(lIdx, tIdx, mIdx, 'url', res.data.url);
                                                                            if (!mat.title) updateMaterial(lIdx, tIdx, mIdx, 'title', file.name);
                                                                            toast.success('File uploaded successfully');
                                                                        } catch (err) {
                                                                            toast.error(err.response?.data?.message || 'Upload failed');
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    <button onClick={() => removeMaterial(lIdx, tIdx, mIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Remove Material">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => addMaterial(lIdx, tIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', paddingLeft: '2rem', marginTop: '0.25rem' }}>
                                                <LinkIcon size={13} /> Add Material / Link
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addTopic(lIdx)}
                                        style={{ background: 'none', border: '1.5px dashed var(--border)', borderRadius: '8px', padding: '0.6rem 1rem', width: '100%', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <Plus size={15} /> Add Topic / Portion
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AddCourse;
