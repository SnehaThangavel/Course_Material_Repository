import React, { useEffect, useState } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter } from 'lucide-react';
import api from '../../services/api';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const filterStatus = queryParams.get('status');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Always fetch fresh user profile to get current completedCourses
                const [coursesRes, profileRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/auth/me')
                ]);

                const allCourses = coursesRes.data;
                const freshCompletedIds = (profileRes.data.completedCourses || []).map(id => id.toString());
                setCompletedIds(freshCompletedIds);
                setCourses(allCourses);

                if (filterStatus === 'completed') {
                    setFilteredCourses(allCourses.filter(c => freshCompletedIds.includes(c._id.toString())));
                } else {
                    setFilteredCourses(allCourses);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [filterStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/student/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const isCompleted = (courseId) => {
        return completedIds.includes(courseId.toString());
    };

    if (loading) return <div className="loading-container">Loading...</div>;

    const pageTitle = filterStatus === 'completed' ? 'My Completed Courses' : 'All Courses';

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>{pageTitle}</h1>
                    {filterStatus === 'completed' && (
                        <Link to="/student/courses" style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', textDecoration: 'underline' }}>
                            View All
                        </Link>
                    )}
                </div>

                <form onSubmit={handleSearch} style={{
                    display: 'flex',
                    gap: '10px',
                    background: 'white',
                    padding: '8px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    width: '100%',
                    maxWidth: '400px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '10px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                padding: '8px 12px',
                                fontSize: '0.95rem',
                                width: '100%',
                                background: 'transparent'
                            }}
                        />
                    </div>
                    <Button type="submit" variant="primary" style={{ padding: '8px 20px', borderRadius: '8px' }}>
                        Search
                    </Button>
                </form>
            </div>

            <div className="grid-3">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <Card key={course._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-color)', background: '#eef6fc', padding: '4px 8px', borderRadius: '4px' }}>
                                        {course.code}
                                    </span>
                                    {isCompleted(course._id) &&
                                        <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                                            <i className="fa-solid fa-check-circle"></i> Completed
                                        </span>
                                    }
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>{course.title}</h3>
                                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                    {course.description.substring(0, 100)}...
                                </p>
                            </div>
                            <Link to={`/student/course/${course._id}`}>
                                <Button style={{ width: '100%' }}>View Course</Button>
                            </Link>
                        </Card>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: 'var(--text-gray)' }}>
                            {filterStatus === 'completed' ? "You haven't completed any courses yet." : "No courses found."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseList;
