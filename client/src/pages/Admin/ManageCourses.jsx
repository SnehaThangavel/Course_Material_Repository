import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Globe, Lock, X } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import '../../styles/pages.css';

const ManageCourses = () => {
    const [searchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Initialize status from URL query param if present
    const initialStatus = searchParams.get('status') || '';
    const [filters, setFilters] = useState({
        status: initialStatus,
        level: '',
        category: ''
    });

    useEffect(() => {
        if (initialStatus) {
            setShowFilters(true);
        }
        fetchCourses();
    }, [initialStatus]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter((course) => course._id !== id));
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => setFilters({ status: '', level: '', category: '' });

    // Dynamic category list from actual data
    const categories = useMemo(() =>
        [...new Set(courses.map(c => c.category).filter(Boolean))].sort(),
        [courses]
    );

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    const filteredCourses = useMemo(() => courses.filter(c => {
        const matchSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus =
            filters.status === '' ||
            (filters.status === 'live' ? c.isPublished : !c.isPublished);
        const matchLevel = filters.level === '' || c.level === filters.level;
        const matchCategory = filters.category === '' || c.category === filters.category;
        return matchSearch && matchStatus && matchLevel && matchCategory;
    }), [courses, searchQuery, filters]);

    if (loading) return <div className="content-wrapper">Loading Course Repository...</div>;

    const selectStyle = {
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '0.9rem',
        background: 'white',
        color: '#334155',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '160px',
    };

    return (
        <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title">Course Management</h1>
                    <p style={{ color: 'var(--text-gray)' }}>Centralized hub for curriculum development and publishing.</p>
                </div>
                <Link to="/admin/add-course">
                    <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px' }}>
                        <Plus size={20} /> Create New Course
                    </Button>
                </Link>
            </div>

            {/* Search + Filter toggle */}
            <div className="filter-bar" style={{ display: 'flex', gap: '15px', marginBottom: showFilters ? '15px' : '30px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                    <input
                        type="text"
                        placeholder="Search by title or course code..."
                        className="form-input"
                        style={{ paddingLeft: '45px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: showFilters ? '#eff6ff' : 'white',
                        borderColor: showFilters ? 'var(--primary-color)' : '#e2e8f0',
                        color: showFilters ? 'var(--primary-color)' : '#334155'
                    }}
                    onClick={() => setShowFilters(v => !v)}
                >
                    <Filter size={18} /> Filters
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: 'var(--primary-color)', color: 'white',
                            borderRadius: '50%', width: '18px', height: '18px',
                            fontSize: '0.7rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div style={{
                    display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap',
                    marginBottom: '30px', padding: '20px 24px',
                    background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'
                }}>
                    {/* Status Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Status
                        </label>
                        <select style={selectStyle} value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
                            <option value="">All Status</option>
                            <option value="live">🌐 Live (Published)</option>
                            <option value="draft">🔒 Draft (Unpublished)</option>
                        </select>
                    </div>

                    {/* Level Filter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Level
                        </label>
                        <select style={selectStyle} value={filters.level} onChange={e => handleFilterChange('level', e.target.value)}>
                            <option value="">All Levels</option>
                            <option value="Beginner">🌱 Beginner</option>
                            <option value="Intermediate">📘 Intermediate</option>
                            <option value="Advanced">🚀 Advanced</option>
                        </select>
                    </div>

                    {/* Category Filter (dynamic from data) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Category
                        </label>
                        <select style={selectStyle} value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear + Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 14px', borderRadius: '8px',
                                    border: '1px solid #fca5a5', background: '#fef2f2',
                                    color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                                }}
                            >
                                <X size={14} /> Clear Filters
                            </button>
                        )}
                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                            Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
                        </span>
                    </div>
                </div>
            )}

            {/* Course List */}
            <div style={{ display: 'grid', gap: '20px' }}>
                {filteredCourses.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '60px' }}>
                        <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>No courses matching your criteria found.</p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                style={{ marginTop: '15px', padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 600 }}
                            >
                                Clear all filters
                            </button>
                        )}
                    </Card>
                ) : (
                    filteredCourses.map((course) => (
                        <Card key={course._id} className="course-admin-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{
                                    width: '180px', height: '120px',
                                    background: course.coverImage
                                        ? `url(${course.coverImage}) center/cover`
                                        : '#f1f5f9',
                                    borderRight: '1px solid #e2e8f0'
                                }}>
                                    {!course.coverImage && (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                            <Globe size={40} opacity={0.3} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#eff6ff', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px' }}>
                                                {course.code}
                                            </span>
                                            {course.isPublished ? (
                                                <Link to={`/admin/course-config/${course._id}`} style={{ textDecoration: 'none' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                                        <Globe size={12} /> Live
                                                    </span>
                                                </Link>
                                            ) : (
                                                <Link to={`/admin/course-config/${course._id}`} style={{ textDecoration: 'none' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                                        <Lock size={12} /> Draft
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                        <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem' }}>{course.title}</h3>
                                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                            <span><strong>{course.materials.length}</strong> Materials</span>
                                            <span><strong>{course.level}</strong></span>
                                            <span>{course.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Link to={`/admin/edit-course/${course._id}`}>
                                            <Button variant="outline" style={{ padding: '8px 12px' }} title="Edit">
                                                <Edit size={18} />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none' }}
                                            onClick={() => handleDelete(course._id)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageCourses;
