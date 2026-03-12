import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { Search, Plus, Edit2, Trash2, Filter, Globe, X, BookOpen, FileText, Layers } from 'lucide-react';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'all';
    const [statusFilter, setStatusFilter] = useState(initialFilter);
    const [levelFilter, setLevelFilter] = useState('All Professional Levels');

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setLevelFilter('All Professional Levels');
    };

    const fetchCourses = () => {
        setLoading(true);
        axios.get(`/api/courses?search=${searchTerm}`)
            .then(res => setCourses(res.data))
            .catch(err => toast.error('Failed to fetch courses'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCourses();
    }, [searchTerm]);

    const filteredCourses = courses.filter(course => {
        let matchesStatus = true;
        if (statusFilter === 'draft') matchesStatus = !course.isPublished;
        if (statusFilter === 'published') matchesStatus = course.isPublished;

        let matchesLevel = true;
        if (levelFilter !== 'All Professional Levels') {
            matchesLevel = course.level === levelFilter;
        }

        return matchesStatus && matchesLevel;
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/api/courses/${id}`);
                setCourses(courses.filter(c => c._id !== id));
                toast.success('Course deleted');
            } catch (err) {
                toast.error('Failed to delete course');
            }
        }
    };

    return (
        <AdminLayout>
            <div style={{ paddingBottom: '5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="page-title">Curriculum Management</h1>
                        <p className="page-subtitle" style={{ marginBottom: 0 }}>Create, publish, and manage all your educational resources in one place.</p>
                    </div>
                    <Link to="/admin/add-course">
                        <button className="btn-primary"><Plus size={18} /> New Course</button>
                    </Link>
                </div>

                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div className="input-with-icon" style={{ flex: 1 }}>
                            <div className="input-icon"><Search size={18} /></div>
                            <input
                                type="text"
                                placeholder="Search by title, code, or description..."
                                className="input-field has-icon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-secondary">
                            <Filter size={18} /> Advanced Filters
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                            <label className="input-label">Publishing Status</label>
                            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Content</option>
                                <option value="published">🌐 Live / Published</option>
                                <option value="draft">📁 Drafts Only</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
                            <label className="input-label">Course Level</label>
                            <select className="input-field" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                                <option value="All Professional Levels">All Professional Levels</option>
                                <option value="Beginner (Fundamentals)">Beginner (Fundamentals)</option>
                                <option value="Intermediate (Applied)">Intermediate (Applied)</option>
                                <option value="Advanced (Mastery)">Advanced (Mastery)</option>
                            </select>
                        </div>
                        <div style={{ paddingTop: '1.5rem' }}>
                            <button onClick={handleReset} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
                                <X size={16} /> Reset
                            </button>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Showing <strong>{filteredCourses.length}</strong> resources
                        </div>
                    </div>
                </div>

                {loading ? <div style={{ padding: '5rem 0' }}><Loader /></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredCourses.map(course => (
                            <Card key={course._id} style={{ padding: '1.25rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ width: '110px', height: '75px', background: 'var(--surface-muted)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {course.coverImage ? (
                                        <img src={course.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <BookOpen size={32} style={{ color: 'var(--text-light)' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <span className="badge badge-primary">{course.courseCode}</span>
                                        {course.isPublished ? (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Globe size={13} /> Active Repository</span>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>Work in Progress</span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FileText size={14} /> {course.sections?.reduce((acc, sec) => acc + sec.materials.length, 0)} Materials</span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Layers size={14} />
                                            <strong style={{ color: 'var(--primary)' }}>{course.levels?.length || course.totalLevels || 0}</strong>&nbsp;Levels
                                        </span>
                                        <span>•</span>
                                        <span>{course.level}</span>
                                        <span>•</span>
                                        <span>{course.category}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link to={`/admin/edit-course/${course._id}`}>
                                        <button className="btn-secondary" style={{ padding: '0.75rem' }}>
                                            <Edit2 size={18} />
                                        </button>
                                    </Link>
                                    <button onClick={() => handleDelete(course._id)} className="btn-secondary" style={{ padding: '0.75rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                        {filteredCourses.length === 0 && (
                            <div className="card" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem' }}>No courses match your current search and filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageCourses;
