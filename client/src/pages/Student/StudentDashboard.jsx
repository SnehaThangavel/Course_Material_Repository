import React, { useEffect, useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        // Fetch courses to calculate total available
        api.get('/courses').then(res => {
            setCourses(res.data);
            // If user has enrolledCourses from context/auth, filter them
            if (user?.enrolledCourses) {
                setEnrolledCourses(res.data.filter(c => user.enrolledCourses.includes(c._id)));
            }
        });

        // Fetch user data again to ensure we have latest completed courses
        api.get('/auth/me').then(res => {
            setCompletedCount(res.data.completedCourses?.length || 0);
            if (res.data.enrolledCourses) {
                api.get('/courses').then(cRes => {
                    setEnrolledCourses(cRes.data.filter(c => res.data.enrolledCourses.includes(c._id)));
                });
            }
        });
    }, [user?.enrolledCourses]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div>
            <div className="hero-banner">
                <div className="hero-content">
                    <h1 className="hero-title">Unlock Your Potential with CourseHub</h1>
                    <p className="hero-subtitle">
                        Access premium course materials, track your progress, and master new skills with our structured learning repository.
                    </p>
                    <form onSubmit={handleSearch} className="hero-search-container">
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="hero-search-btn">
                            <i className="fa-solid fa-magnifying-glass" style={{ marginRight: '8px' }}></i>
                            Search
                        </button>
                    </form>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <Link to="/student/courses" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.9rem' }}>Explore All Courses</Link>
                        <Link to="/student/progress" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.9rem' }}>View My Progress</Link>
                    </div>
                </div>
            </div>

            <div className="grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
                <Link to="/student/courses" className="no-underline">
                    <Card className="stat-card clickable">
                        <div className="stat-icon bg-blue-light">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem' }}>{courses.length}</h3>
                            <p style={{ color: 'var(--text-gray)' }}>Available Courses</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/student/view-progress" className="no-underline">
                    <Card className="stat-card clickable">
                        <div className="stat-icon bg-orange-light">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem' }}>{enrolledCourses.length}</h3>
                            <p style={{ color: 'var(--text-gray)' }}>Registered Courses</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/student/courses?status=completed" className="no-underline">
                    <Card className="stat-card clickable">
                        <div className="stat-icon bg-green-light">
                            <i className="fa-solid fa-check-circle"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem' }}>{completedCount}</h3>
                            <p style={{ color: 'var(--text-gray)' }}>Completed</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/student/progress" className="no-underline">
                    <Card className="stat-card clickable">
                        <div className="stat-icon bg-purple-light">
                            <i className="fa-solid fa-bolt"></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem' }}>
                                {courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0}%
                            </h3>
                            <p style={{ color: 'var(--text-gray)' }}>Overall Progress</p>
                        </div>
                    </Card>
                </Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-xl)' }}>
                <Link to="/student/view-progress" className="no-underline">
                    <h2 className="section-title" style={{ margin: 0, cursor: 'pointer' }}>My Registered Courses</h2>
                </Link>
                <Link to="/student/view-progress" style={{ color: 'var(--secondary-color)', fontSize: '0.9rem', fontWeight: 600 }}>View All</Link>
            </div>

            <div className="grid-3" style={{ marginTop: 'var(--spacing-md)' }}>
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map(course => (
                        <Link key={course._id} to={`/student/course/${course._id}#materials`} className="no-underline">
                            <Card style={{ display: 'flex', flexDirection: 'column', padding: '20px', height: '100%' }} className="clickable">
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                                        {course.code}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0 0 10px 0' }}>{course.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', margin: '0 0 20px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {course.description}
                                </p>
                                <div style={{ display: 'flex', marginTop: 'auto' }}>
                                    <span
                                        className="clickable"
                                        style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--white)',
                                            fontWeight: 600,
                                            background: 'var(--secondary-color)',
                                            padding: '6px 14px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Continue Learning <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: 'var(--text-gray)', margin: 0 }}>You haven't registered for any courses yet.</p>
                        <Link to="/student/courses">
                            <Button variant="primary" style={{ marginTop: '15px' }}>Explore Courses</Button>
                        </Link>
                    </Card>
                )}
            </div>

            <h2 className="section-title" style={{ marginTop: 'var(--spacing-xl)' }}>Quick Access</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/student/courses" style={{ flex: 1, textDecoration: 'none' }}>
                    <Card className="clickable" style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '1.5rem', color: 'var(--secondary-color)' }}>
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div style={{ fontWeight: 600 }}>Browse All Courses</div>
                    </Card>
                </Link>
                <Link to="/student/view-progress" style={{ flex: 1, textDecoration: 'none' }}>
                    <Card className="clickable" style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div style={{ fontWeight: 600 }}>Registered Courses</div>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default StudentDashboard;
