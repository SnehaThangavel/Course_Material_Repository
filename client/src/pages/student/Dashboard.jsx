import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { Search, BookA, Bookmark, CheckCircle, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [totalCourses, setTotalCourses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [recentCourses, setRecentCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const visibleEnrollments = enrollments.filter(e => {
        if (!e.courseId) return false;
        if (e.courseId.levels && e.courseId.levels.length > 0) {
            return e.levelNumber > 0;
        }
        return e.levelNumber === 0;
    });

    const activeEnrollments = visibleEnrollments.filter(e => !e.completed);
    const completedEnrollments = visibleEnrollments.filter(e => e.completed);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollRes, courseRes] = await Promise.all([
                    axios.get('/api/mycourses'),
                    axios.get('/api/courses')
                ]);

                const allCourses = courseRes.data || [];
                setEnrollments(enrollRes.data || []);
                setTotalCourses(allCourses.length);

                // Show all courses to match admin visibility (up to 7+)
                setRecentCourses(allCourses.slice(0, 10));
            } catch (err) {
                console.error('Frontend Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/student/discovery?search=${searchQuery}`);
        }
    };

    return (
        <StudentLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '5rem' }}>

                {/* Hero Section */}
                <div style={{ textAlign: 'center', padding: '1rem 0 2rem 0' }}>
                    <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Master Your Craft with<br />CourseHub Repository
                    </h1>
                    <p className="page-subtitle" style={{ maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
                        Access high-quality course materials, track your progress in real-time, and build your professional portfolio with our structured learning resources.
                    </p>

                    <form onSubmit={handleSearch} style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', background: 'var(--surface)', padding: '0.6rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid var(--border)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1.5rem', color: 'var(--text-light)' }}>
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for courses, topics, or materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 1.25rem', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
                        />
                        <button type="submit" className="btn-primary" style={{ borderRadius: '14px', padding: '0.75rem 2rem' }}>
                            Find Courses
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
                        <Link to="/student/discovery" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }} className="hover:text-primary">Browse All Resources</Link>
                        <Link to="/student/analytics" style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }} className="hover:text-primary">Check Analytics</Link>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid-3" style={{ marginBottom: '1rem' }}>
                    <Link to="/student/discovery" style={{ textDecoration: 'none' }}>
                        <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', cursor: 'pointer' }}>
                            <div className="stat-icon-bg" style={{ background: 'linear-gradient(135deg, #e0f2fe, #fff)', color: '#0ea5e9' }}>
                                <BookA size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.25rem' }}>{totalCourses}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Courses</div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/student/courses" style={{ textDecoration: 'none' }}>
                        <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', cursor: 'pointer' }}>
                            <div className="stat-icon-bg" style={{ background: 'linear-gradient(135deg, #ffedd5, #fff)', color: '#f97316' }}>
                                <Bookmark size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.25rem' }}>{activeEnrollments.length}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Registered Courses</div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/student/courses?filter=completed" style={{ textDecoration: 'none' }}>
                        <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem', cursor: 'pointer' }}>
                            <div className="stat-icon-bg" style={{ background: 'linear-gradient(135deg, #dcfce7, #fff)', color: '#22c55e' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.25rem' }}>{completedEnrollments.length}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Completed</div>
                            </div>
                        </Card>
                    </Link>

                </div>

                {/* Skill Explorer Section */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '8px', height: '28px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                        <h2 className="section-title" style={{ margin: 0 }}>Skill Explorer</h2>
                    </div>
                    <div className="grid-3" style={{ gap: '1.5rem' }}>
                        {[
                            { name: 'Software', icon: <Zap size={24} />, desc: 'Programming, Web & AI', color: '#6366f1' },
                            { name: 'Hardware', icon: <Layers size={24} />, desc: 'Electronics & Infrastructure', color: '#8b5cf6' },
                            { name: 'General', icon: <BookA size={24} />, desc: 'Professional Development', color: '#06b6d4' }
                        ].map((cat) => (
                            <Link key={cat.name} to={`/student/discovery?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                                <Card style={{ padding: '2rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid var(--border)' }} className="hover:translate-y-[-6px] hover:border-primary-light hover:shadow-lg">
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{cat.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{cat.desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* All Courses Repository Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Knowledge Repository</h2>
                        <Link to="/student/courses" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>View All Modules</Link>
                    </div>

                    {loading ? <div style={{ padding: '4rem 0' }}><Loader /></div> : (
                        <div className="grid-3">
                            {recentCourses.map(course => {
                                const isEnrolled = enrollments.find(e => e.courseId?._id === course._id);
                                return (
                                    <Card key={course._id} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
                                        <div style={{ height: '12rem', background: 'var(--surface-muted)', overflow: 'hidden', position: 'relative' }}>
                                            {course.coverImage ? (
                                                <img src={course.coverImage} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                                    <BookA size={48} strokeWidth={1.5} />
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                                                <span className="badge badge-primary" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.9)', color: 'var(--primary)' }}>
                                                    {course.courseCode}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.4 }}>{course.title}</h3>

                                            <div style={{ marginTop: 'auto' }}>
                                                <Link to={`/student/course/${course._id}`}>
                                                    <button className={isEnrolled ? 'btn-secondary' : 'btn-primary'} style={{ width: '100%' }}>
                                                        {isEnrolled ? (isEnrolled.completed ? 'Review Content' : 'Continue Module') : 'Enroll Now'}
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                            {recentCourses.length === 0 && (
                                <div className="card" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '5rem', background: 'var(--surface)' }}>
                                    <BookA size={48} style={{ color: 'var(--text-light)', marginBottom: '1.5rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No courses are currently available in the repository.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Discovery Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Recently Discovered</h2>
                        <Link to="/student/courses" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>Browse All</Link>
                    </div>
                    <div className="grid-2">
                        {recentCourses.length > 0 ? recentCourses.slice(0, 4).map(course => (
                            <Card key={course._id} style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '100px', height: '70px', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {course.coverImage ? <img src={course.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookA size={28} style={{ color: 'var(--text-light)' }} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                        <span style={{ color: 'var(--primary)' }}>{course.level}</span>
                                        <span style={{ color: 'var(--text-light)' }}>•</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{course.category}</span>
                                    </div>
                                </div>
                                <Link to={`/student/course/${course._id}`}>
                                    <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>View</button>
                                </Link>
                            </Card>
                        )) : (
                            <div className="empty-state">No recently added courses found.</div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
