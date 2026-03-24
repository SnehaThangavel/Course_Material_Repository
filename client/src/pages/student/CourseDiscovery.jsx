import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { Search, Filter, BookOpen } from 'lucide-react';

const CourseDiscovery = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';
    const initialCategory = queryParams.get('category') || 'All';

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [category, setCategory] = useState(initialCategory);
    const [level, setLevel] = useState('All');

    useEffect(() => {
        setLoading(true);
        const levelQuery = level === 'All' ? '' : `&level=${level}`;
        axios.get(`/api/courses?search=${searchTerm}&category=${category === 'All' ? '' : category}${levelQuery}`)
            .then(res => setCourses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [searchTerm, category, level]);

    return (
        <StudentLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '5rem' }}>
                <div>
                    <h1 className="page-title">Resource Discovery</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Explore our catalog of professional courses and academic materials.</p>
                </div>

                <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ flex: 1, minWidth: '300px' }}>
                        <div className="input-icon"><Search size={20} /></div>
                        <input
                            type="text"
                            placeholder="Find your next course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field has-icon"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input-field"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', fontWeight: 600, flex: 1 }}
                        >
                            <option value="All">All Disciplines</option>
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="General">General</option>
                        </select>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="input-field"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)', fontWeight: 600, flex: 1 }}
                        >
                            <option value="All">All Professional Levels</option>
                            <option value="Beginner">Beginner (Fundamentals)</option>
                            <option value="Intermediate">Intermediate (Applied)</option>
                            <option value="Advanced">Advanced (Mastery)</option>
                        </select>
                    </div>
                </div>

                {loading ? <div style={{ padding: '5rem 0' }}><Loader /></div> : (
                    <div className="grid-3">
                        {courses.map(course => (
                            <Card key={course._id} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '13rem', background: 'var(--surface-muted)', overflow: 'hidden', position: 'relative' }}>
                                    {course.coverImage ? (
                                        <img src={course.coverImage} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                            <BookOpen size={56} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                                        <span className="badge badge-primary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.9)', color: 'var(--primary)' }}>
                                            {course.level}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{course.skillCategory}</div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</h3>
                                    <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginBottom: '2rem', flex: 1, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>

                                    <Link to={`/student/course/${course._id}`}>
                                        <button className="btn-primary" style={{ width: '100%', borderRadius: '12px' }}>Explore Course</button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                        {courses.length === 0 && (
                            <div className="card" style={{ gridColumn: 'span 3', padding: '6rem 2rem', textAlign: 'center' }}>
                                <Search size={56} style={{ marginBottom: '1.5rem', color: 'var(--text-light)', opacity: 0.4 }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.75rem' }}>No courses match your search</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your keywords or category filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default CourseDiscovery;
